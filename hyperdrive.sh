#!/bin/bash

# @TODO: check for internet first?
# @TODO: check if there is an update to this script?

# Set defaults options
OPTION_HELP=${HYPERDRIVE_HELP:-false}
OPTION_AUTOYES=${HYPERDRIVE_YES:-false}
OPTION_NAME=${HYPERDRIVE_NAME:-none}
OPTION_EMAIL=${HYPERDRIVE_EMAIL:-none}
OPTION_EDITOR=${HYPERDRIVE_EDITOR:-none}

# Set implied options
OPTION_GITCONFIG=${HYPERDRIVE_YES:-false}
OPTION_SSHKEYS=${HYPERDRIVE_YES:-false}

# Source all our libraries if they exist and we arent in a prod build
if [ -z "$HYPERDRIVE_VERSION" ]; then
  for LIB in ./lib/*.sh; do
    source $LIB
  done
fi

# Fail if running as root
if [[ $USER == "root" ]]; then
  error "This script CANNOT be run as root!" 1
fi

# Discover our OS
if [[ $OSTYPE == "darwin"* ]]; then
  OS="darwin"
elif [ -f /etc/os-release ]; then
  source /etc/os-release
  OS="$ID_LIKE"
  OS="$ID"
elif [ -f /etc/arch-release ]; then
  OS="arch"
elif [ -f /etc/debian_version ]; then
  OS="debian"
elif [ -f /etc/fedora-release ]; then
  OS="fedora"
elif [ -f /etc/gentoo-release ]; then
  OS="gentoo"
elif [ -f /etc/redhat-release ]; then
  OS="redhat"
else
  OS="whoknows"
fi

# Fail here on unsupported OSz
# Do stuff on each distro
case $OS in
  darwin|debian|ubuntu|elementary|mint)
    ;;
  *)
    error "This operating system is not currently supported!" 2
    ;;
esac

# PARSE THE ARGZZ AND OPTZ
while (( "$#" )); do
  case "$1" in

    # Name option handling
    --name|--name=*)
      if [ "${1##--name=}" != "$1" ]; then
        OPTION_NAME="${1##--name=}"
        shift
      else
        OPTION_NAME=$2
        shift 2
      fi
      ;;

    # Email option handling
    --email|--email=*)
      if [ "${1##--email=}" != "$1" ]; then
        OPTION_EMAIL="${1##--email=}"
        shift
      else
        OPTION_EMAIL=$2
        shift 2
      fi
      ;;

    # Help option handling
    -h|--help)
      shift
      OPTION_HELP=true
      print_hyperdrive
      echo -e ""
      print_usage
      exit 1
      ;;

    # Help option handling
    -v|--version)
      shift
      if [ ! -z "$HYPERDRIVE_VERSION" ]; then
        echo -e "$HYPERDRIVE_VERSION"
      else
        echo "$(git describe --tags --always --abbrev=1)"
      fi
      exit 0
      ;;

    # Autoyes option handling
    -y|--yes)
      shift
      OPTION_AUTOYES=true
      OPTION_GITCONFIG=true
      OPTION_SSHKEYS=true
      ;;

    # Special opt handling?
    --)
      shift
      break
      ;;

    # Unsupported options handling
    -*|--*=)
      error "Error: Unsupported flag $1" 3 >&2
      ;;

    # Arg handling?
    *)
      shift
      ;;
  esac
done

# Show header if we aren't in autoyes
if [[ $OPTION_AUTOYES == "false" ]]; then
  print_interactive
  # Pause until we confirm the voyage
  read -n 1 -r -s -p "Otherwise PRESS ENTER so we can analyze your navicomputer" KEY
  if [[ $KEY = "" ]]; then
    echo ""
  else
    error "\nHyperspace jump aborted!" 3720
  fi
fi

# ITS A TRAP!
set -e
trap 'ret=$?; test $ret -ne 0 && printf "FAILED WITH CODE $ret!\n\n" >&2; exit $ret' EXIT

# GEt started
clear
print_hyperdrive
echo -e ""

# OS
# If we get this far the below will always be true so we dont need to do a lot
OS_INSTALLED=true
OS_STATUS=$(status_good $OS)
progress_bar 1 "Determining operating system" "$OS_STATUS"

# PACKAGE MANAGER
case $OS in
  debian|ubuntu|elementary|mint)
    PKGMGR=aptitude
    PKGMGR_SCAN=true
    ;;
  darwin)
    PKGMGR=brew
    PKGMGR_SCAN="brew --version"
    ;;
esac
$PKGMGR_SCAN &>/dev/null && export PKGMGR_INSTALLED=true || export PKGMGR_INSTALLED=false
if [[ $PKGMGR_INSTALLED == "true" ]]; then
  PKGMGR_STATUS=$(status_good $PKGMGR)
else
  PKGMGR_STATUS=$(status_bad none)
fi
progress_bar 1 "Determining package manager" "$PKGMGR_STATUS"

# CURL
curl --version &>/dev/null && export CURL_INSTALLED=true || export CURL_INSTALLED=false
if [[ $CURL_INSTALLED == "true" ]]; then
  CURL_VERSION=$(curl --version | sed -n 1p | awk -F" " '{print $2}')
  update_check "curl" $CURL_VERSION $CURL_MIN_VERSION
else
  CURL_STATUS=$(status_bad "not installed")
fi
progress_bar 1 "Determining curl version" "$CURL_STATUS"

# GIT
git --version &>/dev/null && export GIT_INSTALLED=true || export GIT_INSTALLED=false
if [[ $GIT_INSTALLED == "true" ]]; then
  GIT_VERSION=$(git --version | awk -F" " '{print $3}')
  update_check "git" $GIT_VERSION $GIT_MIN_VERSION
else
  GIT_STATUS=$(status_bad "not installed")
fi
progress_bar 1 "Determining git version" "$GIT_STATUS"

# GIT NAME
if [[ $OPTION_NAME == 'none' ]]; then HELPER_NAME="Joe Example"; else HELPER_NAME="$OPTION_NAME"; fi
git config --get user.name &>/dev/null && export GITNAME_INSTALLED=true || export GITNAME_INSTALLED=false
if [[ $GITNAME_INSTALLED == "true" ]]; then
  GITNAME_STATUS=$(status_good "$(git config --get user.name)")
else
  GITNAME_STATUS=$(status_bad "not set")
  GITNAME_ACTION="git config --global user.name '${HELPER_NAME}'"
fi
progress_bar 1 "Checking for git config user name" "$GITNAME_STATUS"

# GIT EMAIL
if [[ $OPTION_EMAIL == 'none' ]]; then HELPER_EMAIL="joe@example.org"; else HELPER_EMAIL="$OPTION_EMAIL"; fi
git config --get user.email &>/dev/null && export GITEMAIL_INSTALLED=true || export GITEMAIL_INSTALLED=false
if [[ $GITEMAIL_INSTALLED == "true" ]]; then
  GITEMAIL_STATUS=$(status_good "$(git config --get user.email)")
else
  GITEMAIL_STATUS=$(status_bad "not set")
  GITEMAIL_ACTION="git config --global user.email ${HELPER_EMAIL}"
fi
progress_bar 1 "Checking for git config user email" "$GITEMAIL_STATUS"

# NODE
node --version &>/dev/null && export NODE_INSTALLED=true || export NODE_INSTALLED=false
if [[ $NODE_INSTALLED == "true" ]]; then
  NODE_VERSION=$(node --version | cut -c 2-)
  update_check "node" $NODE_VERSION $NODE_MIN_VERSION $NODE_MAX_VERSION
else
  NODE_STATUS=$(status_bad "not installed")
fi
progress_bar 1 "Determining node version" "$NODE_STATUS"

# YARN
yarn --version &>/dev/null && export YARN_INSTALLED=true || export YARN_INSTALLED=false
if [[ $YARN_INSTALLED == "true" ]]; then
  YARN_VERSION=$(yarn --version)
  update_check "yarn" $YARN_VERSION $YARN_MIN_VERSION
else
  YARN_STATUS=$(status_bad "not installed")
fi
progress_bar 1 "Determining yarn version" "$YARN_STATUS"

# DOCKER
docker --version &>/dev/null && export DOCKER_INSTALLED=true || export DOCKER_INSTALLED=false
if [[ $DOCKER_INSTALLED == "true" ]]; then
  DOCKER_VERSION=$(docker --version | awk -F" " '{print $3}' | awk -F"," '{print $1}' |  awk -F"-ce" '{print $1}')
  update_check "docker" $DOCKER_VERSION $DOCKER_MIN_VERSION
else
  DOCKER_STATUS=$(status_bad "not installed")
fi
progress_bar 1 "Determining docker version" "$DOCKER_STATUS"

# LANDO
lando version &>/dev/null && export LANDO_INSTALLED=true || export LANDO_INSTALLED=false
if [[ $LANDO_INSTALLED == "true" ]]; then
  LANDO_VERSION=$(lando version | cut -c 2-)
  update_check "lando" $LANDO_VERSION $LANDO_MIN_VERSION
else
  LANDO_STATUS=$(status_bad "not installed")
fi
progress_bar 1 "Determining lando version" "$LANDO_STATUS"

# SSHKEY
ssh-keygen -l -f "$HOME/.ssh/id_rsa.pub" &>/dev/null && export SSHKEY_INSTALLED=true || export SSHKEY_INSTALLED=false
if [[ $SSHKEY_INSTALLED == "true" ]]; then
  SSHKEY_STATUS=$(status_good "$(ssh-keygen -l -f $HOME/.ssh/id_rsa.pub | awk -F" " '{print $3}')")
else
  SSHKEY_STATUS=$(status_bad "not set")
  SSHKEY_ACTION="ssh-keygen"
fi
progress_bar 1 "Checking for ssh public key" "$SSHKEY_STATUS"

# Tabulating results
# NOTE: this doesn't actually do anythign but it really adds to the
# ms-dos bootup experience
progress_bar 3 "Reticulating"
echo -e ""

# UX things
progress_bar 2 "Computing results matrix"
DEPS=("os" "pkgmgr" "curl" "git" "gitname" "gitemail" "node" "yarn" "docker" "lando" "sshkey")
# print_results expects that at least DEP_INSTALLED and DEP_STATUS exist, optionally DEP_VERSION or DEP_ACTION
print_results "${DEPS[@]}"

# Describe to the user what is going to happen and ask for their permission
# to proceed
echo -e "\033[35mNOW I WANT TO ASK YOU A BUNCH OF QUESTIONS AND I WANT TO HAVE THEM ANSWERED IMMEDIATELY!\033[39m\n"

# Show confirm message if we aren't in autoyes
if [[ $OPTION_AUTOYES == "false" ]]; then
  read -r -p "Do you wish for this script to take the recommended actions marked above? [Y/n]" CONFIRM
  case $CONFIRM in
    [yY][eE][sS]|[yY])
      echo
      ;;
    [nN][oO]|[nN])
      error "So be it!" 0
      ;;
    *)
      error "Invalid response..." 5
      ;;
  esac
fi

# Attempt to get email, address and editor if needed
if [[ $OPTION_NAME == "none" && $GITNAME_INSTALLED == "false" ]]; then
  read -r -p "What is your name? " OPTION_NAME
fi
if [[ $OPTION_EMAIL == "none" && $GITEMAIL_INSTALLED == "false" ]]; then
  read -r -p "What is your email? " OPTION_EMAIL
fi

# @TODO: add in editor stuff

# Do distro specific stuff
case $OS in
  debian|ubuntu|elementary)
    install_debian
    ;;
  darwin)
    install_darwin
    ;;
esac

# Do stuff that should be the same across POSIX
install_posix

# WEDUNIT
echo -e "\033[32mInstallation complete. You have made it into hyperspace!\033[39m"
echo -e "Please run again if you want to verify installation success."

# Docker notez
if [[ $DOCKER_INSTALLED == "false" && $OS != "darwin" ]]; then
  echo -e "\n\033[5;93mNote that you need to logout and login to be able to use Docker correctly!!!\033[25;39m\n"
fi

exit 0

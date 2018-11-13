#!/bin/bash

# Fail if running as root
if [[ $USER == "root" ]]; then
  echo "This script CANNOT be run as root!"
  exit 1
fi

# Set defaults options
OPTION_HELP=${HYPERDRIVE_HELP:-false}
OPTION_AUTOYES=${HYPERDRIVE_YES:-false}
OPTION_NAME=${HYPERDRIVE_NAME:-none}
OPTION_EMAIL=${HYPERDRIVE_EMAIL:-none}
OPTION_EDITOR=${HYPERDRIVE_EDITOR:-none}

# Set implied options
OPTION_GITCONFIG=${HYPERDRIVE_YES:-false}
OPTION_SSHKEYS=${HYPERDRIVE_YES:-false}

# SET VERSION RECS
GIT_VERSION="2."
NODE_VERSION="10."
YARN_VERSION="1.21."
DOCKER_VERSION="18."
LANDO_VERSION="3.0.0-rc."

# Some other helpful vars
NI="\e[91mnot installed\e[39m"

# ASSUME macoS
: ${OS:=darwin}

# OTHERWISE LINUX THINGS
if [ -f /etc/os-release ]; then
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
  darwin|debian|ubuntu|elementary)
    ;;
  *)
    echo "This operating system is not currently supported!"
    exit 2
    ;;
esac

# Determine the package manager
PKGMGR="none"
case $OS in
  manjaro|arch)
    PKGMGR="pacman"
    PKGMGR_SCAN="echo pacman"
    ;;
  debian|ubuntu|elementary)
    PKGMGR="aptitude"
    PKGMGR_SCAN="echo aptitude"
    ;;
  fedora|redhat)
    PKGMGR="dnf"
    PKGMGR_SCAN="echo dnf"
    ;;
  darwin)
    PKGMGR="brew"
    PKGMGR_SCAN="brew --version 2>/dev/null | sed 2d"
    ;;
esac

# Source all our libraries if the exist and we arent in a prod build
if [ -z "$HYPERDRIVE_VERSION" ]; then
  for LIB in ./lib/*.sh; do
    source $LIB
  done
fi

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
    -h)
      shift
      OPTION_HELP=true
      print_usage
      exit 1
      ;;

    # Autoyes option handling
    -y)
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
      echo "Error: Unsupported flag $1" >&2
      exit 1
      ;;

    # Arg handling?
    *)
      shift
      ;;
  esac
done

# Show header if we aren't in autoyes
if [ "$OPTION_AUTOYES" == "false" ]; then
  print_interactive
  # Pause until we confirm the voyage
  read -n 1 -r -s -p "Otherwise PRESS ENTER so we can analyze your navicomputer" KEY
  if [[ $KEY = "" ]]; then
    echo ""
  else
    echo -e "\n\e[91mABORTED!\e[39m"
    exit 666
  fi
fi

# ITS A TRAP!
trap 'ret=$?; test $ret -ne 0 && printf "FAILED WITH CODE $ret!\n\n" >&2; exit $ret' EXIT
clear
set -e
print_hyperdrive
echo -e ""

# Scan all our dependencies
# NOTE: scan_dependency exports STATUS and ACTION mesages as envvars eg GIT_STATUS/GIT_ACTION
scan_dependency "os" "echo $OS" "\e[91mnot supported\e[39m"
scan_dependency "pkgmgr" "$PKGMGR_SCAN" "\e[91mnone\e[39m"
scan_dependency "git" "git --version" "$NI" "install git" "$GIT_VERSION"
scan_dependency "gitname" "git config --get user.name" "\e[91mnot set\e[39m" "run 'git config --global user.name \"My Name\""
scan_dependency "gitemail" "git config --get user.email" "\e[91mnot set\e[39m" "run 'git config --global user.email me@somewhere.com"
scan_dependency "node" "node -v" "$NI" "install latest node ${NODE_VERSION}.x" "$NODE_VERSION"
scan_dependency "yarn" "yarn -v" "$NI" "install latest yarn ${YARN_VERSION}x" "$YARN_VERSION"
scan_dependency "docker" "docker --version" "$NI" "install latest docker ${DOCKER_VERSION}x" "$DOCKER_VERSION"
scan_dependency "lando" "lando --version" "$NI" "install latest lando ${LANDO_VERSION}x"
scan_dependency "sshkey" "ssh-keygen -l -f ~/.ssh/id_rsa.pub" "\e[91mno ticket!\e[39m" "run 'ssh-keygen'"

# Show fancy things are happening
progress_bar 1 "Determining operating system" "$OS_STATUS"
progress_bar 1 "Determining package manager" "$PKGMGR_STATUS"
progress_bar 1 "Determining git version" "$GIT_STATUS"
progress_bar 1 "Checking for git config user name" "$GITNAME_STATUS"
progress_bar 1 "Checking for git config user email" "$GITEMAIL_STATUS"
progress_bar 1 "Determining node version" "$NODE_STATUS"
progress_bar 1 "Determining yarn version" "$YARN_STATUS"
progress_bar 1 "Determining docker version" "$DOCKER_STATUS"
progress_bar 1 "Determining lando version" "$LANDO_STATUS"
progress_bar 1 "Checking for ssh public key" "$SSHKEY_STATUS"

# Tabulating results
# NOTE: this doesn't actually do anythign but it really adds to the
# ms-dos bootup experience
progress_bar 3 "Reticulating"
echo -e ""

# UX things
progress_bar 2 "Computing results matrix"
DEPS=("os" "pkgmgr" "git" "gitname" "gitemail" "node" "yarn" "docker" "lando" "sshkey")
print_results "${DEPS[@]}"

# Describe to the user what is going to happen and ask for their permission
# to proceed
echo -e "\e[95mNOW I WANT TO ASK YOU A BUNCH OF QUESTIONS AND I WANT TO HAVE THEM ANSWERED IMMEDIATELY!\e[39m\n"
echo -e "Do you wish for this script to take the recommended actions marked above?"

# Do stuff on each distro
case $OS in
  debian|ubuntu|elementary)
    #sudo apt-get update -y --force-yes \
    #  && sudo apt-get upgrade -y --force-yes \
    #  && sudo apt-get -y --force-yes install \
    #    git-core \
    #    curl
    ;;
  darwin)
    echo "Not implemented yet!"
    ;;
esac




exit 0
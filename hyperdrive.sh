#!/bin/bash

# @TODO: check for internet first?
# @TODO: check if there is an update to this script?

# Set defaults options
OPTION_HELP=${HYPERDRIVE_HELP:-false}
OPTION_AUTOYES=${HYPERDRIVE_YES:-false}
OPTION_NAME=${HYPERDRIVE_NAME:-none}
OPTION_EMAIL=${HYPERDRIVE_EMAIL:-none}
OPTION_VIM=${HYPERDRIVE_VIM:-false}

# Source all our things if they exist and we arent in a prod build
if [ -z "$HYPERDRIVE_VERSION" ]; then
  # @NOTE: We load these first because these are used in everything else
  for LIB in ./lib/*.sh; do
    source $LIB
  done
  for CHECK in ./checks/*.sh; do
    source $CHECK
  done
    for INSTALLER in ./installers/*.sh; do
    source $INSTALLER
  done
fi

# Discover the OS
discover_os

# Fail if running as root
if [[ $USER == "root" ]]; then
  error "This script CANNOT be run as root!" 1
fi

# Fail on unsupported OSz
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
    --name|--name=*)
      if [ "${1##--name=}" != "$1" ]; then
        OPTION_NAME="${1##--name=}"
        shift
      else
        OPTION_NAME=$2
        shift 2
      fi
      ;;
    --email|--email=*)
      if [ "${1##--email=}" != "$1" ]; then
        OPTION_EMAIL="${1##--email=}"
        shift
      else
        OPTION_EMAIL=$2
        shift 2
      fi
      ;;
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
    # Vim option handling
    --vim)
      shift
      OPTION_VIM=true
      ;;
    # Autoyes option handling
    -y|--yes)
      shift
      OPTION_AUTOYES=true
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

##
# All the "check" functions should define at least the required variables below.
# Scan ./checks/*.sh for some examples
#
# @export {Required Boolean} [DEP_INSTALLED=false]
#   - Whether the dependency is already installed and doesnt need to be updated
# @export {Required String} [DEP_STATUS=not installed]
#   - A colored string containing that status of the dependency, usually a version or brief message
# @export {String} DEP_VERSION
#   - A string containing the detected version of the dependency
# @export {String} [DEP_ACTION=do nothing]
#   - The action hyperdrive should take to install the dependency
#
# @example
# OS_INSTALLED=true
# OS_STATUS=$(status_good "elementary")
# OS_VERSION=Elementary OS
# OS_ACTION=$(status_good "Rejoice!")

# OS
check_os
progress_bar 1 "Determining operating system" "$OS_STATUS"

# PACKAGE MANAGER
check_pkgmgr
progress_bar 1 "Determining package manager" "$PKGMGR_STATUS"

# CURL
check_curl
progress_bar 1 "Determining curl version" "$CURL_STATUS"

# GIT
check_git
progress_bar 1 "Determining git version" "$GIT_STATUS"

# GIT NAME
check_gitname
progress_bar 1 "Checking for git config user name" "$GITNAME_STATUS"

# GIT EMAIL
check_gitemail
progress_bar 1 "Checking for git config user email" "$GITEMAIL_STATUS"

# NODE
check_node
progress_bar 1 "Determining node version" "$NODE_STATUS"

# YARN
check_yarn
progress_bar 1 "Determining yarn version" "$YARN_STATUS"

# DOCKER
check_docker
progress_bar 1 "Determining docker version" "$DOCKER_STATUS"

# LANDO
check_lando
progress_bar 1 "Determining lando version" "$LANDO_STATUS"

# SSHKEY
check_sshkey
progress_bar 1 "Checking for ssh public key" "$SSHKEY_STATUS"

# VIM
if [[ $OPTION_VIM == "true" ]]; then
  check_vim
  progress_bar 1 "Checking for vim version" "$VIM_STATUS"
  check_vimconf
  progress_bar 1 "Checking for vim config version" "$VIMCONF_STATUS"
fi

# Tabulating results
# NOTE: this doesn't actually do anythign but it really adds to the ms-dos bootup experience
progress_bar 3 "Reticulating"
echo -e ""

# UX things
progress_bar 2 "Computing results matrix"

# Define our core dependencies
DEPS=("os" "pkgmgr" "curl" "git" "gitname" "gitemail" "node" "yarn" "docker" "lando" "sshkey")
# Add in VIM if its been specified
if [[ $OPTION_VIM == "true" ]]; then
  DEPS+=('vim vimconf')
fi

# Print the things
print_results "${DEPS[@]}"

# Describe to the user what is going to happen and ask for their permission to proceed
echo -e "\033[35mNOW I WANT TO ASK YOU A BUNCH OF QUESTIONS AND I WANT TO HAVE THEM ANSWERED IMMEDIATELY!\033[39m\n"
# Show confirm message if we aren't in autoyes
if [[ $OPTION_AUTOYES == "false" ]]; then
  read -r -p "Do you wish for this script to take the recommended actions marked above? [y/n]" CONFIRM
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

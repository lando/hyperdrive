#!/bin/bash

##
# Sets variables containing the status of the gitname dependency
##
check_gitname() {
  # Use any passed in options so we can provice better action message
  if [[ $OPTION_NAME == 'none' ]]; then
    HELPER_NAME="Joe Example";
  else
    HELPER_NAME="$OPTION_NAME";
  fi
  # Do the initial installed check
  git config --get user.name &>/dev/null && GITNAME_INSTALLED=true || GITNAME_INSTALLED=false
  # Set the installed status message
  if [[ $GITNAME_INSTALLED == "true" ]]; then
    GITNAME_STATUS=$(status_good "$(git config --get user.name)")
  # Otherwise set the uninstalled one
  else
    GITNAME_STATUS=$(status_bad "not set")
    GITNAME_ACTION=$(status_warn "git config --global user.name '${HELPER_NAME}'")
  fi
}

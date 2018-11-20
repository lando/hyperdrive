#!/bin/bash

# Min git version
GIT_MIN_VERSION=2.7.0

##
# Sets variables containing the status of the git dependency
##
check_git() {
  # Do the initial installed check
  git --version &>/dev/null && GIT_INSTALLED=true || GIT_INSTALLED=false
  # If installed make sure we have a supported version
  if [[ $GIT_INSTALLED == "true" ]]; then
    GIT_VERSION=$(git --version | awk -F" " '{print $3}')
    GIT_STATUS=$(status_good "$GIT_VERSION")
    semverGTE $GIT_VERSION $GIT_MIN_VERSION || GIT_INSTALLED=false
    semverGTE $GIT_VERSION $GIT_MIN_VERSION || GIT_STATUS=$(status_warn "$GIT_VERSION")
    semverGTE $GIT_VERSION $GIT_MIN_VERSION || GIT_ACTION=$(status_warn "upgrade git")
  # Otherwise set the uninstalled status
  else
    GIT_STATUS=$(status_bad "not installed")
    GIT_ACTION=$(status_warn "install git")
  fi
}

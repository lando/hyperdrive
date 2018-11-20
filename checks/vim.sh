#!/bin/bash

# Min vim version
VIM_MIN_VERSION=7.3.0

##
# Sets variables containing the status of the vim dependency
##
check_vim() {
  # Do the initial installed check
  vim --version &>/dev/null && VIM_INSTALLED=true || VIM_INSTALLED=false
  # If installed make sure we have a supported version
  if [[ $VIM_INSTALLED == "true" ]]; then
    VIM_VERSION=$(vim --version | head -n 1 | awk -F" " '{print $5}').0
    VIM_STATUS=$(status_good "$VIM_VERSION")
    semverGTE $VIM_VERSION $VIM_MIN_VERSION || VIM_INSTALLED=false
    semverGTE $VIM_VERSION $VIM_MIN_VERSION || VIM_STATUS=$(status_warn "$VIM_VERSION")
    semverGTE $VIM_VERSION $VIM_MIN_VERSION || VIM_ACTION=$(status_warn "upgrade vim")
  # Otherwise set the uninstalled status
  else
    VIM_STATUS=$(status_bad "not installed")
    VIM_ACTION=$(status_warn "install vim")
  fi
}

#!/bin/bash

# Min lando version
LANDO_MIN_VERSION=3.0.0-rc.2

##
# Sets variables containing the status of the lando dependency
##
check_lando() {
  # Do the initial installed check
  lando version &>/dev/null && LANDO_INSTALLED=true || LANDO_INSTALLED=false
  # If installed make sure we have a supported version
  if [[ $LANDO_INSTALLED == "true" ]]; then
    LANDO_VERSION=$(lando version | cut -c 2-)
    LANDO_STATUS=$(status_good "$LANDO_VERSION")
    semverGTE $LANDO_VERSION $LANDO_MIN_VERSION || LANDO_INSTALLED=false
    semverGTE $LANDO_VERSION $LANDO_MIN_VERSION || LANDO_STATUS=$(status_warn "$LANDO_VERSION")
    semverGTE $LANDO_VERSION $LANDO_MIN_VERSION || LANDO_ACTION=$(status_warn "upgrade lando")
  # Otherwise set the uninstalled status
  else
    LANDO_STATUS=$(status_bad "not installed")
    LANDO_ACTION=$(status_warn "install lando")
  fi
}

#!/bin/bash

# Min yarn version
YARN_MIN_VERSION=1.12.0

##
# Sets variables containing the status of the yarn dependency
##
check_yarn() {
  # Do the initial installed check
  yarn --version &>/dev/null && YARN_INSTALLED=true || YARN_INSTALLED=false
  # If installed make sure we have a supported version
  if [[ $YARN_INSTALLED == "true" ]]; then
    YARN_VERSION=$(yarn --version)
    YARN_STATUS=$(status_good "$YARN_VERSION")
    semverGTE $YARN_VERSION $YARN_MIN_VERSION || YARN_INSTALLED=false
    semverGTE $YARN_VERSION $YARN_MIN_VERSION || YARN_STATUS=$(status_warn "$YARN_VERSION")
    semverGTE $YARN_VERSION $YARN_MIN_VERSION || YARN_ACTION=$(status_warn "upgrade yarn")
  # Otherwise set the uninstalled status
  else
    YARN_STATUS=$(status_bad "not installed")
    YARN_ACTION=$(status_warn "install yarn")
  fi
}

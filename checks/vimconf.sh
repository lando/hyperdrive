#!/bin/bash

# Min VIMCONF version
if [ ! -z "$HYPERDRIVE_VERSION" ]; then
  MIN_VIMCONF_VERSION=$(echo "$HYPERDRIVE_VERSION" | cut -c 2-)
else
  MIN_VIMCONF_VERSION=$(git describe --tags --always --abbrev=0 | cut -c 2-)
fi

##
# Sets variables containing the status of the vim conf dependency
##
check_vimconf() {
  # Do the initial installed check
  cat ~/.hyperdrive/version &>/dev/null && VIMCONF_INSTALLED=true || VIMCONF_INSTALLED=false
  # If installed make sure we have a supported version
  if [[ $VIMCONF_INSTALLED == "true" ]]; then
    VIMCONF_VERSION=$(cat ~/.hyperdrive/version)
    VIMCONF_STATUS=$(status_good "$VIMCONF_VERSION")
    semverGTE $VIMCONF_VERSION $MIN_VIMCONF_VERSION || VIMCONF_INSTALLED=false
    semverGTE $VIMCONF_VERSION $MIN_VIMCONF_VERSION || VIMCONF_STATUS=$(status_warn "$VIMCONF_VERSION")
    semverGTE $VIMCONF_VERSION $MIN_VIMCONF_VERSION || VIMCONF_ACTION=$(status_warn "upgrade vim conf")
  # Otherwise set the uninstalled status
  else
    VIMCONF_STATUS=$(status_bad "not installed")
    VIMCONF_ACTION=$(status_warn "install hyperdrive vim conf")
  fi
}

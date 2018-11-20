#!/bin/bash

# Min and max node version
NODE_MIN_VERSION=10.13.0
NODE_MAX_VERSION=10.99.99

##
# Sets variables containing the status of the node dependency
##
check_node() {
  # Do the initial installed check
  node --version &>/dev/null && NODE_INSTALLED=true || NODE_INSTALLED=false
  # If installed make sure we have a supported version
  if [[ $NODE_INSTALLED == "true" ]]; then
    NODE_VERSION=$(node --version | cut -c 2-)
    NODE_STATUS=$(status_good "$NODE_VERSION")
    semverGTE $NODE_VERSION $NODE_MIN_VERSION || NODE_INSTALLED=false
    semverGTE $NODE_VERSION $NODE_MIN_VERSION || NODE_STATUS=$(status_warn "$NODE_VERSION")
    semverGTE $NODE_VERSION $NODE_MIN_VERSION || NODE_ACTION=$(status_warn "upgrade to node $NODE_MIN_VERSION")
    semverGT $NODE_MAX_VERSION $NODE_VERSION || NODE_INSTALLED=false
    semverGT $NODE_MAX_VERSION $NODE_VERSION || NODE_STATUS=$(status_warn "$NODE_VERSION")
    semverGT $NODE_MAX_VERSION $NODE_VERSION || NODE_ACTION=$(status_warn "downgrade to between node $NODE_MIN_VERSION and $NODE_MAX_VERSION")
  # Otherwise set the uninstalled status
  else
    NODE_STATUS=$(status_bad "not installed")
    NODE_ACTION=$(status_warn "install node $NODE_MIN_VERSION")
  fi
}

#!/bin/bash

# Min yarn version
DOCKER_MIN_VERSION=18.0.0

##
# Sets variables containing the status of the docker dependency
##
check_docker() {
  # Do the initial installed check
  docker --version &>/dev/null && DOCKER_INSTALLED=true || DOCKER_INSTALLED=false
  # If installed make sure we have a supported version
  if [[ $DOCKER_INSTALLED == "true" ]]; then
    DOCKER_VERSION=$(docker --version | awk -F" " '{print $3}' | awk -F"," '{print $1}' |  awk -F"-ce" '{print $1}')
    DOCKER_STATUS=$(status_good "$DOCKER_VERSION")
    semverGTE $DOCKER_VERSION $DOCKER_MIN_VERSION || DOCKER_INSTALLED=false
    semverGTE $DOCKER_VERSION $DOCKER_MIN_VERSION || DOCKER_STATUS=$(status_warn "$DOCKER_VERSION")
    semverGTE $DOCKER_VERSION $DOCKER_MIN_VERSION || DOCKER_ACTION=$(status_warn "upgrade to $DOCKER_MIN_VERSION")
  # Otherwise set the uninstalled status
  else
    DOCKER_STATUS=$(status_bad "not installed")
    DOCKER_ACTION=$(status_warn "install docker $DOCKER_MIN_VERSION")
  fi
}

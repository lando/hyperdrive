#!/bin/bash

# Min curl version
CURL_MIN_VERSION=7.40.0

##
# Sets variables containing the status of the curl dependency
##
check_curl() {
  # Do the initial installed check
  curl --version &>/dev/null &&  CURL_INSTALLED=true ||  CURL_INSTALLED=false
  # If installed make sure we have a supported version
  if [[ $CURL_INSTALLED == "true" ]]; then
    CURL_VERSION=$(curl --version | sed -n 1p | awk -F" " '{print $2}')
    CURL_STATUS=$(status_good "$CURL_VERSION")
    semverGTE $CURL_VERSION $CURL_MIN_VERSION || CURL_INSTALLED=false
    semverGTE $CURL_VERSION $CURL_MIN_VERSION || CURL_STATUS=$(status_warn "$CURL_VERSION")
    semverGTE $CURL_VERSION $CURL_MIN_VERSION || CURL_ACTION=$(status_warn "upgrade curl")
  # Otherwise set the uninstalled status
  else
    CURL_STATUS=$(status_bad "not installed")
    CURL_ACTION=$(status_warn "install curl")
  fi
}

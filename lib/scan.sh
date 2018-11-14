#!/bin/bash

# Scan a dependency with
#
#   $1 name
#   $2 scanning command
#   $3 default not found message
#   $4 default action message
#   $5 version to compare
#
scan_dependency() {
  DEPENDENCY=${1:-OS}
  SCANNER=${2:-true}
  ACTION_MESSAGE=${4:-''}
  DEPENDENCY_VERSION=${5:-''}

  # Set the defaults
  # NOTE: we need to use export here because of the dynamic varibale names and
  # we need global scope
  STATUS_KEY="$(echo "$DEPENDENCY" | tr [a-z] [A-Z])_STATUS"
  ACTION_KEY="$(echo "$DEPENDENCY" | tr [a-z] [A-Z])_ACTION"
  INSTALLED_KEY="$(echo "$DEPENDENCY" | tr [a-z] [A-Z])_INSTALLED"
  export ${STATUS_KEY}="${3:-\033[91mnot installed\033[39m}"
  export ${ACTION_KEY}="do nothing"
  export ${INSTALLED_KEY}=true

  # Change the defaults if we need to
  $SCANNER &>/dev/null && export ${STATUS_KEY}="\033[32m$($SCANNER | sed -n 1p | cut -c1-32)\033[39m"
  ($SCANNER 2>/dev/null | grep "$DEPENDENCY_VERSION" &>/dev/null) || export ${ACTION_KEY}="\033[33m$ACTION_MESSAGE\033[39m" && export ${INSTALLED_KEY}=false
}

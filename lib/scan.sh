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
  DEPENDENCY="${1:-OS}"
  SCANNER="${2:-true}"
  ACTION_MESSAGE=${4:-''}
  DEPENDENCY_VERSION=${5:-''}

  # Set the defaults
  # NOTE: we need to use export here because of the dynamic varibale names and
  # we need global scope
  export ${DEPENDENCY^^}_STATUS="${3:-\e[91mnot installed\e[39m}"
  export ${DEPENDENCY^^}_ACTION="do nothing"

  # Change the defaults if we need to
  $SCANNER &>/dev/null && export ${DEPENDENCY^^}_STATUS="\e[92m$($SCANNER)\e[39m"
  ($SCANNER 2>/dev/null | grep "$DEPENDENCY_VERSION" &>/dev/null) || export ${DEPENDENCY^^}_ACTION="\e[93m$ACTION_MESSAGE\e[39m"
}

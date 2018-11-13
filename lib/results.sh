#!/bin/bash

# Print results
#
#   $1 array of dependencies
#
# NOTE: the dependencies must be the same as they were when invoked with
# scan_dependency
#
print_results() {
  RESULTS="\033[35mTHING|VERSION/STATUS|RECOMMENDED ACTION\033[39m\n"
  DEPS="$1"

  # Augment the results with our deps
  for DEP in ${DEPS[@]}; do
    STATUS_KEY="$(echo "$DEP" | tr [a-z] [A-Z])_STATUS"
    ACTION_KEY="$(echo "$DEP" | tr [a-z] [A-Z])_ACTION"
    STATUS="$(echo ${!STATUS_KEY})"
    ACTION="$(echo ${!ACTION_KEY})"
    RESULTS+="$DEP|$STATUS|$ACTION\n"
  done

  # Print the result
  echo -e ""
  echo -e "$RESULTS" | column -t -s "|"
  echo -e ""
}

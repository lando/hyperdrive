#!/bin/bash

# Print results
#
#   $1 array of dependencies
#
# NOTE: the dependencies must be the same as they were when invoked with
# scan_dependency
#
print_results() {
  RESULTS="\e[95mTHING|VERSION/STATUS|RECOMMENDED ACTION\e[39m\n"
  DEPS="$1"

  # Augment the results with our deps
  for DEP in ${DEPS[@]}; do
    STATUS_KEY=${DEP^^}_STATUS
    STATUS="$(echo ${!STATUS_KEY})"
    ACTION_KEY=${DEP^^}_ACTION
    ACTION="$(echo ${!ACTION_KEY})"
    RESULTS+="$DEP|$STATUS|$ACTION\n"
  done

  # Print the result
  echo -e ""
  echo -e "$RESULTS" | column -t -s "|"
  echo -e ""
}

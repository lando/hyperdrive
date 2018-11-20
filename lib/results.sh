#!/bin/bash

# Print results from our dep checks.
#
# this requires each DEP passed in has at least DEP_INSTALLED and DEP_STATUS
# defined and optionally DEP_ACTION eg if one of the deps is "git" then you should
# have at least GIT_INSTALLED and GIT_STATUS defined
#
print_results() {
  DEPS="$1"

  # Define hte header
  RESULTS="\033[35mTHING|CURRENT VERSION/STATUS|RECOMMENDED ACTION\033[39m\n"
  # Augment the results with our deps
  for DEP in ${DEPS[@]}; do
    # Build our keys
    ACTION_KEY="$(echo "$DEP" | tr [a-z] [A-Z])_ACTION"
    INSTALLED_KEY="$(echo "$DEP" | tr [a-z] [A-Z])_INSTALLED"
    STATUS_KEY="$(echo "$DEP" | tr [a-z] [A-Z])_STATUS"
    # Get some stuff
    STATUS="$(echo ${!STATUS_KEY})"
    INSTALLED="$(echo ${!INSTALLED_KEY})"
    # Determine the action
    if [[ $INSTALLED == "true" ]]; then
      ACTION="do nothing"
    else
      ACTION="$(echo ${!ACTION_KEY})"
    fi
    # Set our results
    RESULTS+="$DEP|$STATUS|$ACTION\n"
  done

  # Print the result
  echo -e ""
  echo -e "$RESULTS" | column -t -s "|"
  echo -e ""
}

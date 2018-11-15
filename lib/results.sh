#!/bin/bash

# Print results
#
#   $1 array of dependencies
#
# NOTE: the dependencies must be the same as they were when invoked with
# scan_dependency
#
print_results() {
  RESULTS="\033[35mTHING|CURRENT VERSION/STATUS|RECOMMENDED ACTION|MIN VERSION|MAX VERSION\033[39m\n"
  DEPS="$1"

  # Augment the results with our deps
  for DEP in ${DEPS[@]}; do
    # Build our keys
    ACTION_KEY="$(echo "$DEP" | tr [a-z] [A-Z])_ACTION"
    INSTALLED_KEY="$(echo "$DEP" | tr [a-z] [A-Z])_INSTALLED"
    STATUS_KEY="$(echo "$DEP" | tr [a-z] [A-Z])_STATUS"

    # Version stuff
    VERSION_KEY="$(echo "$DEP" | tr [a-z] [A-Z])_VERSION"
    MIN_VERSION_KEY="$(echo "$DEP" | tr [a-z] [A-Z])_MIN_VERSION"
    MAX_VERSION_KEY="$(echo "$DEP" | tr [a-z] [A-Z])_MAX_VERSION"
    UPDATE_ACTION_KEY="$(echo "$DEP" | tr [a-z] [A-Z])_UPDATE_ACTION"

    # Determine the action
    INSTALLED="$(echo ${!INSTALLED_KEY})"
    VERSION="$(echo ${!VERSION_KEY})"
    MIN_VERSION="$(echo ${!MIN_VERSION_KEY})"
    MAX_VERSION="$(echo ${!MAX_VERSION_KEY})"
    UPDATE_ACTION="$(echo ${!UPDATE_ACTION_KEY})"
    CUSTOM_MESSAGE="$(echo ${!ACTION_KEY})"
    if [[ $INSTALLED == "true" ]]; then
      ACTION="do nothing"
    elif [ ! -z "$VERSION" ]; then
      ACTION=$(status_warn "$UPDATE_ACTION")
    elif [ -z "$VERSION" ]; then
      if [ ! -z "$CUSTOM_MESSAGE" ]; then
        ACTION=$(status_warn "$CUSTOM_MESSAGE")
      else
        ACTION=$(status_warn "install $DEP")
      fi
    else
      ACTION=$(status_warn "not sure")
    fi

    # Get our results
    STATUS="$(echo ${!STATUS_KEY})"
    RESULTS+="$DEP|$STATUS|$ACTION|$MIN_VERSION|$MAX_VERSION\n"
  done

  # Print the result
  echo -e ""
  echo -e "$RESULTS" | column -t -s "|"
  echo -e ""
}

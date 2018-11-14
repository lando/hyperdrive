#!/bin/bash
source ./lib/error.sh

# Error if no $1
if [ -z "$1" ]; then
  error "You need to specify a version eg './release.sh v0.1.0'"
fi

# Set our vars
NEW_VERSION=$1
GIT_MESSAGE="Release $1"
ANNOTATION=${2:-$GIT_MESSAGE}
DRY_RUN=${3:-false}

# Print some helpful things
if [[ $DRY_RUN != "false " ]]; then
  echo -e "\n\033[33mDRY RUN DETECTED\033[39m"
  echo -e "THIS SCRIPT IS NOT BEING RUN FOR REAL, ONLY SIMULATED"
fi


# Build the recommendDRYed commands
# GIT_COMMANDS=
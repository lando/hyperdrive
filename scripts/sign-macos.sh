#!/bin/bash
set -eo pipefail

# Get our file
FILE="$(pwd)/$1"

# Throw error if file does not exist
if [ ! -f "$FILE" ]; then
  echo "$FILE does not exist!"
  exit 1
fi
if [ -z "$APPLE_TEAM_ID" ]; then
  echo "APPLE_TEAM_ID needs to be set with your cert user id!"
  exit 4
fi

# Force the codesignature
codesign --force -s "$APPLE_TEAM_ID" "$FILE"
# Verify the code signature
codesign -v "$FILE" --verbose

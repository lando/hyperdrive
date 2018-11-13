#!/bin/bash

# Basic error handler
error() {
  MESSAGE=${1:-Something bad happened!}
  CODE=${2:-1}
  echo -e "\033[1;31m$MESSAGE\033[0m"
  exit $CODE
}

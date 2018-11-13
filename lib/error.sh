#!/bin/bash

# Basic error handler
error() {
  MESSAGE=${1:-Something bad happened!}
  CODE=${2:-1}
  echo -e "\e[91m$MESSAGE\e[39m"
  exit $CODE
}

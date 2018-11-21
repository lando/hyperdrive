#!/bin/bash

##
# Sets variables containing the status of the OS dependency
##
check_os() {
  OS_INSTALLED=true
  OS_STATUS=$(status_good $OS)
}

#!/bin/bash

# Helper to discover the OS
discover_os() {
  # Discover our OS
  if [[ $OSTYPE == "darwin"* ]]; then
    OS="darwin"
  elif [ -f /etc/os-release ]; then
    source /etc/os-release
    OS="$ID_LIKE"
    OS="$ID"
  elif [ -f /etc/arch-release ]; then
    OS="arch"
  elif [ -f /etc/debian_version ]; then
    OS="debian"
  elif [ -f /etc/fedora-release ]; then
    OS="fedora"
  elif [ -f /etc/gentoo-release ]; then
    OS="gentoo"
  elif [ -f /etc/redhat-release ]; then
    OS="redhat"
  else
    OS="whoknows"
  fi
}

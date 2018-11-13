#!/bin/bash

# A nice pink hyperdrive
print_hyperdrive() {
  echo -ne "\033[35m"
  cat << "EOF"
  _    _                          _      _
 | |  | |                        | |    (_)
 | |__| |_   _ _ __   ___ _ __ __| |_ __ ___   _____
 |  __  | | | | '_ \ / _ \ '__/ _` | '__| \ \ / / _ \
 | |  | | |_| | |_) |  __/ | | (_| | |  | |\ V /  __/
 |_|  |_|\__, | .__/ \___|_|  \__,_|_|  |_| \_/ \___|
          __/ | |
         |___/|_|
EOF
  echo -ne "\033[39m"
}

# Usage for the hyperdrive
print_usage() {
  cat << "EOF"
Usage: ./hyperdrive.sh [-yh] [--name name] [--email email]

Options:
  -h, --help                Show this help dialog
  -v, --version             Show the version
  -y, --yes                 Auto confirm all yes/no prompts

  --name                    My name eg "Jean Luc Picard"
  --email                   My email eg kirk@starfleet.mil

Examples:
  # Run bootscript interactively
  ./hyperdrive.sh

  # Show this usage dialog
  ./hyperdrive.sh -h

  # Run non-interactively
  ./hyperdrive.sh -y --name "Lando Calrissian" --email admin@thisfacility.com

EOF
}

# Interactive handler
print_interactive() {
  print_hyperdrive
  cat << "EOF"
 =======================================>  BOOTSCRIPT

A helper script to get you from a vanilla machine to a minimal Lando-based
dev environment in less than 12 par-steps. Generally this includes:
EOF
  echo -ne "\033[36m"
  cat << "EOF"

  1. git
  2. curl
  3. node
  4. yarn
  5. docker
  6. lando
  7. ssh keys
  9. vim or atom or https://www.youtube.com/watch?v=UsjoFZEwAyI

EOF
  echo -ne "\033[39m"
  cat << "EOF"
Please run `./hyperdrive.sh -h` if you are interested in pre-programming your
hyperdrive for autopilot (eg running this non-interactively).

EOF
}

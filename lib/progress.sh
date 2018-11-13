#!/bin/bash

# Show a progress bar for $1 seconds with $2 message and $3 completion message
#
# Modified from the original script by
# Ignacio Nunez Hernanz <nacho _a_t_ ownyourbits _d_o_t_ com>
#
# Copyleft 2018
# GPL licensed (see end of file) * Use at your own risk!
#
# Example: progress_bar 60 "Doing something important" "Success!"
#

progress_bar() {
  local DURATION=$1
  local MESSAGE="${2:-Doing task}"
  local MESSAGE_LENGTH=${#MESSAGE}
  local FINISHED_MESSAGE="${3:-\033[92mdone!\033[39m}"
  local INT=0.25
  local TIME=0
  local CURLEN=0
  local SECS=0
  local FRACTION=0
  local FB=2588
  local START=$(date +%s)

  trap "echo -e $( tput cnorm ); trap - SIGINT; return" SIGINT
  echo -ne "$( tput civis )\r$( tput el )$MESSAGE "

  while [ $SECS -lt $DURATION ]; do
    local WIDTH=40

    # main bar
    local L=$( bc -l <<< "( ( $WIDTH - 5 ) * $TIME ) / ($DURATION-$INT)" | awk '{ printf "%f", $0 }' )
    local N=$( bc -l <<< $L | awk '{ printf "%d", $0 }' )
    [ $FRACTION -ne 0 ] && echo -ne "$( tput cub 1 )"
    if [ $N -gt $CURLEN ]; then
      for i in $( seq 1 $(( N - CURLEN )) ); do
        echo -ne .
      done
      CURLEN=$N
    fi

    # percentage progress
    local PROGRESS=$( bc -l <<< "( 100 * $TIME ) / ($DURATION-$INT)" | awk '{ printf "%.0f", $0 }' )
    echo -ne "\033[95m$( tput sc )\033[39m"
    echo -ne "\r$( tput cuf $(( WIDTH + MESSAGE_LENGTH - 5 )) )"
    echo -ne " $PROGRESS%"
    echo -ne "$( tput rc )"

    TIME=$( bc -l <<< "$TIME + $INT" | awk '{ printf "%f", $0 }' )
    SECS=$( bc -l <<< $TIME | awk '{ printf "%d", $0 }' )

    # take into account loop execution time
    local END=$( date +%s )
    local DELTA=$( bc -l <<< "$INT - ( $END - $START )/1000000000" \
      | awk '{ if ( $0 > 0 ) printf "%f", $0; else print "0" }' )
    sleep $DELTA
    START=$( date +%s )
  done
  echo -ne "\033[39m"
  echo -ne "$FINISHED_MESSAGE"
  echo -ne "$( tput rc )"
  echo $( tput cnorm )
  echo -ne "\033[39m"
  trap - SIGINT
}

# License
#
# This script is free software; you can redistribute it and/or modify it
# under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This script is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this script; if not, write to the
# Free Software Foundation, Inc., 59 Temple Place, Suite 330,
# Boston, MA 02111-1307 USA
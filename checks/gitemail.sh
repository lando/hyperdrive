#!/bin/bash

##
# Sets variables containing the status of the gitemail dependency
##
check_gitemail() {
  # Use any passed in options so we can provice better action message
  if [[ $OPTION_EMAIL == 'none' ]]; then
    HELPER_EMAIL="joe@example.org";
  else
    HELPER_EMAIL="$OPTION_EMAIL";
  fi
  # Do the initial installed check
  git config --get user.email &>/dev/null && GITEMAIL_INSTALLED=true || GITEMAIL_INSTALLED=false
  # Set the installed status message
  if [[ $GITEMAIL_INSTALLED == "true" ]]; then
    GITEMAIL_STATUS=$(status_good "$(git config --get user.email)")
  # Otherwise set the uninstalled one
  else
    GITEMAIL_STATUS=$(status_bad "not set")
    GITEMAIL_ACTION=$(status_warn "git config --global user.email ${HELPER_EMAIL}")
  fi
}

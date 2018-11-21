#!/bin/bash

##
# Sets variables containing the status of the sshkey dependency
##
check_sshkey() {
  # Initial install check
  ssh-keygen -l -f "$HOME/.ssh/id_rsa.pub" &>/dev/null && SSHKEY_INSTALLED=true || SSHKEY_INSTALLED=false
  if [[ $SSHKEY_INSTALLED == "true" ]]; then
    SSHKEY_STATUS=$(status_good "$(ssh-keygen -l -f $HOME/.ssh/id_rsa.pub | awk -F" " '{print $3}')")
  # Otherwise set the uninstalled status
  else
    SSHKEY_STATUS=$(status_bad "not set")
    SSHKEY_ACTION=$(status_warn "ssh-keygen")
  fi
}

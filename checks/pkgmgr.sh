#!/bin/bash

##
# Sets variables containing the status of the pkgmgr dependency
##
check_pkgmgr() {
  # Set some differences between darwin and linuxes
  case $OS in
    debian|ubuntu|elementary|mint)
      PKGMGR=aptitude
      PKGMGR_SCAN=true
      ;;
    darwin)
      PKGMGR=brew
      PKGMGR_SCAN="brew --version"
      ;;
  esac
  # Do the initial installed check
  $PKGMGR_SCAN &>/dev/null && PKGMGR_INSTALLED=true || PKGMGR_INSTALLED=false
  if [[ $PKGMGR_INSTALLED == "true" ]]; then
    PKGMGR_STATUS=$(status_good $PKGMGR)
  # Otherwise set the uninstalled status
  else
    PKGMGR_STATUS=$(status_bad none)
    PKGMGR_ACTION=$(status_warn "install $PKGMGR")
  fi
}

#!/bin/bash

# Install debian related packages
install_posix() {

  # Set git username
  if [[ $GITNAME_INSTALLED == "false" ]]; then
    git config --global user.name "$OPTION_NAME"
  fi

  # Set git email
  if [[ $GITEMAIL_INSTALLED == "false" ]]; then
    git config --global user.email "$OPTION_EMAIL"
  fi

  # Set the sshkey
  if [[ $SSHKEY_INSTALLED == "false" ]]; then
    ssh-keygen -t rsa -N "" -C "$(git config --global --get user.email)" -f "$HOME/.ssh/id_rsa"
  fi

  # Setup janus and our custom config
  if [[ $VIMCONF_INSTALLED == "false" ]]; then
    # Fix solarized terminal config if needed
    fix_solarized
    # Install custom vimconfig
    install_vimconfig
    # Install and update janus
    curl -L https://bit.ly/janus-bootstrap | bash
    # Update the version info
    echo "$MIN_VIMCONF_VERSION" > "$HOME/.hyperdrive/version"
  fi

}

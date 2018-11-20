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
    # Do the initial setup of our hyperdrive config
    if [ ! -d "$HOME/.hyperdrive" ] && [ ! -f "$HOME/.hyperdrive/version" ]; then
      # Clone the hyperdrice depending on where we run this from
      if [ ! -z "$HYPERDRIVE_VERSION" ]; then
        git clone https://github.com/lando/hyperdrive.git "$HOME/.hyperdrive"
      else
        git clone . "$HOME/.hyperdrive"
      fi
      # Backup any legacy janus conf if it exists
      for LEGACY in "$HOME/.janus" "$HOME/.vimrc.before" "$HOME/.vimrc.after"; do
        if [[ ( -e $LEGACY ) || ( -h $LEGACY ) ]]; then
          echo "${LEGACY} has been renamed to ${LEGACY}.old"
          mv "${LEGACY}" "${LEGACY}.old" || error "Could not move ${LEGACY} to ${LEGACY}.old"
        fi
        ln -s "$HOME/.hyperdrive/vim" "$HOME/.janus"
        ln -s "$HOME/.hyperdrive/vimrc.before" "$HOME/.vimrc.before"
        ln -s "$HOME/.hyperdrive/vimrc.after" "$HOME/.vimrc.after"
      done
    fi

    # Should have a git repo at this point so lets update the hyperdrive repo
    # and its submodules
    cd "$HOME/.hyperdrive"
    git fetch --all
    git pull origin master
    git submodule update --recursive --remote
    # And check out a version if we have one
    if [ ! -z "$HYPERDRIVE_VERSION" ]; then
      git checkout $HYPERDRIVE_VERSION
    fi

    # Update janus
    curl -L https://bit.ly/janus-bootstrap | bash
  fi

}
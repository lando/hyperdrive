#!/bin/bash

# Install janus
install_vimconfig() {
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
      ln -sf "$HOME/.hyperdrive/vim" "$HOME/.janus"
      ln -sf "$HOME/.hyperdrive/vimrc.before" "$HOME/.vimrc.before"
      ln -sf "$HOME/.hyperdrive/vimrc.after" "$HOME/.vimrc.after"
    done
  fi
  # Should have a git repo at this point so lets update the hyperdrive repo
  # and its submodules
  git -C "$HOME/.hyperdrive" fetch --all
  git -C "$HOME/.hyperdrive" pull origin master
  # And check out the  tag if we have a version
  if [ ! -z "$HYPERDRIVE_VERSION" ]; then
    git -C "$HOME/.hyperdrive" checkout $HYPERDRIVE_VERSION
  fi
  # Update submodules
  git -C "$HOME/.hyperdrive" submodule update --init --recursive --remote
}

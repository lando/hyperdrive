#!/bin/bash

# Install debian related packages
install_darwin() {

HOMEBREW_PREFIX="/usr/local"

  # Install Homebrew
  if [[ $PKGMGR_INSTALLED == "false" ]]; then
    # @NOTE: can we assume ruby and curl here?
    /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
  fi

  # Install curl
  # @NOTE: as per above, i **THINKG** curl just ships with macOS so its unlikely we need this
  if [[ $CURL_INSTALLED == "false" ]]; then
    brew install curl
  fi

  # Ensure writability of our homebrew things
  # @TODO: is this too wide a net to cast?
  # @TODO: should we make this more conditional?
  HOMEBREW_PREFIX="/usr/local"
  if [ -d "$HOMEBREW_PREFIX" ]; then
    if ! [ -r "$HOMEBREW_PREFIX" ]; then
      sudo chown -R "${LOGNAME}:admin" /usr/local/*
    fi
  else
    sudo mkdir "$HOMEBREW_PREFIX"
    sudo chflags norestricted "$HOMEBREW_PREFIX"
    sudo chown -R "${LOGNAME}:admin" "$HOMEBREW_PREFIX/*"
  fi

  # Install git if needed
  if [[ $GIT_INSTALLED == "false" ]]; then
    brew install git
  fi

  # Install node if needed
  if [[ $NODE_INSTALLED == "false" ]]; then
    # @NOTE: Homebrew complains about setting the below, which we are not
    # currently setting because im not sure we need to if node is just to dev
    # on the landos
    #
    # For compilers to find node@10 you may need to set:
    # export LDFLAGS="-L/usr/local/opt/node@10/lib"
    # export CPPFLAGS="-I/usr/local/opt/node@10/include"

    # Install node
    brew unlink node &>/dev/null || true
    brew install "node@$NODE_MAJOR_VERSION"
    brew link --overwrite --force "node@$NODE_MAJOR_VERSION"
  fi

  # Install yarn if needed
  if [[ $YARN_INSTALLED == "false" ]]; then
    brew install yarn --without-node
  fi

  # Install lando if needed
  # NOTE: This is also how we install docker
  if [[ $LANDO_INSTALLED == "false" ]]; then
    # @TODO: eventually use the "stable" line when it it available
    # see: https://github.com/lando/lando/issues/810
    echo -e "Downloading Lando"
    curl -f#SL -o /tmp/lando.dmg https://files.devwithlando.io/lando-stable.dmg
    mkdir -p /tmp/lando
    hdiutil attach -mountpoint /tmp/lando /tmp/lando.dmg
    sudo installer -pkg /tmp/lando/LandoInstaller.pkg -target /
    hdiutil detach -force /tmp/lando
    rm -f /tmp/lando.dmg && rm -rf /tmp/lando
  fi

  # Install vimconf deps
  # we will handle the janus/vimconf setup in the posix script
  if [[ $VIMCONF_INSTALLED == "false" ]]; then
    ack --version &>/dev/null || brew install ack
    ctags --version &>/dev/null || brew install ctags
    ruby --version &>/dev/null || brew install ruby
    rake --version &>/dev/null || sudo gem install rake
  fi

}


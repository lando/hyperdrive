#!/bin/bash

# Clean up the apt-cache
clean_apt() {
  sudo rm -rf /var/lib/apt/lists/lock
  sudo rm -rf /var/cache/apt/archives/lock
  sudo rm -rf /var/lib/dpkg/lock
}

# Install debian related packages
install_debian() {

  # Install git if needed
  if [[ $GIT_INSTALLED == "false" ]]; then
    clean_apt
    sudo apt -y update
    sudo apt -y install git-core
  fi

    # Install curl if needed
  if [[ $CURL_INSTALLED == "false" ]]; then
    clean_apt
    sudo apt -y update
    sudo apt -y install curl
  fi

  # Install node if needed
  if [[ $NODE_INSTALLED == "false" ]]; then
    clean_apt
    curl -sL "https://deb.nodesource.com/setup_${NODE_MAJOR_VERSION}.x" | sudo -E bash
    sudo apt install -y nodejs
  fi

  # Install yarn if needed
  if [[ $YARN_INSTALLED == "false" ]]; then
    clean_apt
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
    sudo apt update -y
    sudo apt install -y yarn
  fi

  # Install docker if needed
  if [[ $DOCKER_INSTALLED == "false" ]]; then
    # Get the correct upstreams
    case $OS in
      debian)
        DISTRO=debian
        DISTRO_VERSION=$(lsb_release -cs)
        ;;
      ubuntu|mint)
        DISTRO=ubuntu
        DISTRO_VERSION=$(lsb_release -cs)
        ;;
      elementary)
        DISTRO=ubuntu
        DISTRO_VERSION=bionic
        ;;
      *)
        DISTRO=ubuntu
        DISTRO_VERSION=$(lsb_release -cs)
        ;;
    esac

    # Update and remove old docker pkgs
    clean_apt
    sudo apt -y update
    sudo apt -y remove \
      docker \
      docker-engine \
      docker.io

    # Install deps
    clean_apt
    sudo apt -y update
    sudo apt -y install \
      apt-transport-https \
      ca-certificates \
      curl \
      software-properties-common

    # Set up docker PPA
    curl -fsSL "https://download.docker.com/linux/$DISTRO/gpg" | sudo apt-key add -
    sudo add-apt-repository \
      "deb [arch=amd64] https://download.docker.com/linux/$DISTRO \
      $DISTRO_VERSION \
      stable"

    # CLean ap and install docker
    clean_apt
    sudo apt -y update
    sudo apt -y install docker-ce

    # Set docker user and enable
    sudo groupadd docker || true
    sudo usermod -aG docker $USER || true
    if [ -x "$(command -v systemctl)" ]; then
      sudo systemctl enable docker
    fi
  fi

  # Install lando if needed
  if [[ $LANDO_INSTALLED == "false" ]]; then
    clean_apt
    echo -e "Downloading Lando"
    curl -f#SL -o /tmp/lando.deb https://github.com/lando/lando/releases/download/v3.0.0-rc.2/lando-v3.0.0-rc.2.deb
    sudo dpkg -i /tmp/lando.deb
    rm -f /tmp/lando.deb
  fi

  # Install vim
  if [[ $VIM_INSTALLED == "false" ]]; then
    git config --global core.editor "vim"
    clean_apt
    sudo apt -y update
    sudo apt -y install vim
  fi

  # Install vimconf deps
  # we will handle the janus/vimconf setup in the posix script
  if [[ $VIMCONF_INSTALLED == "false" ]]; then
    clean_apt
    sudo apt -y update
    ack --version &>/dev/null || sudo apt -y install ack || sudo apt -y install ack-grep
    ctags --version &>/dev/null || sudo apt -y install ctags
    ruby --version &>/dev/null || sudo apt -y install ruby
    rake --version &>/dev/null || sudo apt -y install rake
  fi

}

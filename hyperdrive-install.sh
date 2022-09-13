#!/bin/sh
SCRIPT_COMMIT_SHA="SET_THIS_IN_GH_ACTIONS"

while [ $# -gt 0 ]; do
	case "$1" in
		--tag|--tag=*|-t)
      if [ "${1##--tag=}" != "$1" ]; then
        TAG="${1##--tag=}"
        shift
      else
        TAG=$2
        shift 2
      fi
			;;
		--version|--version=*|-v)
      if [ "${1##--version=}" != "$1" ]; then
        VERSION="${1##--version=}"
        exit 1
        shift
      else
        VERSION=$2
        shift 2
      fi
			;;
		--*)
			echo "Illegal option $1"
			;;
	esac
	shift $(( $# > 0 ? 1 : 0 ))
done

is_wsl() {
	case "$(uname -r)" in
	*microsoft* ) true ;; # WSL 2
	*Microsoft* ) true ;; # WSL 1
	* ) false;;
	esac
}

is_darwin() {
	case "$(uname -s)" in
	*darwin* ) true ;;
	*Darwin* ) true ;;
	* ) false;;
	esac
}

is_linux() {
 	case "$(uname -s)" in
	*linux* ) true ;;
	*Linux* ) true ;;
	* ) false;;
	esac
}

command_exists() {
	command -v "$@" > /dev/null 2>&1
}

hyperdrive_exists() {
  if command_exists hyperdrive; then
		cat >&2 <<-'EOF'
			Warning: the "hyperdrive" command appears to already exist on this system.

			If you don't want to re-install hyperdrive, press Ctrl+C now to abort this script.
		EOF
		( set -x; sleep 5 )
	fi
}

architecture_detection() {
  ARCH="$(uname -m)"
  if [[ "$ARCH" != "arm64" ]] && [[ "$ARCH" != "amd64" ]] ; then
    echo "Your computer has an unsupported architecture of $ARCH, either arm64 or amd64 is required by hyperdrive."
    exit 1
  fi
}

operating_system_detection() {
  supported_os=false
  if is_darwin; then
    OS="macos"
    supported_os=true
  fi

  if is_wsl; then
    OS="linux"
    supported_os=true
  fi

  if is_linux; then
    OS="linux"
    supported_os=true
  fi

  if [ "$supported_os" = false ] ; then
    echo "Your computer has an unsupported operating system, a supported POSIX environment is required by hyperdrive."
    exit 1
  fi
}

software_requirements() {
  if command_exists curl; then
    # do nothing
    echo "cURL was detected, proceeding to fetch Hyperdrive binary"
  else
    echo "cURL was not detected on your computer. Please install cURL and try the script again."
    # install_curl, should we use https://github.com/icy/pacapt/blob/ng/pacapt
  fi
}

pre_flight_requirements() {
  hyperdrive_exists
  # AMD/ARM
  architecture_detection
  #if windows throw error
  operating_system_detection
  #  OS has curl, if not install for them. Check for bash.
  software_requirements
}

install_hyperdrive() {
  tag="stable"

  # Get version/tag
  SPECIFIED="stable"

  if [[ "${VERSION:0:1}" != "v" ]] && [[ ! -z "$VERSION" ]] ; then
    VERSION="v${VERSION}"
    printf $VERSION
  fi

  if [ ! -z "$VERSION" ]; then
    SPECIFIED=$VERSION
  fi

  if [ ! -z "$TAG" ]; then
    SPECIFIED=$TAG
  fi
  curl --create-dirs -O --output-dir /usr/local/bin "https://files.lando.dev/hyperdrive/hyperdrive-$OS-$ARCH--$SPECIFIED"
  printf "hyperdrive-$OS-$ARCH--$SPECIFIED"
  # mv "/usr/local/bin/hyperdrive-$OS-$ARCH--$SPECIFIED" /usr/local/bin/hyperdrive
}

# Do necessary install stuff
do_install() {
	echo "# Executing hyperdrive install script, commit: $SCRIPT_COMMIT_SHA"

  pre_flight_requirements
  install_hyperdrive
}

do_install

Hyperdrive
==========

![Hyperdrive](https://raw.githubusercontent.com/lando/hyperdrive/master/hyperdrive.gif)

A helper script to get you from a vanilla machine to a minimal Lando-based dev environment in less than 12 par-steps. Generally this includes:

  1. **git**
  2. **curl**
  3. **node**
  4. **yarn**
  5. **docker**
  6. **lando**
  7. **ssh keys**
  9. **vim or atom or [none](https://www.youtube.com/watch?v=UsjoFZEwAyI)**

**NOTE:** Hyperdrive is only currently available for macOS 10.11+ and _recent-ish_ Debian flavored linux distributions. If you are using something else and interested in adding support please [open a feature request](https://github.com/lando/hyperdrive/issues/new?template=feature_request.md)

Installation
------------

The easiest way to kick in things into lightspeed is to run the latest release script directly from the internet

```bash
curl -Ls https://github.com/lando/hyperdrive/releases/download/v0.3.0/hyperdrive > /tmp/hyperdrive \
  && chmod +x /tmp/hyperdrive \
  && /tmp/hyperdrive
```

You can also download the script to your `$PATH` and then pass in options to make it non-interactive

```bash
curl -Ls https://github.com/lando/hyperdrive/releases/download/v0.3.0/hyperdrive > /usr/local/bin/hyperdrive \
  && chmod +x /usr/local/bin/hyperdrive
```
```bash
hyperdrive -h
  _    _                          _      _
 | |  | |                        | |    (_)
 | |__| |_   _ _ __   ___ _ __ __| |_ __ ___   _____
 |  __  | | | | '_ \ / _ \ '__/ _` | '__| \ \ / / _ \
 | |  | | |_| | |_) |  __/ | | (_| | |  | |\ V /  __/
 |_|  |_|\__, | .__/ \___|_|  \__,_|_|  |_| \_/ \___|
          __/ | |
         |___/|_|

Usage: ./hyperdrive.sh [-yh] [--name name] [--email email] [--vim]

Options:
  -h, --help                Show this help dialog
  -v, --version             Show the version
  -y, --yes                 Auto confirm all yes/no prompts

  --name                    My name eg "Jean Luc Picard"
  --email                   My email eg kirk@starfleet.mil
  --vim                     Install vim with hyperdrive conf

Examples:
  # Run bootscript interactively
  ./hyperdrive.sh

  # Show this usage dialog
  ./hyperdrive.sh -h

  # Run non-interactively with optional vim installation
  ./hyperdrive.sh -y --name "Lando" --email admin@thisfacility.com --vim

```

Environment Variables
---------------------

The above CLI options are also available as environment variables. Take care to `export` the variables. You can ensure that they are set correctly by running `env`.

```bash
export HYPERDRIVE_HELP=false
export HYPERDRIVE_YES=false
export HYPERDRIVE_NAME=James T. Kirk
export HYPERDRIVE_EMAIL=kirk@enterprise.mil
export HYPERDRIVE_VIM=false
```

VIM
---

You can optionally install our `hyperdrive` version of the `vim` text editor by passing the `--vim` option into `hyperdrive`.

```bash
hyperdrive --vim
```

![Hyperdrive Vim](https://raw.githubusercontent.com/lando/hyperdrive/master/hypervim.png)

Hyperdrive Vim is built on top of and extends [Janus](https://github.com/carlhuda/janus) which means it uses [Pathogen](https://github.com/tpope/vim-pathogen) for plugin management and sets `,` as the Leader Key. If you are unfamiliar with `vim` or `janus` we highly recommend you review [this](https://github.com/carlhuda/janus#intro-to-vim) before proceeding further.

You can further extend it with your own `~/.hyperdrive.local` folder which should take this structure:

```bash
.
├── vim                   Pathogen VIM plugins as git submodules
├── vimrc.after           Runs after the custom Janus vimrc.after
└── vimrc.before          Runs after the custom Janus vimrc.before
```

And ideally lives in a `git` repository so you can do this magic:

```bash
git clone https://github.com/pirog/hyperdrive ~/.hyperdrive.local
```

Configuration
-------------

You can configure
You can


Development
-----------

You can also warp to the frontier and use the latest dev version of the script.

```bash
# Get the project
git clone https://github.com/lando/hyperdrive.git

# Run the source
./hyperdrive.sh

# Build the compiled script that lives on the interwebs
./build.sh
./bin/hyperdrive

# Release a new version of hyperdrive
#
# NOTE: This will update the readme, make a commit, make a tag and push
# back to the repo
#
# Pass in the version you want to bump to with an optional tag annotation
./release.sh v4.4.4-alpha.12931 "Wretched hive of scum and villiany"
```

Structure
---------

The project structure to hyperdrive makes it easy to work with and learn.

```bash
.
├── CONTRIBUTING.md       Contributing docs
├── LICENSE               License
├── README.md             This README
├── bin                   The location of ./build.sh artifacts eg hyperdrive
├── checks                A standardized set of dependency check functions
├── installers            Scripts to install things
├── lib                   Helper functions loaded first and used everywhere else
├── vim                   Git submodules for our VIM ~/.janus plugins (Pathogen)
├── build.sh              Build script
├── release.sh            Release script
├── hyperdrive.sh         Main entrypoint logic
├── vimrc.after           Custom Janus vimrc.after
└── vimrc.before          Custom Janus vimrc.before
```

Other Resources
---------------

* [Mountain climbing advice](https://www.youtube.com/watch?v=tkBVDh7my9Q)

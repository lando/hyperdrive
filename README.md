Hyperdrive
==========

**As of `0.7.0-alpha.1` Hyperdrive has a new purpose: a first-class package and dependency manager for Lando. That said, it is still in early development and not yet suitable for production, or really any, usage. Until it's reasonably useful and stable we recommend you continue to use the [0.6.1 Release](https://github.com/lando/hyperdrive/releases/tag/v0.6.1) and its associated [documentation](https://github.com/lando/hyperdrive/tree/v0.6.1).**

Hyperdrive is the `npm` of Lando. Its purpose is to consolidate dependency and plugin management logic that exists across the Lando ecosystem into a single library that can be invoked directly through `require` or via the `hyperdrive` cli. With Hyperdrive you should be able to:

* Install remove and correctly configure Lando dependencies like Docker
* Install and remove Lando components like the Lando Desktop, Lando CLI and Lando Server
* Install and remove core, contrib and third-part Lando plugins

Installation
------------

Usage
-----

Development
-----------

Testing
-------

Releasing
---------

1. `yarn release`.
2. Create GitHub release or prerelease.

Other Resources
---------------

* [Mountain climbing advice](https://www.youtube.com/watch?v=tkBVDh7my9Q)

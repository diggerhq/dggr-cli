Digger dgctl CLI
=================

[![dgctl](https://img.shields.io/badge/cli-dgctl-brightgreen.svg)](https://digger.dev)
[![Version](https://img.shields.io/npm/v/dgctl.svg)](https://npmjs.org/package/dgctl)
[![Downloads/week](https://img.shields.io/npm/dw/dgctl.svg)](https://npmjs.org/package/dgctl)
[![License](https://img.shields.io/npm/l/dgctl.svg)](https://github.com/diggerhq/dgctl/blob/main/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g dgctl
$ dgctl COMMAND
running command...
$ dgctl (--version)
dgctl/0.0.33 linux-x64 node-v16.16.0
$ dgctl --help [COMMAND]
USAGE
  $ dgctl COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`dgctl autocomplete [SHELL]`](#dgctl-autocomplete-shell)
* [`dgctl help [COMMANDS]`](#dgctl-help-commands)
* [`dgctl plugins`](#dgctl-plugins)
* [`dgctl plugins:install PLUGIN...`](#dgctl-pluginsinstall-plugin)
* [`dgctl plugins:inspect PLUGIN...`](#dgctl-pluginsinspect-plugin)
* [`dgctl plugins:install PLUGIN...`](#dgctl-pluginsinstall-plugin-1)
* [`dgctl plugins:link PLUGIN`](#dgctl-pluginslink-plugin)
* [`dgctl plugins:uninstall PLUGIN...`](#dgctl-pluginsuninstall-plugin)
* [`dgctl plugins:uninstall PLUGIN...`](#dgctl-pluginsuninstall-plugin-1)
* [`dgctl plugins:uninstall PLUGIN...`](#dgctl-pluginsuninstall-plugin-2)
* [`dgctl plugins update`](#dgctl-plugins-update)
* [`dgctl update [CHANNEL]`](#dgctl-update-channel)

## `dgctl autocomplete [SHELL]`

display autocomplete installation instructions

```
USAGE
  $ dgctl autocomplete [SHELL] [-r]

ARGUMENTS
  SHELL  shell type

FLAGS
  -r, --refresh-cache  Refresh cache (ignores displaying instructions)

DESCRIPTION
  display autocomplete installation instructions

EXAMPLES
  $ dgctl autocomplete

  $ dgctl autocomplete bash

  $ dgctl autocomplete zsh

  $ dgctl autocomplete --refresh-cache
```

_See code: [@oclif/plugin-autocomplete](https://github.com/oclif/plugin-autocomplete/blob/v1.4.4/src/commands/autocomplete/index.ts)_

## `dgctl help [COMMANDS]`

Display help for dgctl.

```
USAGE
  $ dgctl help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for dgctl.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.2/src/commands/help.ts)_

## `dgctl plugins`

List installed plugins.

```
USAGE
  $ dgctl plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ dgctl plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.3.0/src/commands/plugins/index.ts)_

## `dgctl plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ dgctl plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ dgctl plugins add

EXAMPLES
  $ dgctl plugins:install myplugin 

  $ dgctl plugins:install https://github.com/someuser/someplugin

  $ dgctl plugins:install someuser/someplugin
```

## `dgctl plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ dgctl plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ dgctl plugins:inspect myplugin
```

## `dgctl plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ dgctl plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ dgctl plugins add

EXAMPLES
  $ dgctl plugins:install myplugin 

  $ dgctl plugins:install https://github.com/someuser/someplugin

  $ dgctl plugins:install someuser/someplugin
```

## `dgctl plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ dgctl plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ dgctl plugins:link myplugin
```

## `dgctl plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ dgctl plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ dgctl plugins unlink
  $ dgctl plugins remove
```

## `dgctl plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ dgctl plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ dgctl plugins unlink
  $ dgctl plugins remove
```

## `dgctl plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ dgctl plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ dgctl plugins unlink
  $ dgctl plugins remove
```

## `dgctl plugins update`

Update installed plugins.

```
USAGE
  $ dgctl plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

## `dgctl update [CHANNEL]`

update the dgctl CLI

```
USAGE
  $ dgctl update [CHANNEL] [-a] [-v <value> | -i] [--force]

FLAGS
  -a, --available        Install a specific version.
  -i, --interactive      Interactively select version to install. This is ignored if a channel is provided.
  -v, --version=<value>  Install a specific version.
  --force                Force a re-download of the requested version.

DESCRIPTION
  update the dgctl CLI

EXAMPLES
  Update to the stable channel:

    $ dgctl update stable

  Update to a specific version:

    $ dgctl update --version 1.0.0

  Interactively select version:

    $ dgctl update --interactive

  See available versions:

    $ dgctl update --available
```

_See code: [@oclif/plugin-update](https://github.com/oclif/plugin-update/blob/v3.1.1/src/commands/update.ts)_
<!-- commandsstop -->

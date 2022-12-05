oclif-hello-world
=================

oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![Downloads/week](https://img.shields.io/npm/dw/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![License](https://img.shields.io/npm/l/oclif-hello-world.svg)](https://github.com/oclif/hello-world/blob/main/package.json)

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
dgctl/0.0.0 darwin-arm64 node-v16.13.1
$ dgctl --help [COMMAND]
USAGE
  $ dgctl COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`dgctl hello PERSON`](#dgctl-hello-person)
* [`dgctl hello world`](#dgctl-hello-world)
* [`dgctl help [COMMAND]`](#dgctl-help-command)
* [`dgctl plugins`](#dgctl-plugins)
* [`dgctl plugins:install PLUGIN...`](#dgctl-pluginsinstall-plugin)
* [`dgctl plugins:inspect PLUGIN...`](#dgctl-pluginsinspect-plugin)
* [`dgctl plugins:install PLUGIN...`](#dgctl-pluginsinstall-plugin-1)
* [`dgctl plugins:link PLUGIN`](#dgctl-pluginslink-plugin)
* [`dgctl plugins:uninstall PLUGIN...`](#dgctl-pluginsuninstall-plugin)
* [`dgctl plugins:uninstall PLUGIN...`](#dgctl-pluginsuninstall-plugin-1)
* [`dgctl plugins:uninstall PLUGIN...`](#dgctl-pluginsuninstall-plugin-2)
* [`dgctl plugins update`](#dgctl-plugins-update)

## `dgctl hello PERSON`

Say hello

```
USAGE
  $ dgctl hello [PERSON] -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [dist/commands/hello/index.ts](https://github.com/Projects/hello-world/blob/v0.0.0/dist/commands/hello/index.ts)_

## `dgctl hello world`

Say hello world

```
USAGE
  $ dgctl hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ dgctl hello world
  hello world! (./src/commands/hello/world.ts)
```

## `dgctl help [COMMAND]`

Display help for dgctl.

```
USAGE
  $ dgctl help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for dgctl.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.19/src/commands/help.ts)_

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.1.7/src/commands/plugins/index.ts)_

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
<!-- commandsstop -->

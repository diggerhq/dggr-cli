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
dgctl/0.0.12 darwin-arm64 node-v16.15.1
$ dgctl --help [COMMAND]
USAGE
  $ dgctl COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`dgctl autocomplete [SHELL]`](#dgctl-autocomplete-shell)
* [`dgctl block`](#dgctl-block)
* [`dgctl block add [NAME]`](#dgctl-block-add-name)
* [`dgctl block deploy [NAME]`](#dgctl-block-deploy-name)
* [`dgctl block list`](#dgctl-block-list)
* [`dgctl block logs [NAME]`](#dgctl-block-logs-name)
* [`dgctl block register [NAME]`](#dgctl-block-register-name)
* [`dgctl block remove [NAME]`](#dgctl-block-remove-name)
* [`dgctl block rename [NAME]`](#dgctl-block-rename-name)
* [`dgctl config NAME`](#dgctl-config-name)
* [`dgctl eject`](#dgctl-eject)
* [`dgctl generate`](#dgctl-generate)
* [`dgctl help [COMMAND]`](#dgctl-help-command)
* [`dgctl infra [ACTION]`](#dgctl-infra-action)
* [`dgctl init`](#dgctl-init)
* [`dgctl login [KEY]`](#dgctl-login-key)
* [`dgctl plugins`](#dgctl-plugins)
* [`dgctl plugins:install PLUGIN...`](#dgctl-pluginsinstall-plugin)
* [`dgctl plugins:inspect PLUGIN...`](#dgctl-pluginsinspect-plugin)
* [`dgctl plugins:install PLUGIN...`](#dgctl-pluginsinstall-plugin-1)
* [`dgctl plugins:link PLUGIN`](#dgctl-pluginslink-plugin)
* [`dgctl plugins:uninstall PLUGIN...`](#dgctl-pluginsuninstall-plugin)
* [`dgctl plugins:uninstall PLUGIN...`](#dgctl-pluginsuninstall-plugin-1)
* [`dgctl plugins:uninstall PLUGIN...`](#dgctl-pluginsuninstall-plugin-2)
* [`dgctl plugins update`](#dgctl-plugins-update)
* [`dgctl preset [PRESET]`](#dgctl-preset-preset)
* [`dgctl provision [FILE]`](#dgctl-provision-file)
* [`dgctl secret`](#dgctl-secret)
* [`dgctl secret add [KV]`](#dgctl-secret-add-kv)
* [`dgctl secret delete [KEY]`](#dgctl-secret-delete-key)
* [`dgctl update [CHANNEL]`](#dgctl-update-channel)
* [`dgctl variable [COMMAND] [KV]`](#dgctl-variable-command-kv)

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

_See code: [@oclif/plugin-autocomplete](https://github.com/oclif/plugin-autocomplete/blob/v1.3.10/src/commands/autocomplete/index.ts)_

## `dgctl block`

Adds a infra block to a Digger infra bundle

```
USAGE
  $ dgctl block

DESCRIPTION
  Adds a infra block to a Digger infra bundle
```

_See code: [dist/commands/block/index.ts](https://github.com/diggerhq/dggr-cli/blob/v0.0.12/dist/commands/block/index.ts)_

## `dgctl block add [NAME]`

Adds a block to the project

```
USAGE
  $ dgctl block add [NAME] [-t container|mysql|postgres|docdb|redis|imported] [-n <value>] [-i <value>] [-s
    <value>]

ARGUMENTS
  NAME  new name for the block

FLAGS
  -i, --id=<value>       id of the resource to import
  -n, --name=<value>     new name for the block
  -s, --service=<value>  aws service name to search
  -t, --type=<option>    type of block
                         <options: container|mysql|postgres|docdb|redis|imported>

DESCRIPTION
  Adds a block to the project
```

## `dgctl block deploy [NAME]`

Deploy application to AWS

```
USAGE
  $ dgctl block deploy [NAME] [-c <value>] [-d] [-p <value>] [-n]

FLAGS
  -c, --context=<value>  The code context for block deployment
  -d, --displayOnly      Only display commands, do not run them for block deployment
  -n, --no-input         Skip prompts
  -p, --profile=<value>  AWS profile to use

DESCRIPTION
  Deploy application to AWS
```

## `dgctl block list`

list all blocks in the project

```
USAGE
  $ dgctl block list

DESCRIPTION
  list all blocks in the project

EXAMPLES
  $ dgctl block list
```

## `dgctl block logs [NAME]`

Show application logs from AWS

```
USAGE
  $ dgctl block logs [NAME] [-p <value>] [-f]

FLAGS
  -f, --follow           Follow logs
  -p, --profile=<value>  AWS profile to use

DESCRIPTION
  Show application logs from AWS
```

## `dgctl block register [NAME]`

Registers an existing dgctl block folder as a block to the project by adding it to dgctl.json

```
USAGE
  $ dgctl block register [NAME] [-t container|mysql|postgres|docdb|redis|imported]

ARGUMENTS
  NAME  new name for the block

FLAGS
  -t, --type=<option>  type of block
                       <options: container|mysql|postgres|docdb|redis|imported>

DESCRIPTION
  Registers an existing dgctl block folder as a block to the project by adding it to dgctl.json
```

## `dgctl block remove [NAME]`

removes a block from the project

```
USAGE
  $ dgctl block remove [NAME]

DESCRIPTION
  removes a block from the project
```

## `dgctl block rename [NAME]`

rename a block in the project

```
USAGE
  $ dgctl block rename [NAME] [-n <value>]

FLAGS
  -n, --name=<value>  new name to rename to

DESCRIPTION
  rename a block in the project

EXAMPLES
  $ dgctl block rename
```

## `dgctl config NAME`

Allows changing dgctl configuration

```
USAGE
  $ dgctl config [NAME] [-c]

ARGUMENTS
  NAME  (aws) name for the config to change. Example `dgctl config <name>`

FLAGS
  -c, --create  force creation of a new profile

DESCRIPTION
  Allows changing dgctl configuration

EXAMPLES
  $ dgctl config
```

_See code: [dist/commands/config.ts](https://github.com/diggerhq/dggr-cli/blob/v0.0.12/dist/commands/config.ts)_

## `dgctl eject`

describe the command here

```
USAGE
  $ dgctl eject [-f]

FLAGS
  -f, --force

DESCRIPTION
  describe the command here

EXAMPLES
  $ dgctl eject
```

_See code: [dist/commands/eject.ts](https://github.com/diggerhq/dggr-cli/blob/v0.0.12/dist/commands/eject.ts)_

## `dgctl generate`

Generates terraform based on the Digger infra bundle

```
USAGE
  $ dgctl generate

DESCRIPTION
  Generates terraform based on the Digger infra bundle
```

_See code: [dist/commands/generate.ts](https://github.com/diggerhq/dggr-cli/blob/v0.0.12/dist/commands/generate.ts)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.23/src/commands/help.ts)_

## `dgctl infra [ACTION]`

describe the command here

```
USAGE
  $ dgctl infra [ACTION] [-n <value>] [-f]

FLAGS
  -f, --force
  -n, --name=<value>  name to print

DESCRIPTION
  describe the command here

EXAMPLES
  $ dgctl infra
```

_See code: [dist/commands/infra.ts](https://github.com/diggerhq/dggr-cli/blob/v0.0.12/dist/commands/infra.ts)_

## `dgctl init`

Creates a Digger infra bundle project

```
USAGE
  $ dgctl init [-f]

FLAGS
  -f, --force

DESCRIPTION
  Creates a Digger infra bundle project

EXAMPLES
  $ dgctl init
```

_See code: [dist/commands/init.ts](https://github.com/diggerhq/dggr-cli/blob/v0.0.12/dist/commands/init.ts)_

## `dgctl login [KEY]`

Login with Digger key

```
USAGE
  $ dgctl login [KEY]

DESCRIPTION
  Login with Digger key

EXAMPLES
  $ dgctl login
```

_See code: [dist/commands/login.ts](https://github.com/diggerhq/dggr-cli/blob/v0.0.12/dist/commands/login.ts)_

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.1.12/src/commands/plugins/index.ts)_

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

## `dgctl preset [PRESET]`

Initialise project based on preset

```
USAGE
  $ dgctl preset [PRESET] [-a] [-p <value>]

FLAGS
  -a, --advanced
  -p, --path=<value>  Full path to a json file that contains dgctl configuration

DESCRIPTION
  Initialise project based on preset

EXAMPLES
  $ dgctl preset
```

_See code: [dist/commands/preset.ts](https://github.com/diggerhq/dggr-cli/blob/v0.0.12/dist/commands/preset.ts)_

## `dgctl provision [FILE]`

describe the command here

```
USAGE
  $ dgctl provision [FILE] [-s] [-p <value>] [-b <value>]

FLAGS
  -b, --bucket=<value>   S3 bucket name
  -p, --profile=<value>  AWS profile to use
  -s, --s3-state         Store terraform state in s3

DESCRIPTION
  describe the command here

EXAMPLES
  $ dgctl provision
```

_See code: [dist/commands/provision.ts](https://github.com/diggerhq/dggr-cli/blob/v0.0.12/dist/commands/provision.ts)_

## `dgctl secret`

Perform secret management actions

```
USAGE
  $ dgctl secret

DESCRIPTION
  Perform secret management actions
```

_See code: [dist/commands/secret/index.ts](https://github.com/diggerhq/dggr-cli/blob/v0.0.12/dist/commands/secret/index.ts)_

## `dgctl secret add [KV]`

describe the command here

```
USAGE
  $ dgctl secret add [KV] [-b <value>]

FLAGS
  -b, --block=<value>  name of the block

DESCRIPTION
  describe the command here

EXAMPLES
  $ dgctl secret add
```

## `dgctl secret delete [KEY]`

Delete secret

```
USAGE
  $ dgctl secret delete [KEY] [-b <value>]

FLAGS
  -b, --block=<value>  name of the block

DESCRIPTION
  Delete secret
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

_See code: [@oclif/plugin-update](https://github.com/oclif/plugin-update/blob/v3.0.12/src/commands/update.ts)_

## `dgctl variable [COMMAND] [KV]`

Manage environment variables for your infrastructure

```
USAGE
  $ dgctl variable [COMMAND] [KV] [-b <value>]

FLAGS
  -b, --block=<value>  name of the block

DESCRIPTION
  Manage environment variables for your infrastructure

EXAMPLES
  $ dgctl variable
```

_See code: [dist/commands/variable.ts](https://github.com/diggerhq/dggr-cli/blob/v0.0.12/dist/commands/variable.ts)_
<!-- commandsstop -->

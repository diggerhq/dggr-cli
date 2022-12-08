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
* [`dgctl init`](#dgctl-init)
* [`dgctl infra`](#dgctl-infra)
* [`dgctl help [COMMAND]`](#dgctl-help-command)

## `dgctl init`

Initialise a Digger project

```
USAGE
  $ dgctl init --force

FLAGS
  --force (optional) Forcefully reinitialise a project. Overrides existing files

DESCRIPTION
  Initialises a Digger project

EXAMPLES
  $ dgctl init
  Successfully initiated a Digger project
```

_See code: [dist/commands/init/index.ts](https://github.com/digger/dggr-cli/blob/v0.0.1/dist/commands/init/index.ts)_

## `dgctl infra [COMMAND]`

Applies generated Terraform infrastructure

```
USAGE
  $ dgctl infra apply

ARGUMENTS
  COMMAND Infra command to run

DESCRIPTION
  Applies generated infrastructure

EXAMPLES
  $ dgctl infra apply
  Applied infrastructure successfully!
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
<!-- commandsstop -->

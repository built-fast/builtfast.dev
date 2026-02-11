---
layout: post
title: "Bash debug tracing with a custom PS4"
date: "Tue Feb 10 12:00:00 -0500 2026"
categories: [devops]
tags: [bash, debugging, cli]
author: Josh Priddle
tagline: "set -x is a poor man's debugger. A custom PS4 prompt makes it actually useful."
---

`set -x` is one of the most useful debugging tools in bash. It prints every command before it runs. The problem is the default output looks like this:

```
+ greeting=Hello
+ name=World
+ say_hello 'Hello, World!'
+ local 'message=Hello, World!'
+ echo 'Hello, World!'
```

In a 20-line script, that's fine. In a 200-line script with multiple files and functions, it's useless. You can't tell _where_ anything is executing.

The fix is `PS4` --- the prompt string bash uses for trace output. You can customize it to show the filename, line number, and function name for every traced line.

## The setup

```bash
if [ "$DEBUG" ]; then
  export PS4='+ [${BASH_SOURCE[0]##*/}:${LINENO}${FUNCNAME[0]:+:${FUNCNAME[0]}()}] '
  set -x
fi
```

Drop this at the top of your script. Run it normally and nothing changes. Run it with `DEBUG=1` and you get full trace output with context.

## What it looks like

Here's a small demo script:

```bash
#!/bin/bash

if [ "$DEBUG" ]; then
  export PS4='+ [${BASH_SOURCE[0]##*/}:${LINENO}${FUNCNAME[0]:+:${FUNCNAME[0]}()}] '
  set -x
fi

greeting="Hello"
name="World"

say_hello() {
  local message="$1"
  echo "$message"
}

add_numbers() {
  local result=$(( $1 + $2 ))
  echo "$result"
}

say_hello "$greeting, $name!"
total=$(add_numbers 3 7)
echo "3 + 7 = $total"
```

Normal run:

```
$ bash demo.sh
Hello, World!
3 + 7 = 10
```

Debug run:

```
$ DEBUG=1 bash demo.sh
+ [demo.sh:8]                greeting=Hello
+ [demo.sh:9]                name=World
+ [demo.sh:19]               say_hello 'Hello, World!'
+ [demo.sh:12:say_hello()]   local 'message=Hello, World!'
+ [demo.sh:13:say_hello()]   echo 'Hello, World!'
Hello, World!
++ [demo.sh:20]               add_numbers 3 7
++ [demo.sh:17:add_numbers()] local result=10
++ [demo.sh:18:add_numbers()] echo 10
+ [demo.sh:20]                total=10
+ [demo.sh:21]                echo '3 + 7 = 10'
3 + 7 = 10
```

Now you can see exactly which file, which line, and which function every command is running in.

## Breaking down the PS4 string

The `PS4` variable looks dense, but each piece is straightforward:

```bash
PS4='+ [${BASH_SOURCE[0]##*/}:${LINENO}${FUNCNAME[0]:+:${FUNCNAME[0]}()}] '
```

| Piece | What it does | Example |
|---|---|---|
| `+` | The default trace prefix, just decoration | `+` |
| `${BASH_SOURCE[0]##*/}` | Current filename, path stripped | `demo.sh` |
| `${LINENO}` | Current line number | `12` |
| `${FUNCNAME[0]:+:${FUNCNAME[0]}()}` | Function name if inside one, nothing otherwise | `:say_hello()` |

Outside a function, the trace looks like:

```
+ [demo.sh:8] greeting=Hello
```

Inside a function, you get the extra context:

```
+ [demo.sh:12:say_hello()] local 'message=Hello, World!'
```

The `${FUNCNAME[0]:+:${FUNCNAME[0]}()}` part uses bash's [conditional substitution][1]. If `FUNCNAME[0]` is set (we're inside a function), it expands to `:funcname()`. If it's unset (top-level code), it expands to nothing. This keeps the output clean in both cases.

## Why some lines show ++

You'll notice `++` on some lines in the trace output. Each `+` represents a subshell nesting level. When bash runs a command substitution like `$(add_numbers 3 7)`, it spawns a subshell to capture the output. The commands inside that subshell get an extra `+` prefix.

```
++ [demo.sh:20]               add_numbers 3 7       # inside $()
++ [demo.sh:17:add_numbers()] local result=10       # still inside $()
++ [demo.sh:18:add_numbers()] echo 10               # still inside $()
+ [demo.sh:20]                total=10               # back to main shell
```

If you had nested subshells, you'd see `+++`, and so on.

## Making it opt-in

Wrapping the trace setup in `if [ "$DEBUG" ]` means the script behaves normally by default. When you need to debug, just prefix the command:

```bash
DEBUG=1 ./deploy.sh
DEBUG=1 ./build.sh
```

This works well in CI too. Add a `DEBUG` variable to your workflow and flip it on when a job is misbehaving.

One caveat: some CI environments and tools already set `DEBUG` for their own purposes. If you're seeing unexpected trace output, that's probably why. The easy fix is to use a more specific variable name:

```bash
if [ "$MYAPP_DEBUG" ]; then
  export PS4='+ [${BASH_SOURCE[0]##*/}:${LINENO}${FUNCNAME[0]:+:${FUNCNAME[0]}()}] '
  set -x
fi
```

Then `MYAPP_DEBUG=1 ./deploy.sh`. It's a small thing, but it avoids a confusing 20 minutes when your deploy script suddenly starts dumping trace output in CI because something else set `DEBUG=true`.

## Wrapping up

`set -x` on its own is noisy and disorienting. A custom `PS4` turns it into something genuinely useful --- you get file, line, and function context on every traced command. It's the cheapest debugger you'll ever set up: three lines at the top of your script and an environment variable to toggle it.

[1]: https://www.gnu.org/software/bash/manual/html_node/Shell-Parameter-Expansion.html

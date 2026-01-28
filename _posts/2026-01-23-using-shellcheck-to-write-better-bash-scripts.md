---
published: false
layout: post
title: "Using ShellCheck to write better Bash scripts"
date: "Thu Jan 23 12:00:00 -0500 2026"
categories: [devops]
tags: [bash, shellcheck, scripting]
author: Josh Priddle
tagline: "ShellCheck scans your Bash scripts for bugs without running them. A quick guide to static analysis for shell scripts."
---

[ShellCheck][1] is a static analysis tool for shell scripts. That is a fancy
way of saying that ShellCheck will scan your Bash scripts for possible bugs,
without running them, and advise you how to fix them.

We require that all newly submitted Bash code pass a ShellCheck test before
deploying it to production servers. This post will provide a quick overview on
how to use ShellCheck effectively.

## Installation

ShellCheck is available on most package managers:

```bash
# macOS with Homebrew
brew install shellcheck

# Ubuntu/Debian
apt install shellcheck

# Fedora/RHEL
dnf install shellcheck
```

Once installed, you can run it with:

```bash
shellcheck path/to/my/script.sh
```

**Important:** While ShellCheck does have an online version at
<https://www.shellcheck.net/>, avoid pasting proprietary or sensitive scripts
into any online tools. You'll be better off in the long run learning to use
these tools locally anyway.

## Tutorial

Let's try ShellCheck on a simple script that looks up a user's information:

```bash
#!/bin/bash
function usage {
    echo "`basename $0` username"
    echo "Finds info for username"
}

if (( $# < 1 ));then
    usage;
fi
user=$1
info=`grep "^$1:" /etc/passwd|head -n1| cut -d':' -f 5|sed 's/ //'`
if [[ -z $info ]];then
    info="unknown"
fi
echo $info
```

Running ShellCheck on this we see some errors:

```
$ shellcheck user-info.sh

In user-info.sh line 3:
    echo "`basename $0` username"
          ^-----------^ SC2006 (style): Use $(...) notation instead of legacy backticks `...`.
                    ^-- SC2086 (info): Double quote to prevent globbing and word splitting.

Did you mean:
    echo "$(basename "$0") username"


In user-info.sh line 10:
info=`grep "^$1:" /etc/passwd|head -n1| cut -d':' -f 5|sed 's/ //'`
     ^-- SC2006 (style): Use $(...) notation instead of legacy backticks `...`.

Did you mean:
info=$(grep "^$1:" /etc/passwd|head -n1| cut -d':' -f 5|sed 's/ //')


In user-info.sh line 14:
echo $info
     ^---^ SC2086 (info): Double quote to prevent globbing and word splitting.

Did you mean:
echo "$info"

For more information:
  https://www.shellcheck.net/wiki/SC2086 -- Double quote to prevent globbing ...
  https://www.shellcheck.net/wiki/SC2006 -- Use $(...) notation instead of le...
```

Let's unpack this bit by bit.

```
In user-info.sh line 3:
    echo "`basename $0` username"
          ^-----------^ SC2006 (style): Use $(...) notation instead of legacy backticks `...`.
                    ^-- SC2086 (info): Double quote to prevent globbing and word splitting.
```

Here, we can see that Line 3 of the script is producing two separate
ShellCheck errors. You can check any specific error by visiting
`https://github.com/koalaman/shellcheck/wiki/CODE` (or searching "shellcheck
CODE"). For these examples you'd search for "shellcheck sc2006" or "shellcheck
sc2086".

The specific errors:

- **SC2006:** <https://github.com/koalaman/shellcheck/wiki/SC2006>

    ShellCheck advocates for the usage of `$(...)` instead of backticks. The
    rationale behind this is three-fold:

    - Using backticks within quotes is undefined behavior in POSIX. This
      doesn't apply if you're targeting Bash specifically (see [this
      post][2] for an overview of the differences if you are curious).
    - Escaping special characters (like another backtick) _within_ a set of
      backticks can produce surprising results. Surprises are bad when it
      comes to programming.
    - Nesting (i.e. `$(foo "$(bar)")`) is difficult or impossible with
      backticks.

- **SC2086:** <https://github.com/koalaman/shellcheck/wiki/SC2086>

    Variables (i.e. `$blah`) need to be quoted with double quotes to prevent
    globbing and word splitting.

    - Globbing happens when a character like `*` is used to refer to all
      files in the directory.
    - Word splitting happens when you pass a script arguments with a space;
      `some-script Josh Priddle` is calling `some-script` with two arguments
      (`$1` is "Josh", `$2` is "Priddle"), while `some-script "Josh Priddle"`
      is calling it with _one_ argument (`$1` is "Josh Priddle").

To fix both of these errors, we update Line 3 to:

```bash
echo "$(basename "$0") username"
```

The next error:

```
In user-info.sh line 10:
info=`grep "^$1:" /etc/passwd|head -n1| cut -d':' -f 5|sed 's/ //'`
     ^-- SC2006 (style): Use $(...) notation instead of legacy backticks `...`.
```

Here, we see another set of backticks emitting an SC2006 error like before.
The fix is just like above, where we swap out backticks for `$(...)`. On Line
10, update it to:

```bash
info=$(grep "^$1:" /etc/passwd|head -n1| cut -d':' -f 5|sed 's/ //')
```

The final error:

```
In user-info.sh line 14:
echo $info
     ^---^ SC2086 (info): Double quote to prevent globbing and word splitting.

Did you mean:
echo "$info"
```

Once again, the fix here is easy, Line 14 is updated to:

```bash
echo "$info"
```

The final script looks like:

```bash
#!/bin/bash
function usage {
    echo "$(basename "$0") username"
    echo "Finds info for username"
}

if (( $# < 1 ));then
    usage;
fi
user=$1
info=$(grep "^$1:" /etc/passwd|head -n1| cut -d':' -f 5|sed 's/ //')
if [[ -z $info ]];then
    info="unknown"
fi
echo "$info"
```

## Handling Exclusions

Before wrapping up, let's talk about exclusions. ShellCheck is very
opinionated based on its community's experiences maintaining Bash scripts.
While we recommend that you always try to write scripts that ShellCheck passes
on, there are legitimate cases where you may not want to.

One very common ShellCheck error you may see is
[SC1090][3] "Can't follow
non-constant source. Use a directive to specify location." This error happens
when you use `.` (aka `source`) in a Bash script to include _another_ Bash
script, but ShellCheck cannot determine the real path to that script. This is
commonly done when you have functions that are shared across two scripts;
`a.sh` and `b.sh` might both include `lib.sh`. ShellCheck will attempt to
include this file and will warn you.

Most of the time this error can be safely ignored, **unless** the script you
are sourcing sets variables that you depend on. ShellCheck can be told to
ignore this error on a case by case basis by adding a line like `# shellcheck
ignore=SC1090` or `# shellcheck source=/dev/null` just above the line you are
calling `.` (or `source`).

## Wrapping Up

As you might have guessed, the presence of a few ShellCheck errors may not be
the end of the world or even cause real issues. Our example script has worked
long enough with these errors present. But, using ShellCheck to harden your
scripts will protect you against being bit by undefined behavior or nonsense
input that you didn't expect. It'll also make your script that much easier for
the next person to reason about and work with.

[1]: https://www.shellcheck.net/
[2]: https://stackoverflow.com/a/5725402
[3]: https://github.com/koalaman/shellcheck/wiki/SC1090

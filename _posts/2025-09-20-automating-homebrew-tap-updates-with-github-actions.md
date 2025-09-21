---
layout: post
title: "Automating Homebrew Tap Updates with GitHub Actions"
date: 2025-09-20
date: "Sat Sep 20 18:00:00 -0400 2025"
author: Josh Priddle
categories: [homebrew, github-actions, automation, devops]
tags: [macos, cli-tools, workflow, release-automation]
---

Maintaining a Homebrew tap manually is tedious and error-prone. Every time you release a new version of your CLI tool, you need to update the formula with the new version number and SHA256 hash. Here's how we automated this entire process using GitHub Actions to create a seamless release workflow.

## The Problem

When distributing CLI tools via Homebrew, the traditional workflow involves:

1. Release a new version with a git tag
2. Manually download the release archive
3. Calculate the SHA256 hash
4. Update the Homebrew formula with the new version and hash
5. Commit and push the formula changes

This manual process is time-consuming and introduces opportunities for human error. Missing a step or miscalculating a hash breaks the installation for users.

## The Solution: Two-Repository Automation

Our solution uses a two-repository approach with cross-repository workflow triggering:

- **Main repository** (`lcars`): Contains the CLI tool source code and release workflow
- **Homebrew tap repository** (`homebrew-devtools`): Contains Homebrew formulas and update automation

## Main Repository: Release Workflow

The release workflow in the main repository handles creating releases and triggering tap updates:

```yaml
{%- raw -%}
name: Upload zip on new tag

on:
  push:
    tags:
      - "v*"

jobs:
  release:
    permissions:
      actions: write
      contents: write
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - name: Get version
        id: version
        run: echo "VERSION=${GITHUB_REF##refs/tags/}" >> "$GITHUB_ENV"

      - name: Prepare zip archive
        run: FORMULA=lcars VERSION=${{ env.VERSION }} make archive

      - name: Upload archive to release
        uses: softprops/action-gh-release@v2
        with:
          files: pkg/lcars-${{ env.VERSION }}.zip

      - name: Update homebrew tap
        run: |
          gh workflow run bump-formula.yml \
            -f formula=lcars \
            -f version=${{ env.VERSION }} \
            -R built-fast/homebrew-devtools
        env:
          GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}
{% endraw %}
```

**Key points:**

- Triggers on any tag starting with `v*` (e.g., `v1.0.0`)
- Extracts version from the git tag using shell parameter expansion
- Creates a release archive using a Makefile target
- Uploads the archive to GitHub releases
- **Triggers the tap update workflow** in the separate repository using `gh workflow run`

The cross-repository triggering requires a personal access token with `actions:write` permissions stored as `GH_TOKEN`.

## Homebrew Tap Repository: Formula Update Workflow

The tap repository contains the workflow that actually updates the Homebrew formula:

```yaml
{%- raw -%}
on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version'
        required: true
        type: string
      formula:
        description: 'Formula'
        required: true
        type: string

jobs:
  update-formula:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - name: Update formula
        run: |
          mkdir -p Formula

          FORMULA='${{ github.event.inputs.formula }}' VERSION='${{ github.event.inputs.version }}' ./.github/script/update-formula

          git config --global user.name 'Josh Priddle'
          git config --global user.email 'jpriddle@me.com'
          git add Formula/${{ github.event.inputs.formula }}.rb
          git commit -m 'Updated ${{ github.event.inputs.formula }} to ${{ github.event.inputs.version }}'
          git push origin main
{% endraw %}
```

This workflow:

- Uses `workflow_dispatch` to accept external triggers with parameters
- Calls a shell script to update the formula
- Commits and pushes the changes automatically

## The Formula Update Script

The core logic lives in a bash script that handles the actual formula modification:

```bash
#!/usr/bin/env bash

set -e

: "${VERSION:?Must specify version}"
: "${FORMULA:?Must specify formula}"

FORMULA_FILE="Formula/$FORMULA.rb"

# Check if formula file exists
if [[ ! -f "$FORMULA_FILE" ]]; then
  echo "Error: Formula file $FORMULA_FILE not found"
  exit 1
fi

SHASUM=$(
  curl -sL "https://github.com/built-fast/$FORMULA/archive/$VERSION.tar.gz" |
    shasum -a 256 |
    awk '{ print $1 }'
)

# Update version line (compatible with both macOS and Linux)
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s/version \".*\"/version \"${VERSION#v}\"/" "$FORMULA_FILE"
  sed -i '' "s/sha256   \".*\"/sha256   \"$SHASUM\"/" "$FORMULA_FILE"
else
  sed -i "s/version \".*\"/version \"${VERSION#v}\"/" "$FORMULA_FILE"
  sed -i "s/sha256   \".*\"/sha256   \"$SHASUM\"/" "$FORMULA_FILE"
fi
```

**Script features:**

- **Parameter validation** using bash parameter expansion to ensure required variables are set
- **Dynamic SHA256 calculation** by downloading the release archive and piping to `shasum`
- **Cross-platform compatibility** with different `sed` syntax for macOS and Linux
- **Version normalization** by stripping the `v` prefix from git tags

## Formula Structure

The Homebrew formula follows standard conventions:

```ruby
class Lcars < Formula
  version "0.2.3"

  desc     "Laravel CLI and Reusable Scripts"
  homepage "https://github.com/built-fast/lcars"
  url      "https://github.com/built-fast/lcars/archive/v#{version}.tar.gz"
  sha256   "eb6376f8602fd86a5eccaf82d4e423377bc7cadbfc89fe8744183b0f90fab406"

  head "https://github.com/built-fast/lcars.git", branch: "main"

  def install
    zsh_completion.install "completions/_lcars" => "_lcars"
    prefix.install ["bin", "completions", "libexec", "vendor"]
    man1.install "share/man/man1/lcars.1"
    share.install "share/lcars"
  end
end
```

The automation updates the `version` and `sha256` lines while preserving all other formula content.

## Security Considerations

**Personal Access Token**: The cross-repository workflow requires a PAT with `actions:write` permissions. Store this as a repository secret and rotate it periodically.

**Formula Validation**: The script validates that the formula file exists before attempting modifications to prevent creating invalid formulas.

**Error Handling**: The script uses `set -e` to exit on any error, ensuring failed updates don't result in partially modified formulas.

## Benefits

This automation provides several key advantages:

- **Zero manual intervention** required for releases
- **Immediate availability** in Homebrew after tagging a release
- **Consistent hash calculation** eliminates human error
- **Audit trail** through git commits showing exactly what changed
- **Reusable pattern** that works for multiple CLI tools in the same tap

## Usage

To release a new version:

```bash
git tag v1.2.3
git push origin v1.2.3
```

Within minutes, the new version is available via:

```bash
brew update
brew upgrade lcars
```

This automation has eliminated the friction from our release process and ensures our Homebrew users always have access to the latest features and fixes without delay.

---
layout: post
title: "Customizing the Claude Code spinner"
date: "Thu Feb 12 12:00:00 -0500 2026"
categories: [developer-tools]
tags: [claude-code, cli, ai]
author: Josh Priddle
tagline: "Replace \"Thinking\" with whatever you want. We went with hot dogs."
---

Claude Code shows a spinner while it works. By default it cycles through verbs like "Thinking" and "Working." You can change those to whatever you want with a single JSON file.

## The setting

Claude Code reads a `settings.json` file from your project's `.claude/` directory. Inside it, the `spinnerVerbs` key controls what the spinner says:

```json
{
  "spinnerVerbs": {
    "mode": "replace",
    "verbs": [
      "Grilling",
      "Squeezing mustard on",
      "Toasting buns for",
      "Adding relish to",
      "Charring"
    ]
  }
}
```

You can customize that to your liking. Next time Claude is working, instead of "Thinking..." you'll see "Grilling..." or "Squeezing mustard on..." The CLI picks randomly from the list.

## The two modes

The `mode` field has two options:

- **`replace`** --- throw out all the defaults and use only your verbs
- **`append`** --- keep the defaults and mix yours in

Replace mode is all-or-nothing. If your list only has three verbs, you'll see a lot of repetition. Append mode is safer if you just want to sprinkle in a few extras without losing "Thinking" and friends.

## Where it goes

The setting works at three levels:

| File | Scope |
|---|---|
| `~/.claude/settings.json` | All projects (user-level) |
| `.claude/settings.json` | This project (committed, shared with team) |
| `.claude/settings.local.json` | This project (local only, not committed) |

Project settings override user settings. Local overrides project. If you want your whole team to see hot dog verbs, commit `.claude/settings.json`. If this is just for you, use `settings.local.json` and keep it out of version control.

## Our config

Here's what we're actually running on this project:

```json
{
  "spinnerVerbs": {
    "mode": "replace",
    "verbs": [
      "Grilling",
      "Squeezing mustard on",
      "Toasting buns for",
      "Adding relish to",
      "Charring",
      "Applying ketchup to",
      "Sprinkling onions on",
      "Steaming",
      "Warming",
      "Dressing",
      "Bunning",
      "Slathering mayo on",
      "Chicago-styling",
      "Chili-cheesing",
      "Foot-longing",
      "Ballpark-ifying",
      "Corndog-ifying",
      "Propane-accessorizing"
    ]
  }
}
```

When Claude is reading a file you get "Corndog-ifying..." When it's writing code you get "Chicago-styling..." It's completely useless and it makes me smile every time.

## Making a good list

A few things I've noticed after trying different configs:

**Keep verbs short.** The spinner has limited space. "Squeezing mustard on" is about as long as you want to go. Anything longer gets truncated or looks awkward.

**Use enough verbs.** With replace mode, a list of five verbs gets repetitive fast. Fifteen to twenty is a good sweet spot.

**End with -ing.** The spinner appends "..." after the verb, so present participles (-ing words) read the most naturally. "Grilling..." works. "Grill..." doesn't.

**Commit it or don't.** If your team has a sense of humor, commit `.claude/settings.json` and let everyone enjoy it. If you're not sure, use `settings.local.json` so it stays on your machine.

## Try it

Create `.claude/settings.json` in your project root, drop in a `spinnerVerbs` config, and open Claude Code. You'll see the difference on the next response. The feature shipped in Claude Code v2.1.23 and works in all current versions.

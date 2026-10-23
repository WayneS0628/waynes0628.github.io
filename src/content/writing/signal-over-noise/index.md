---
title: "Signal over noise: rebuilding this site"
summary: Why I scrapped my template portfolio, the one idea the new site is built around, and how it got made.
date: 2026-10-23
---

My old site was a purchased Jekyll theme with my name typed into it. The headline said I was "a dedicated computer science student passionate about machine learning," which is true of roughly every CS student alive. Three of the four featured projects were the same Titanic dataset. There was a test post sitting on the homepage. None of it said anything a recruiter couldn't guess from my resume header.

So I started over with one idea: **signal over noise.**

## Why that idea

It's the thread through everything I care about. Machine learning is finding the signal in messy data. [CleanTube](/work/cleantube/) exists to cut the algorithmic noise out of YouTube. My long-term goal, using data and AI for child protection and anti-trafficking work, is about finding what matters in data that's overwhelming by design. The site should feel like that too: quiet, focused, nothing extra.

## What's on it

- **Every project is a model card.** Task, data, model, key metric, stack, and status (shipped, training, or planned) up front, then the write-up. You can see in ten seconds what I built and how it went.
- **A project map.** Each project's description is embedded with a small language model and squashed into two dimensions, so similar work lands close together. It's a tiny latent space of my portfolio.
- **The loading screen trains a model.** `wayne.fit()` runs a fake training loop where noise resolves into a clean signal, which becomes the line across the city skyline.
- **Music, if you want it.** Turn on `[audio]` and you get a lofi loop that's generated live in your browser. No audio file. Off by default, obviously.
- **What I'm listening to.** The player on the homepage shows my last played song from Spotify.

## How it got built

I wrote a spec first: the concept, the colors, the information architecture, the features, and the rules. Then I built it with Claude Code. I made the calls, reviewed every pull request, and supplied the real content; Claude wrote most of the code. Same honesty rule as CleanTube: I'd rather say that plainly than let anyone assume otherwise.

Two rules from the spec are enforced by the build itself:

1. **No invented numbers.** Every metric on this site is real. Anything I hadn't measured yet showed up as a loud orange `TODO` box until I filled it in.
2. **No em dashes.** The build literally fails if one sneaks in.

## What's next

My Break Through Tech AI Studio team is training the transformer for the [contract triage](/work/cuad-contract-triage/) project right now, and more projects are coming out of a November and December sprint. When they ship, they'll show up here as model cards, honest numbers included.

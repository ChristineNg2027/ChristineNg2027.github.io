---
title: Pre-Vision
order: 1
status: In progress
glance:
  - { label: Role, value: Independent research project }
  - { label: Dates, value: Sep 2026–present }
  - { label: Status, value: In progress }
  - { label: Tools, value: 'Python, PyTorch, Google Colab' }
  - { label: Data, value: Ego-Exo4D }
hero:
  kind: diagram
  caption: 'How Pre-Vision decides when to act. Video and audio features are fused, by concatenation or a learned gate; two heads predict what comes next and when; a confidence estimate and an intervention policy then choose to act now, wait, or stay silent.'
card:
  line: Anticipating the next step of a physical task, and when it will happen, from video and head-worn audio.
  meta: In progress, 2026
---

## The question

An assistant that helps with a physical task, such as a robot passing a tool or smart glasses giving a hint, is useful only if it acts at the right moment. Too early and it interrupts; too late and the help is useless. Most activity models are judged on whether they recognize the step correctly, not on whether they know *when* it is coming. Pre-Vision asks how early a model can anticipate the next step of a task, and whether adding sound helps it decide when to act.

## What I'm building

- **Data.** About 400 recordings from 88 people repairing bikes and cooking, from the Ego-Exo4D dataset. The video is filmed from a third-person camera; the audio comes from a head-worn microphone, because the dataset's room cameras have no sound. The task is to predict the next change of step (51 step classes) and the time until it happens.
- **Evaluation that avoids shortcuts.** Train and test on different people (5-fold, grouped by participant), stamp every feature at the end of its time window so the model never sees the future, and check these rules with unit tests on the real data. Accuracy is measured at 4, 3, 2, 1 and 0.5 seconds before each step change.
- **Separating speech from sound.** Before training anything, I watched 33 recordings. Tool sounds often indicated the kind of action under way, but not the specific step, and a few participants narrated what they were doing. Because narration could make audio look more useful than it is, I chose a general-sound audio model (BEATs) over a speech model, and I will report audio results separately for moments with and without speech.
- **An intervention simulator, built before the models.** It replays predictions against the real timeline and scores each policy (react after the fact, act on confidence alone, act a fixed time early, or act based on predicted timing) as premature, on time or late, across a range of assistant response delays. Building it first meant the main question had an evaluation before any model existed.

## What I've learned so far

- **Fixed-offset examples give wrong labels.** The usual way to build anticipation examples steps back a fixed 4 s from each step change. That often lands before an earlier step change, and it makes the time until the next step constant, so a model cannot learn timing. I train on every time step instead, and evaluate at fixed horizons only where the label is valid.
- **The data audit caught a label bug.** The dataset reuses step IDs across parent steps, so the obvious lookup assigns wrong labels. I fixed it and added a regression test.
- **Timing rules, tested with perfect predictions.** Even with a perfect model, acting on confidence alone is often premature, and reacting after a step starts is always late by the full response delay. A rule based on predicted timing needs to aim slightly early, because it decides only every 0.53 s.
- **Sanity checks before comparing senses.** On random features, the training pipeline scores at the level of always guessing the most common step, as it should. On real features, the first run memorized the training recordings within one epoch, because neighbouring moments share a label and look almost the same. I added early stopping on a held-out group of people.

[[TODO: results and chart]]

## Where this goes next

A learned gate shows how much the model *relies* on each sense, not what each sense uniquely *contributes*. Next, I want to measure how redundant, unique and complementary sight and sound are at each moment before a step change, to explain when a sense becomes informative rather than only whether it helps on average.

<p class="note"><strong>Scope.</strong> Teammates are designing the robot hardware; my part is the perception and timing system, with the robot's response delay treated as a variable in the simulator.</p>

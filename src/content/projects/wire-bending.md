---
title: Wirebending
order: 2
status: Ongoing
glance:
  - { label: Lab, value: 'Programmable Matter Lab, University of Washington' }
  - { label: Dates, value: July 2025–present }
  - { label: Status, value: Ongoing }
  - { label: Tools, value: 'Python, OpenCV, Blender' }
  - { label: Guided by, value: Prof. Martin Nisser }
hero:
  kind: video
  caption: '[[TODO: project video]]'
card:
  line: Recovering a 3D wire shape from a few photos of a hand-bent prototype, framed as finding the most probable wire.
  meta: 'Programmable Matter Lab, 2025–present'
---

## Before this

The lab's Blender tool turns a traced 3D wire path into feed, bend and rotate commands for a desktop wire-bending machine. I joined after the team had built that core pipeline, and from July 2025 to April 2026 I added two pieces to it:

- **Collision detection.** The tool now warns when a part cannot be bent. Each wire segment is checked against padded bounding boxes of the machine body, peg and bender, and against the rest of the wire. Users can mark every collision in a program at once, or pause the animation on the exact frame of the first one.
- **Machine-accurate simulation.** The animation moves the real machine's parts through the physical bend sequence, with speeds matched to the machine, so the collision check reflects how the part is actually made.

## The problem

The lab's wire-bending machine needs a precise 3D model of every design. Writing a Blender tool to check designs for collisions (wire against itself and against the machine, using bounding volumes) showed me that the harder barrier came earlier: wire is a material people can shape directly with their hands, yet every design had to begin as a 3D model. I wanted to let people bend a prototype by hand, photograph it, and get a machine-ready design back.

## What I built

The wire stands on a printed sheet of markers, which gives every photo an exact camera position and real millimetre scale. I designed and built a reconstruction method that proposes a whole wire shape and scores how well it explains the photos, then keeps the best one.

- **Prior.** Simple wires are more believable: each extra bend and each extra millimetre costs score. Without this, every small wiggle in the photos becomes a bend.
- **Likelihood.** Project the candidate wire into each photo; pixels labelled *wire* raise the score, pixels labelled *background* lower it. Each pixel counts once, so a duplicate line over wire that is already explained gains nothing.
- **Photos are not independent.** Photos taken under the same lighting, calibration and labelling repeat each other's mistakes, so agreement between them is discounted: four photos count as about two independent ones.
- **Search.** A fast coarse estimate (which 1 mm cubes are probably wire, joined into a path) gives a starting shape; hill climbing then moves, slides, adds and removes bend points until no change improves the score. No randomness, so the same photos always give the same answer.

<figure>
  <div class="placeholder-box media-placeholder" aria-hidden="true"></div>
  <figcaption>[[TODO: stage overlays]]</figcaption>
</figure>

## Results

| Test set (photos) | Previous pipeline | This method | Speed-up | Largest gap between the two |
|---|---|---|---|---|
| `marker_cube2` (4) | 9 points, 6.7 s | 9 points, 2.7 s | 2.5× | 2.9 mm |
| `marker_l_shape` (4) | 5 points, 3.1 s | 5 points, 2.0 s | 1.6× | 1.2 mm |
| `marker_flat` (3) | 4 points, 3.7 s | 4 points, 1.6 s | 2.3× | 2.1 mm |
| `marker_3` (5) | 9 points, 39.5 s | 9 points, 2.8 s | 14× | 5.9 mm |
| `marker_cube_set` (12) | 9 points, 20.5 s | 9 points, 8.3 s | 2.5× | 1.8 mm |

<p class="caption">Compared with the previous pipeline on the same photo sets.</p>

- **Same shapes, faster.** On all five sets, the new method finds the same number of points as the previous pipeline and runs 1.6–14× faster.
- **Accurate against the real program.** Checked against the bend program used to make the cube, 7 of its 8 segment lengths match within 1.5 mm and every rotation within 6°.
- **Finds wire the earlier methods missed.** On one photo set, it recovered an 80 mm hook at the end of the wire that both earlier methods had missed.
- **Testing the search, not just the score.** On synthetic shapes with known answers, the scoring already preferred the true shape, so I focused on the search. Letting it add bends as well as remove them took a 20° zigzag from 0 of 4 bends found to all 4.

## Where this goes next

- Caliper measurements on several parts, to report length and angle accuracy for each photo set.
- Depth-ordered pixel scoring and tip detection, for wires whose ends come close together.
- Combining the two methods: colored dots on the wire for exact bends, with the marker sheet underneath for real scale.
- Curved segments (arcs or splines) in addition to straight runs.

## What this taught me

More observations help only when they add information the others lack. That idea carried into [Pre-Vision](/pre-vision/), where the question becomes which sense adds information about an activity, and when.

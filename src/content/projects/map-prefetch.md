---
title: Smart Map Prefetcher
order: 3
status: In progress
glance:
  - { label: Role, value: Independent research project }
  - { label: Dates, value: '[[TODO: dates]]' }
  - { label: Status, value: In progress }
  - { label: Tools, value: 'JavaScript, Python, scikit-learn, cvxpy, WebGazer.js' }
  - { label: Code, value: GitHub, href: 'https://github.com/ChristineNg2027/map_prefetch' }
hero:
  kind: image
  image: ../../assets/map-prefetch-data-collection.png
  alt: 'The data-collection page: a web map of Seattle with controls for logging, prefetching, gaze tracking and participant ID along the top, and a latency comparison panel on the right.'
  caption: 'The data-collection page. While a participant uses the map, it logs viewport, pointer, gaze and tilt signals; the panel on the right compares tile-load times with prefetching on and off.'
card:
  line: Predicting a map user's next move from gaze, pointer, viewport and device-tilt signals, and measuring what each signal uniquely adds.
  meta: Independent research project
  image: ../../assets/map-prefetch-data-collection.png
---

## The question

When someone pans or zooms a web map, the new tiles take time to load. If a system could tell what the user is about to do, it could fetch those tiles first. The question underneath is about people rather than caching: which behavioural signals show an intention before the action happens, and how far in advance?

I treat the next move as one of 10 intents (8 pan directions, zoom in, zoom out) and predict it from four signals:

| Signal | What it captures |
|---|---|
| **Viewport** | The map's recent history: zoom level, time since the map settled, the last two moves |
| **Pointer** | Cursor position and velocity relative to the map, idle time, scroll-wheel activity |
| **Gaze** | Where the user is looking, estimated from an ordinary webcam with WebGazer.js |
| **Device tilt** | Phone orientation and its recent change |

## What I built

A complete pipeline, from data collection in the browser to prediction in the browser:

- **Data collection.** The map page records all four signals into 2-second buffers. At each decision point (when the map settles, every 500 ms while it stays still, and the moment the user grabs it), it turns the buffers into 23 features and saves them with the move that follows.
- **Training and evaluation.** A random forest is trained on each combination of signals and compared with two baselines: always guessing the most common intent, and repeating the last move. Accuracy is reported by lead time, meaning how long before the move each prediction was made, which answers the research question directly.
- **What each signal adds.** For each pair of signals, a partial information decomposition (following Liang et al., 2023) splits what they know about the next move into parts that are redundant, unique to one signal, or synergistic (available only when both are combined). It is solved as a convex program in cvxpy.
- **Prediction and prefetching in the browser.** The trained forest is exported to plain JavaScript and runs in the page with no server. It predicts the two most likely moves and requests the tiles each one would reveal.
- **Measured latency.** Every move logs its real tile-load time and whether prefetching was on, so the benefit is measured as an on-versus-off comparison with a bootstrap 95% confidence interval.

## Making the numbers trustworthy

Most of the work went into making sure the results mean what they appear to mean.

- **Auditing my own first version.** An early prototype reported 84% accuracy. When I audited it, I found that some input features were computed from the move being predicted, so the model was partly reading the answer, and its 32% latency reduction came from a simulation rather than a measurement. I withdrew both results and redesigned the pipeline so these problems cannot happen again.
- **Training and deployment see the same features.** The browser logs features exactly as the live model will see them; Python only computes the label, which always comes from a later move.
- **No shortcuts.** A prediction taken at the first scroll-wheel event would already know the zoom direction, so the logger takes no snapshot there.
- **Splits by person.** Snapshots from one pause are near-duplicates, so evaluation holds out whole participants (or whole sessions when there is only one).
- **Independent signals.** By default, WebGazer keeps calibrating from mouse movement, which would make gaze partly a copy of the pointer. I turn that off after calibration so the comparison between the two is fair.
- **Information estimates against a noise floor.** Each estimate is reported next to the value it takes when the labels are shuffled. On simulated data, synergy reaches 0.2 to 0.5 bits from noise alone, so this floor matters.
- **A tested deployed model.** An end-to-end test in GitHub Actions drives the real logger with scripted users, trains and exports a model, and checks that the JavaScript forest matches scikit-learn's probabilities (maximum difference about 1e-5). It also checks the information decomposition on three textbook cases with known answers.

The pipeline runs end to end on simulated sessions and on a one-person pilot (3 sessions, 26 moves, 133 labelled snapshots).

## Where this goes next

- A participant study with a shared, rotated set of map tasks.
- An open map library (Leaflet or MapLibre), where tile URLs are known, to confirm that prefetched tiles are the ones the map uses.
- Prefetching switched on and off at random for each move.
- Gaze tracking with more people, and tilt on real phones.
- Sequence models over the raw event stream, compared with the forest.

## What this taught me

The most valuable step in this project was taking apart a result that looked good. How the data is split, which baselines are used and how much noise is in each estimate decide what a result means. The same question, what each signal uniquely adds, is the one I want to ask about sight and sound in [Pre-Vision](/pre-vision/).

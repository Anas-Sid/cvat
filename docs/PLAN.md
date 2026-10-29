# Plan: Annotation Analytics for CVAT

**Author:** Anas Siddiqui · **Branch:** `dev-test01` · **Start:** 2026-10-29 16:56 PKT (UTC+5), deadline 2026-10-30 00:56 PKT · **Time box:** 8 hours
**Base commit:** `b36a49bd5cc7e5fe3fc36ecb6036659c8136b780` (cvat-ai/cvat `develop`)
**Machine:** Intel Core i7-9750H (6 cores / 12 threads), 16 GB RAM, macOS 15.7.9, Docker 29.7.2 (7.75 GB given to Docker)
**Data:** COCO 2017 val, first 500 images by file name, 3,541 COCO objects, 78 classes, loaded as Task #1

## Goal

Add one endpoint that returns how many annotations each label has in a task, and one page in the
CVAT UI that shows those counts as a bar chart. Make the floor (items 1 to 4) solid before anything else.

## What I found before writing this plan

- Label of a drawn shape: `engine.LabeledShape.label` → `engine.Label.name`. A shape belongs to a
  `Job`, a job to a `Segment`, a segment to a `Task`.
- Importing COCO gives **3,953 shape rows but only 3,541 objects**. COCO objects made of several
  polygons are stored as one row per polygon, linked by the same `group` number on the same frame.
  Counting rows gives `person = 1217`; COCO says `person = 1088`.
- Tasks can have ground-truth and consensus-replica jobs that copy annotations. Counting them would
  double-count.
- `engine.permissions.TaskPermission` already answers "can this user view this task?" through OPA.
- `chart.js` and `react-chartjs-2` are already in `cvat-ui/package.json`. No new dependency needed.
- CVAT has no WebSocket layer today (no Django Channels, server runs under WSGI).

## Order of work and time budget

| # | Step | Budget |
|---|------|--------|
| 0 | This plan, Definition of Done and Objective targets, committed before any code | 0:30 |
| 1 | New Django app `cvat/apps/test`: endpoint `GET /api/test/tasks/{id}/label-counts`. One grouped query in the database. Only `annotation` jobs. Grouped polygon parts counted once. | 1:15 |
| 5 | Login and access: reuse CVAT session/token auth and `TaskPermission` view scope. 401 with no login, 403 for `user2` who has no access. Done together with step 1 because the view needs it anyway; evidence recorded as its own commit. | 0:30 |
| 2–3 | UI page at `/tasks/:tid/label-counts`, a link from the task page, bar chart with `react-chartjs-2` | 1:30 |
| 4 | Empty state ("no annotations yet") and error state with a Retry button | 0:30 |
| 6 | Measure the endpoint speed objective, 5 runs, raw output saved | 0:45 |
| 7 | Filter by job (`?job_id=`), so a lead can check one annotator's class balance | 0:45 |
| 10 | Finish docs: tick Definition of Done with evidence, decision record, what I did not reach | 0:30 |
| – | Pull request inside my own fork, Loom recording | 0:45 |
|   | **Total** | **7:00** + 1:00 buffer |

Check against the known task: the endpoint result for Task #1 must equal the per-class counts
computed directly from `instances_val2017` for the same 500 images.

## Decided to skip

- **Items 8 and 9 (live updates over WebSocket, reconnect).** CVAT has no WebSocket server. Adding
  Django Channels and an ASGI server touches deployment, Traefik and every container, which I
  cannot do well and also finish items 1 to 7 in 8 hours. If time is left I will write how I would
  do it, not ship a half version.
- Tracks (video) are counted once per track, but I am not testing with video data.
- No caching layer. I will only add one if the measured speed misses the target.

## Risks

- UI build is slow. I run the webpack dev server against the Docker backend so I do not rebuild images.
- Docker has 7.75 GB of RAM, just under the suggested 8 GB. I keep the dataset at 500 images.

## Changes to this plan

_(Filled in as work happens, with the time and the reason.)_

## Decision record

_(Filled in at the end: approach taken, approach rejected, and what rejecting it cost.)_

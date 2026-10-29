# Definition of Done

Written before starting. Each line is ticked only with a number, output or link beside it.

## Floor (items 1 to 4)

- [ ] Endpoint returns per-label counts for Task #1 that equal the counts computed from the COCO file for the same 500 images (3,541 objects, 78 labels, `person = 1088`).
- [ ] Count is done by one grouped query in the database, not by loading shapes into Python.
- [ ] Ground-truth and consensus-replica jobs are not counted.
- [ ] Page opens from the task page and shows a bar chart of the counts.
- [ ] Task with no annotations shows a clear empty message, not an empty chart.
- [ ] Failed request shows an error message and a working Retry button.

## Access (item 5)

- [ ] No login → `401`, shown with raw `curl` output.
- [ ] Logged in as `user2`, who has no access to Task #1 → `403`, shown with raw `curl` output.
- [ ] `admin` → `200`.

## Measurement (item 6)

- [ ] MO-1 measured, 5 runs, raw output saved in the repo.
- [ ] Target met, or missed with the reason written down.

## Filter (item 7)

- [ ] `?job_id=` returns counts for one job only; a job from another task returns `400`/`404`.

## Hand-in

- [ ] Plan was the first commit; commits are small and say what and why.
- [ ] No dead code, no commented-out blocks, no stray files in the diff.
- [ ] Pull request opened from `dev-test01` into `main` of **my own fork** only.
- [ ] Everything I did not finish is listed below with the reason.
- [ ] Loom recorded, 5 minutes or less.

## Not finished

_(Filled in at the end.)_

# Definition of Done

Written before starting. Each line is ticked only with a number, output or link beside it.

## Floor (items 1 to 4)

- [x] Endpoint returns per-label counts for Task #1 that equal the counts computed from the COCO file for the same 500 images (3,541 objects, 78 labels, `person = 1088`).
  Evidence: script compared the API response with the COCO file: `total 3541 expected 3541 | labels 80 nonzero 78 | mismatches: NONE`. Top three: `person 1088, chair 201, car 169`.
- [x] Count is done by grouped queries in the database, not by loading shapes into Python.
  Evidence: `CaptureQueriesContext` around `count_annotations_per_label` shows 4 queries: one `GROUP BY label_id` each for `engine_labeledshape`, `engine_labeledtrack` and `engine_labeledimage`, plus one for the labels. Changed from "one query": shapes, tracks and tags live in three tables.
- [x] Ground-truth and consensus-replica jobs are not counted.
  Evidence: filter `job__type=JobType.ANNOTATION` in `cvat/apps/test/label_counts.py`. Not tested with a real GT job (none in Task #1).
- [ ] Page opens from the task page and shows a bar chart of the counts.
- [ ] Task with no annotations shows a clear empty message, not an empty chart.
- [ ] Failed request shows an error message and a working Retry button.

## Access (item 5)

- [x] No login → `401`, shown with raw `curl` output.
- [x] Logged in as a user with no access to Task #1 → `403`, shown with raw `curl` output.
  Changed from `user2`: `user2` had been set as the task assignee in the UI, and CVAT rightly lets
  an assignee read the task (`is_task_staff` in `engine/rules/tasks.rego`). I created `user3`, a plain
  user who is neither owner nor assignee, for this check.
- [x] `admin` → `200`.

Raw output (tokens replaced with `<user>`):

```text
# no login
$ curl -s -w '\nHTTP %{http_code}\n' http://localhost:8080/api/test/tasks/1/label-counts
{"detail":"Authentication credentials were not provided."}
HTTP 401

# user3: plain user, not owner or assignee of task 1
$ curl -s -w '\nHTTP %{http_code}\n' -H 'Authorization: Token <user3>' http://localhost:8080/api/test/tasks/1/label-counts
{"detail":"You do not have permission to perform this action."}
HTTP 403

# admin
$ curl -s -w '\nHTTP %{http_code}\n' -H 'Authorization: Token <admin>' http://localhost:8080/api/test/tasks/1/label-counts | tail -c 120
":79,"name":"hair drier","color":"#804020","count":0},{"id":71,"name":"toaster","color":"#902000","count":0}]}
HTTP 200
```

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

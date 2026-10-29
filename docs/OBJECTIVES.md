# Objectives

**Machine:** Intel Core i7-9750H (6 cores / 12 threads), 16 GB RAM, macOS 15.7.9, Docker 29.7.2 (7.75 GB given to Docker)
**CVAT commit cloned:** `b36a49bd5cc7e5fe3fc36ecb6036659c8136b780`

## MO-1: Label count endpoint response time

| Field | Entry |
|---|---|
| What is measured | Total time for `GET /api/test/tasks/1/label-counts` to return a full response, as seen by the client. |
| How | `curl -w '%{time_total}'` from the host to `http://localhost:8080`, token auth, script saved in the repo. One warm-up request, then 20 requests in a row. The value of a run is the median of its 20 requests. |
| Target | Median of 5 runs **at or below 150 ms**. |
| Conditions | Local Docker stack from `docker-compose.yml`, Task #1 (500 images, 3,953 shape rows, 3,541 objects), logged in as `admin`, no other heavy apps running. |
| Not included | Browser rendering of the chart, the first request after a server restart, tasks with video tracks. |

**Why 150 ms:** The chart page makes one call to this endpoint. Under about 100 to 200 ms a page still
feels instant to a user. CVAT's own task API sits in the same Django stack, so 150 ms leaves room for
auth, the OPA permission check and JSON, while still forcing the count to happen in the database and
not in Python.

### Result

_(Filled in after measuring: 5 run values, median, spread, raw output.)_

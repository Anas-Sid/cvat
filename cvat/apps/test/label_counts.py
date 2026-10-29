# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

from django.db.models import CharField, Count, Q, QuerySet, Value
from django.db.models.functions import Concat

from cvat.apps.engine.models import JobType, LabeledImage, LabeledShape, LabeledTrack, Task

# Shapes imported as one object but drawn as several parts (e.g. a COCO object
# with a multi-polygon segmentation) share a non-zero group id on the same frame.
_UNGROUPED = Q(group__isnull=True) | Q(group=0)


def _count_objects_per_label(queryset: QuerySet) -> dict[int, int]:
    rows = (
        queryset.values("label_id")
        .annotate(
            objects=Count("id", filter=_UNGROUPED)
            + Count(
                Concat("frame", Value(":"), "group", output_field=CharField()),
                distinct=True,
                filter=~_UNGROUPED,
            )
        )
        .values_list("label_id", "objects")
    )
    return dict(rows)


def count_annotations_per_label(task: Task) -> list[dict]:
    """
    Counts annotation objects per label in the annotation jobs of a task.

    Ground truth and consensus replica jobs are skipped, because they hold copies
    of annotations that are already counted. Skeleton points are counted as part
    of their skeleton, not on their own.
    """
    job_filter = {"job__segment__task_id": task.id, "job__type": JobType.ANNOTATION}

    totals: dict[int, int] = {}
    for model in (LabeledShape, LabeledTrack, LabeledImage):
        queryset = model.objects.filter(**job_filter)
        if model is not LabeledImage:
            queryset = queryset.filter(parent__isnull=True)

        for label_id, objects in _count_objects_per_label(queryset).items():
            totals[label_id] = totals.get(label_id, 0) + objects

    counts = [
        {"id": label.id, "name": label.name, "color": label.color, "count": totals.get(label.id, 0)}
        for label in task.get_labels()
    ]
    counts.sort(key=lambda c: (-c["count"], c["name"]))
    return counts

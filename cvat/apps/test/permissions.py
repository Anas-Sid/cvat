# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

from cvat.apps.engine.permissions import TaskPermission


class LabelCountsPermission(TaskPermission):
    """
    Label counts reveal what is annotated in a task, so they need the same
    access as reading the task annotations.
    """

    @classmethod
    def create(cls, request, view, obj, iam_context):
        if obj is None:
            return []

        return [cls(**iam_context, obj=obj, scope=cls.Scopes.VIEW_ANNOTATIONS)]

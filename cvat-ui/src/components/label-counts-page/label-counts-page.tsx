// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import './styles.scss';

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Row, Col } from 'antd/lib/grid';
import Title from 'antd/lib/typography/Title';
import Text from 'antd/lib/typography/Text';
import {
    Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

import { getCore } from 'cvat-core-wrapper';
import CVATLoadingSpinner from 'components/common/loading-spinner';
import GoBackButton from 'components/common/go-back-button';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

const core = getCore();

const BAR_HEIGHT_PX = 18;

interface LabelCount {
    id: number;
    name: string;
    color: string;
    count: number;
}

interface TaskLabelCounts {
    task_id: number;
    total: number;
    labels: LabelCount[];
}

async function fetchLabelCounts(taskId: number): Promise<TaskLabelCounts> {
    const response = await core.server.request(
        `${core.config.backendAPI}/test/tasks/${taskId}/label-counts`,
        { method: 'GET' },
    ) as { data: TaskLabelCounts };
    return response.data;
}

function LabelCountsChart({ labels }: { labels: LabelCount[] }): JSX.Element {
    return (
        <div style={{ height: labels.length * BAR_HEIGHT_PX + 60 }}>
            <Bar
                data={{
                    labels: labels.map((label) => label.name),
                    datasets: [{
                        label: 'Annotations',
                        data: labels.map((label) => label.count),
                        backgroundColor: labels.map((label) => label.color || '#1890ff'),
                    }],
                }}
                options={{
                    indexAxis: 'y',
                    maintainAspectRatio: false,
                    animation: false,
                    scales: { x: { beginAtZero: true, ticks: { precision: 0 } } },
                }}
            />
        </div>
    );
}

function LabelCountsPage(): JSX.Element {
    const taskId = +useParams<{ tid: string }>().tid;
    const [counts, setCounts] = useState<TaskLabelCounts | null>(null);

    useEffect(() => {
        fetchLabelCounts(taskId).then(setCounts);
    }, [taskId]);

    return (
        <Row className='cvat-label-counts-page' justify='center'>
            <Col span={22} xl={18} xxl={14}>
                <GoBackButton />
                <div className='cvat-label-counts-inner'>
                    <Title level={4} className='cvat-text-color'>
                        {`Annotations per label in task #${taskId}`}
                    </Title>
                    {counts ? (
                        <>
                            <Text type='secondary'>{`${counts.total} annotations in ${counts.labels.length} labels`}</Text>
                            <LabelCountsChart labels={counts.labels} />
                        </>
                    ) : <CVATLoadingSpinner />}
                </div>
            </Col>
        </Row>
    );
}

export default React.memo(LabelCountsPage);

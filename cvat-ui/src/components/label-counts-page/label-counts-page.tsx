// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import './styles.scss';

import React, {
    useCallback, useEffect, useMemo, useState,
} from 'react';
import { useParams } from 'react-router';
import { Row, Col } from 'antd/lib/grid';
import Alert from 'antd/lib/alert';
import Button from 'antd/lib/button';
import Card from 'antd/lib/card';
import Radio from 'antd/lib/radio';
import Select from 'antd/lib/select';
import Statistic from 'antd/lib/statistic';
import Title from 'antd/lib/typography/Title';
import { ReloadOutlined } from '@ant-design/icons';
import {
    Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';

import { getCore } from 'cvat-core-wrapper';
import CVATLoadingSpinner from 'components/common/loading-spinner';
import GoBackButton from 'components/common/go-back-button';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

const core = getCore();

const BAR_HEIGHT_PX = 26;
const DEFAULT_BAR_COLOR = '#1890ff';

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

type SortOrder = 'count' | 'name';

async function fetchLabelCounts(taskId: number): Promise<TaskLabelCounts> {
    const response = await core.server.request(
        `${core.config.backendAPI}/test/tasks/${taskId}/label-counts`,
        { method: 'GET' },
    ) as { data: TaskLabelCounts };
    return response.data;
}

function percentOf(count: number, total: number): string {
    return total ? `${((count / total) * 100).toFixed(1)}%` : '0%';
}

function LabelCountsChart({ labels, total }: { labels: LabelCount[], total: number }): JSX.Element {
    return (
        <div className='cvat-label-counts-chart' style={{ height: labels.length * BAR_HEIGHT_PX + 50 }}>
            <Bar
                plugins={[ChartDataLabels]}
                data={{
                    labels: labels.map((label) => label.name),
                    datasets: [{
                        data: labels.map((label) => label.count),
                        backgroundColor: labels.map((label) => label.color || DEFAULT_BAR_COLOR),
                        borderRadius: 4,
                        maxBarThickness: 18,
                    }],
                }}
                options={{
                    indexAxis: 'y',
                    maintainAspectRatio: false,
                    animation: false,
                    layout: { padding: { right: 90 } },
                    scales: {
                        x: {
                            beginAtZero: true,
                            position: 'top',
                            ticks: { precision: 0 },
                            grid: { color: '#f0f0f0' },
                        },
                        y: { grid: { display: false }, ticks: { font: { size: 13 } } },
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: (item) => {
                                    const count = item.parsed.x;
                                    return ` ${count.toLocaleString()} annotations (${percentOf(count, total)})`;
                                },
                            },
                        },
                        datalabels: {
                            anchor: 'end',
                            align: 'end',
                            clamp: true,
                            color: '#595959',
                            font: { size: 12 },
                            formatter: (count: number) => `${count.toLocaleString()} (${percentOf(count, total)})`,
                        },
                    },
                }}
            />
        </div>
    );
}

function LabelCountsPage(): JSX.Element {
    const taskId = +useParams<{ tid: string }>().tid;
    const [counts, setCounts] = useState<TaskLabelCounts | null>(null);
    const [selectedNames, setSelectedNames] = useState<string[]>([]);
    const [sortOrder, setSortOrder] = useState<SortOrder>('count');

    const load = useCallback(() => {
        setCounts(null);
        fetchLabelCounts(taskId).then(setCounts);
    }, [taskId]);

    useEffect(load, [load]);

    const shownLabels = useMemo(() => {
        if (!counts) return [];
        const filtered = selectedNames.length ?
            counts.labels.filter((label) => selectedNames.includes(label.name)) :
            [...counts.labels];
        if (sortOrder === 'name') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        }
        return filtered;
    }, [counts, selectedNames, sortOrder]);

    let content = <CVATLoadingSpinner />;
    if (counts) {
        const emptyLabels = counts.labels.filter((label) => label.count === 0);
        const [mostCommon] = counts.labels;

        content = (
            <>
                <Row gutter={16} className='cvat-label-counts-stats'>
                    <Col span={6}>
                        <Card size='small'><Statistic title='Total annotations' value={counts.total} /></Card>
                    </Col>
                    <Col span={6}>
                        <Card size='small'>
                            <Statistic
                                title='Labels in use'
                                value={counts.labels.length - emptyLabels.length}
                                suffix={`/ ${counts.labels.length}`}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card size='small'>
                            <Statistic
                                title='Most common'
                                value={mostCommon?.name ?? '-'}
                                suffix={mostCommon ? `(${percentOf(mostCommon.count, counts.total)})` : ''}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card size='small'>
                            <Statistic title='Labels with no annotations' value={emptyLabels.length} />
                        </Card>
                    </Col>
                </Row>
                {emptyLabels.length > 0 && (
                    <Alert
                        className='cvat-label-counts-empty-labels'
                        type='warning'
                        showIcon
                        message={`No annotations yet for: ${emptyLabels.map((label) => label.name).join(', ')}`}
                    />
                )}
                <Row className='cvat-label-counts-controls' gutter={16} align='middle'>
                    <Col flex='auto'>
                        <Select
                            mode='multiple'
                            allowClear
                            placeholder='Filter by label name, e.g. person, car'
                            className='cvat-label-counts-filter'
                            value={selectedNames}
                            onChange={setSelectedNames}
                            options={counts.labels.map((label) => ({
                                value: label.name,
                                label: `${label.name} (${label.count})`,
                            }))}
                        />
                    </Col>
                    <Col>
                        <Radio.Group
                            optionType='button'
                            value={sortOrder}
                            onChange={(event) => setSortOrder(event.target.value)}
                            options={[
                                { label: 'Most annotated', value: 'count' },
                                { label: 'A to Z', value: 'name' },
                            ]}
                        />
                    </Col>
                </Row>
                <LabelCountsChart labels={shownLabels} total={counts.total} />
            </>
        );
    }

    return (
        <Row className='cvat-label-counts-page' justify='center'>
            <Col span={22} xl={18} xxl={14}>
                <GoBackButton />
                <div className='cvat-label-counts-inner'>
                    <Row justify='space-between' align='middle'>
                        <Title level={4} className='cvat-text-color'>
                            {`Label counts · Task #${taskId}`}
                        </Title>
                        <Button icon={<ReloadOutlined />} onClick={load} disabled={!counts}>
                            Refresh
                        </Button>
                    </Row>
                    {content}
                </div>
            </Col>
        </Row>
    );
}

export default React.memo(LabelCountsPage);

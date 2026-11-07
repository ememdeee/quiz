"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

// The only recharts consumer in the taker bundle — loaded via next/dynamic
// from WeightSummaryStep (and warmed at idle by QuizPageClient) so the
// recharts/d3 cluster stays out of the route's first-load JS.

interface WeightChartProps {
    chartData: { name: string; weight: number }[];
    unit: string;
}

export default function WeightChart({ chartData, unit }: WeightChartProps) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorWeightSummary" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--quiz-primary, #13ecc8)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--quiz-primary, #13ecc8)" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                    dy={10}
                />
                <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number | string | undefined) => [`${value} ${unit}`, 'Weight']}
                />
                <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="var(--quiz-primary, #13ecc8)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorWeightSummary)"
                    activeDot={{ r: 6, fill: 'var(--quiz-primary, #13ecc8)', stroke: '#fff', strokeWidth: 2 }}
                    dot={{ r: 4, fill: '#fff', stroke: 'var(--quiz-primary, #13ecc8)', strokeWidth: 2 }}
                    animationDuration={1500}
                    animationEasing="ease-out"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type CashFlowPoint = { month: string; income: number; expense: number };

export function CashFlowChart({ data }: { data: CashFlowPoint[] }) {
  return <div className="mt-8 h-60 w-full min-w-0" role="img" aria-label="Income and expenses in naira over the past six months. Exact values are in the table below.">
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      <BarChart data={data} barGap={4} margin={{ top: 8, right: 0, left: 0, bottom: 0 }} accessibilityLayer>
        <CartesianGrid vertical={false} stroke="#edf0e8" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#8a957f" }} dy={10} />
        <YAxis axisLine={false} tickLine={false} width={65} tick={{ fontSize: 10, fill: "#8a957f" }} tickFormatter={(n: number) => new Intl.NumberFormat("en-NG", { notation: "compact", style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n)} />
        <Tooltip formatter={(value) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(Number(value))} cursor={{ fill: "#f5f7f0" }} contentStyle={{ border: "1px solid #e3e8da", borderRadius: 10, fontSize: 12 }} />
        <Bar name="Income" dataKey="income" fill="#2d6750" radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
        <Bar name="Expenses" dataKey="expense" fill="#cfdbb7" radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  </div>;
}

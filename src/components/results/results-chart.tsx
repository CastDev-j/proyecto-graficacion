"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface LineConfig {
  dataKey: string;
  stroke: string;
  name: string;
}

interface ResultsChartProps {
  title: string;
  description: string;
  data: any[];
  lines: LineConfig[];
  inPopover?: boolean;
  tourId?: string;
}

export function ResultsChart({
  title,
  description,
  data,
  lines,
  inPopover = false,
  tourId,
}: ResultsChartProps) {
  return (
    <Card
      className="overflow-hidden"
      data-tour={tourId}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-xs">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer
          width="100%"
          height={inPopover ? 260 : 330}
        >
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey="t"
              stroke="hsl(var(--foreground))"
              tick={{ fontSize: 11 }}
            />
            <YAxis
              stroke="hsl(var(--foreground))"
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {lines.map((line) => (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.stroke}
                strokeWidth={2}
                dot={false}
                name={line.name}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

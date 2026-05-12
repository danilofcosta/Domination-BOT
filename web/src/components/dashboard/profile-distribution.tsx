"use client";

import * as React from "react";
import {
  Pie,
  PieChart,
  Cell,
  Legend,
  Tooltip,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#6366f1",
  "#ef4444",
  "#8b5cf6",
];

interface ProfileDistributionProps {
  data: {
    name: string;
    value: number;
  }[];
}

const chartConfig = {
  value: {
    label: "Users",
  },
} satisfies ChartConfig;

export function ProfileDistribution({ data }: ProfileDistributionProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="flex flex-col h-full bg-card/50 backdrop-blur-sm border-primary/10 m-5 ">
        <CardHeader className="items-center pb-0">
          <CardTitle>Distribuição de Perfis</CardTitle>
          <CardDescription>Sem dados disponíveis</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0 flex items-center justify-center min-h-75">
          <p className="text-muted-foreground italic">
            Conecte a um banco de dados ativo para ver a distribuição
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex    flex-col h-full bg-card/50 backdrop-blur-sm border-primary/10 transition-all hover:border-primary/30  m-5">
      <CardHeader className="items-center pb-2">
        <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-blue-600">
          Distribuição de Perfis
        </CardTitle>
        <CardDescription>
          Contas registradas por nível de acesso
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 min-h-75">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-75"
        >
          <PieChart>
            <Tooltip
              content={<ChartTooltipContent hideLabel />}
              cursor={false}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={80}
              strokeWidth={5}
              paddingAngle={5}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

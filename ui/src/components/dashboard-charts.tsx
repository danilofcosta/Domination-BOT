"use client";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type DonutDatum = { name: string; value: number; color?: string };
type BarDatum = { label: string; value: number; color?: string };

interface DashboardChartsProps {
  waifusHusbandos: DonutDatum[];
  sourceTypeData: DonutDatum[];
  rarityData: BarDatum[];
  dailyData: { label: string; value: number }[];
  profileTypeData: DonutDatum[];
  languageData: DonutDatum[];
  mediaTypeData: DonutDatum[];
  topUsersData: BarDatum[];
  topPopularityData: BarDatum[];
  eventData: BarDatum[];
  topLikesData: BarDatum[];
}

const PALETTE = [
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f59e0b",
  "#22c55e",
  "#ef4444",
  "#3b82f6",
  "#14b8a6",
];

const tooltipStyle: React.CSSProperties = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--foreground)",
};

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-md">
      <h2 className="mb-4 text-sm font-semibold tracking-tight">{title}</h2>
      <div className="h-64">{children}</div>
    </div>
  );
}

export function DashboardCharts({
  waifusHusbandos,
  sourceTypeData,
  rarityData,
  dailyData,
  profileTypeData,
  languageData,
  mediaTypeData,
  topUsersData,
  topPopularityData,
  eventData,
  topLikesData,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard title="Waifus × Husbandos">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={waifusHusbandos}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              stroke="none"
            >
              {waifusHusbandos.map((d, i) => (
                <Cell key={i} fill={d.color ?? PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Personagens por tipo de fonte">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sourceTypeData}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              stroke="none"
            >
              {sourceTypeData.map((d, i) => (
                <Cell key={i} fill={d.color ?? PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Personagens por raridade (top 8)">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rarityData}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              interval={0}
            />
            <YAxis
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "var(--border)", opacity: 0.4 }}
              contentStyle={tooltipStyle}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Bar dataKey="value" name="Personagens" radius={[4, 4, 0, 0]} maxBarSize={32}>
              {rarityData.map((d, i) => (
                <Cell key={i} fill={d.color ?? PALETTE[i % PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Personagens adicionados (últimos 14 dias)">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dailyData}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              interval={0}
            />
            <YAxis
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "var(--border)", opacity: 0.4 }}
              contentStyle={tooltipStyle}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Bar dataKey="value" name="Personagens" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Perfis de usuários">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={profileTypeData}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              stroke="none"
            >
              {profileTypeData.map((d, i) => (
                <Cell key={i} fill={d.color ?? PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Idiomas dos usuários">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={languageData}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              stroke="none"
            >
              {languageData.map((d, i) => (
                <Cell key={i} fill={d.color ?? PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Tipos de mídia dos personagens">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={mediaTypeData}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              stroke="none"
            >
              {mediaTypeData.map((d, i) => (
                <Cell key={i} fill={d.color ?? PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Coleções por usuário (top 8)">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={topUsersData}
            layout="vertical"
            margin={{ top: 5, right: 5, left: 20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={120}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
            />
            <Tooltip
              cursor={{ fill: "var(--border)", opacity: 0.4 }}
              contentStyle={tooltipStyle}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Bar dataKey="value" name="Coleções" radius={[0, 4, 4, 0]} maxBarSize={18}>
              {topUsersData.map((d, i) => (
                <Cell key={i} fill={d.color ?? PALETTE[i % PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Personagens mais populares (top 8)">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={topPopularityData}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              interval={0}
            />
            <YAxis
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "var(--border)", opacity: 0.4 }}
              contentStyle={tooltipStyle}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Bar dataKey="value" name="Popularidade" radius={[4, 4, 0, 0]} maxBarSize={28}>
              {topPopularityData.map((d, i) => (
                <Cell key={i} fill={d.color ?? PALETTE[i % PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Personagens com mais curtidas (top 8)">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={topLikesData}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              interval={0}
            />
            <YAxis
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "var(--border)", opacity: 0.4 }}
              contentStyle={tooltipStyle}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Bar dataKey="value" name="Curtidas" radius={[4, 4, 0, 0]} maxBarSize={28}>
              {topLikesData.map((d, i) => (
                <Cell key={i} fill={d.color ?? PALETTE[i % PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Personagens por evento (top 8)">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={eventData}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              interval={0}
            />
            <YAxis
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "var(--border)", opacity: 0.4 }}
              contentStyle={tooltipStyle}
              labelStyle={{ color: "var(--foreground)" }}
            />
            <Bar dataKey="value" name="Personagens" radius={[4, 4, 0, 0]} maxBarSize={28}>
              {eventData.map((d, i) => (
                <Cell key={i} fill={d.color ?? PALETTE[i % PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

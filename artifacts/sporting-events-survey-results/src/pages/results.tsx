import { useMemo } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { useSurveyResults, SurveyResponse } from "@/hooks/use-survey";
import { Home, Loader2, Users, MapPin, Ticket, AlertCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  type TooltipProps
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

export default function Results() {
  const { data, isLoading, error } = useSurveyResults();

  const chartsData = useMemo(() => {
    if (!data) return null;

    // 1. Sports Aggregation
    const sportsMap: Record<string, number> = {};
    data.forEach((row) => {
      row.favorite_sports.forEach((sport) => {
        if (sport === "Other" && row.other_sport) {
          const normalized = row.other_sport.trim().toLowerCase();
          const titleCased = normalized.charAt(0).toUpperCase() + normalized.slice(1);
          sportsMap[titleCased] = (sportsMap[titleCased] || 0) + 1;
        } else if (sport !== "Other") {
          sportsMap[sport] = (sportsMap[sport] || 0) + 1;
        }
      });
    });
    
    const sportsData = Object.entries(sportsMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15); // Top 15 to keep chart legible

    // 2. States Aggregation
    const stateMap: Record<string, number> = {};
    data.forEach((row) => {
      stateMap[row.state] = (stateMap[row.state] || 0) + 1;
    });
    
    const totalResponses = data.length;
    const totalDistinctStates = Object.keys(stateMap).length;
    const statesData = Object.entries(stateMap)
      .map(([name, count]) => ({ 
        name, 
        count,
        percentage: ((count / totalResponses) * 100).toFixed(1) 
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 3. Attendance Aggregation
    const attendMap = { Yes: 0, No: 0, Unsure: 0 };
    data.forEach((row) => {
      const val = row.attending_event;
      if (val === "Yes" || val === "No" || val === "Unsure") {
        attendMap[val]++;
      }
    });
    const attendData = [
      { name: "Yes", count: attendMap.Yes },
      { name: "Unsure", count: attendMap.Unsure },
      { name: "No", count: attendMap.No },
    ];

    return { totalResponses, totalDistinctStates, sportsData, statesData, attendData };
  }, [data]);

  // Use the CSS variable directly for the chart fill
  // recharts can handle CSS variables if passed properly, but hex/rgb works best
  // In Tailwind v4 with HSL variables, we can extract it or hardcode the exact #DA3BDB equivalent
  const CHART_COLOR = "hsl(299, 68%, 55%)";

  const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload as { percentage?: string };
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg text-sm">
          <p className="font-semibold mb-1">{label}</p>
          <p className="text-primary font-medium">
            Count: {payload[0].value}
            {entry.percentage && ` (${entry.percentage}%)`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
          <Loader2 className="w-12 h-12 animate-spin mb-4 text-primary" />
          <p className="text-lg font-medium">Crunching the numbers...</p>
        </div>
      </Layout>
    );
  }

  if (error || !chartsData) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-32">
          <div className="bg-destructive/10 text-destructive p-6 rounded-2xl max-w-md text-center border border-destructive/20">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Could not load results</h2>
            <p className="opacity-90 text-sm">
              We encountered an error fetching the data. Make sure Supabase is correctly configured.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Survey Results</h1>
          <p className="text-muted-foreground text-lg">Community aggregate data and insights</p>
        </div>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-secondary text-secondary-foreground hover:bg-border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Responses</p>
            <p className="text-4xl font-display font-bold text-foreground">{chartsData.totalResponses}</p>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">States Rep'd</p>
            <p className="text-4xl font-display font-bold text-foreground">{chartsData.totalDistinctStates}</p>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Attending Event</p>
            <p className="text-4xl font-display font-bold text-foreground">
              {chartsData.totalResponses > 0 
                ? Math.round((chartsData.attendData[0].count / chartsData.totalResponses) * 100) 
                : 0}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Most Popular Sports */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm lg:col-span-2">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            Most Popular Sports
          </h2>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartsData.sportsData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="count" fill={CHART_COLOR} radius={[0, 4, 4, 0]}>
                  {chartsData.sportsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLOR} opacity={1 - (index * 0.04)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top States Represented */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            Top States Represented
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartsData.statesData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={90} tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="count" fill={CHART_COLOR} radius={[0, 4, 4, 0]} label={{ position: 'right', fill: 'hsl(var(--muted-foreground))', fontSize: 12, formatter: (val: number, entry?: { payload?: { percentage?: string } }) => `${entry?.payload?.percentage ?? ""}%` }}>
                  {chartsData.statesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLOR} opacity={1 - (index * 0.05)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event Attendance */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            Planning to Attend an Event
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartsData.attendData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--foreground))', fontSize: 14 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="count" fill={CHART_COLOR} radius={[6, 6, 0, 0]} maxBarSize={80}>
                   {chartsData.attendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLOR} opacity={index === 0 ? 1 : index === 1 ? 0.7 : 0.4} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
}

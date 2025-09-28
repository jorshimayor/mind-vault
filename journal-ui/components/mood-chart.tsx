"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react"

interface JournalEntry {
  id: string
  content: string
  mood: number
  date: string
  timestamp: string
  encrypted: boolean
}

interface MoodChartProps {
  entries: JournalEntry[]
}

export function MoodChart({ entries }: MoodChartProps) {
  const chartData = useMemo(() => {
    // Group entries by date and calculate average mood per day
    const groupedByDate = entries.reduce(
      (acc, entry) => {
        const date = entry.date
        if (!acc[date]) {
          acc[date] = { moods: [], date }
        }
        acc[date].moods.push(entry.mood)
        return acc
      },
      {} as Record<string, { moods: number[]; date: string }>,
    )

    // Calculate averages and format for chart
    return Object.values(groupedByDate)
      .map(({ moods, date }) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        fullDate: date,
        mood: Math.round((moods.reduce((sum, mood) => sum + mood, 0) / moods.length) * 10) / 10,
        entries: moods.length,
      }))
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
      .slice(-14) // Last 14 days
  }, [entries])

  const moodDistribution = useMemo(() => {
    const distribution = { challenging: 0, peaceful: 0, radiant: 0 }
    entries.forEach((entry) => {
      if (entry.mood <= 3) distribution.challenging++
      else if (entry.mood <= 6) distribution.peaceful++
      else distribution.radiant++
    })
    return [
      { name: "Challenging", value: distribution.challenging, color: "#ef4444" },
      { name: "Peaceful", value: distribution.peaceful, color: "#3b82f6" },
      { name: "Radiant", value: distribution.radiant, color: "#10b981" },
    ]
  }, [entries])

  const averageMood = useMemo(() => {
    if (entries.length === 0) return 0
    return entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length
  }, [entries])

  const moodTrend = useMemo(() => {
    if (chartData.length < 2) return "stable"
    const recent = chartData.slice(-3).reduce((sum, day) => sum + day.mood, 0) / 3
    const previous = chartData.slice(-6, -3).reduce((sum, day) => sum + day.mood, 0) / 3
    if (recent > previous + 0.5) return "improving"
    if (recent < previous - 0.5) return "declining"
    return "stable"
  }, [chartData])

  const getTrendIcon = () => {
    switch (moodTrend) {
      case "improving":
        return <TrendingUp className="w-4 h-4 text-green-400" />
      case "declining":
        return <TrendingDown className="w-4 h-4 text-red-400" />
      default:
        return <Minus className="w-4 h-4 text-cosmic-muted" />
    }
  }

  const getTrendColor = () => {
    switch (moodTrend) {
      case "improving":
        return "text-green-400"
      case "declining":
        return "text-red-400"
      default:
        return "text-cosmic-muted"
    }
  }

  if (entries.length === 0) {
    return (
      <Card className="p-8 text-center bg-cosmic-card/50 backdrop-blur-sm border-cosmic-border">
        <Calendar className="w-12 h-12 text-cosmic-muted mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-cosmic-foreground mb-2">No mood data yet</h3>
        <p className="text-cosmic-muted">Start journaling to see your mood trends</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Mood Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-cosmic-card/80 backdrop-blur-sm border-cosmic-border">
          <div className="text-center">
            <div className="text-2xl font-bold text-cosmic-accent mb-1">{averageMood.toFixed(1)}/10</div>
            <div className="text-sm text-cosmic-muted">Average Mood</div>
          </div>
        </Card>

        <Card className="p-4 bg-cosmic-card/80 backdrop-blur-sm border-cosmic-border">
          <div className="text-center">
            <div className={`text-2xl font-bold mb-1 flex items-center justify-center gap-2 ${getTrendColor()}`}>
              {getTrendIcon()}
              {moodTrend}
            </div>
            <div className="text-sm text-cosmic-muted">Recent Trend</div>
          </div>
        </Card>

        <Card className="p-4 bg-cosmic-card/80 backdrop-blur-sm border-cosmic-border">
          <div className="text-center">
            <div className="text-2xl font-bold text-cosmic-gold mb-1">{entries.length}</div>
            <div className="text-sm text-cosmic-muted">Total Entries</div>
          </div>
        </Card>
      </div>

      {/* Mood Trend Chart */}
      <Card className="p-6 bg-cosmic-card/80 backdrop-blur-sm border-cosmic-border">
        <h3 className="text-lg font-semibold text-cosmic-foreground mb-4">Mood Trend (Last 14 Days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis domain={[1, 10]} stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="url(#moodGradient)"
                strokeWidth={3}
                dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#fbbf24" }}
              />
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Mood Distribution */}
      <Card className="p-6 bg-cosmic-card/80 backdrop-blur-sm border-cosmic-border">
        <h3 className="text-lg font-semibold text-cosmic-foreground mb-4">Mood Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moodDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    borderRadius: "8px",
                    color: "#f1f5f9",
                  }}
                />
                <Bar dataKey="value" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {moodDistribution.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 bg-cosmic-input rounded-lg border border-cosmic-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-cosmic-foreground font-medium">{item.name}</span>
                </div>
                <Badge className="bg-cosmic-accent/20 text-cosmic-accent border-cosmic-accent/30">
                  {item.value} entries
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

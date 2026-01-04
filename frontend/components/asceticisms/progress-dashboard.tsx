"use client";

import { useEffect, useState } from "react";
import {
  getUserProgress,
  AsceticismProgress,
} from "@/lib/services/asceticismService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Calendar,
  TrendingUp,
  Flame,
  Target,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

const TEST_USER_ID = 1;

type TimePeriod = "7d" | "30d" | "90d" | "1y" | "all";

interface TimePeriodOption {
  value: TimePeriod;
  label: string;
  days: number | null;
}

const TIME_PERIODS: TimePeriodOption[] = [
  { value: "7d", label: "Last 7 Days", days: 7 },
  { value: "30d", label: "Last 30 Days", days: 30 },
  { value: "90d", label: "Last 90 Days", days: 90 },
  { value: "1y", label: "Last Year", days: 365 },
  { value: "all", label: "All Time", days: null },
];

export default function ProgressDashboard() {
  const [progressData, setProgressData] = useState<AsceticismProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("30d");

  useEffect(() => {
    fetchProgress();
  }, [timePeriod]);

  async function fetchProgress() {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange(timePeriod);
      const data = await getUserProgress(TEST_USER_ID, startDate, endDate);
      setProgressData(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load progress data");
    } finally {
      setLoading(false);
    }
  }

  function getDateRange(period: TimePeriod): {
    startDate: string;
    endDate: string;
  } {
    const end = new Date();
    const start = new Date();

    const periodConfig = TIME_PERIODS.find((p) => p.value === period);
    if (periodConfig?.days) {
      start.setDate(end.getDate() - periodConfig.days);
    } else {
      // "all" - set to a very early date
      start.setFullYear(2020, 0, 1);
    }

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }

  function renderHeatmap(logs: AsceticismProgress["logs"]) {
    const { startDate, endDate } = getDateRange(timePeriod);
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Create a map of dates to completion status
    const logMap = new Map(
      logs.map((log) => [new Date(log.date).toDateString(), log.completed])
    );

    // Generate array of all days in range
    const days = [];
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateStr = date.toDateString();
      const completed = logMap.get(dateStr) || false;
      days.push({ date, completed });
    }

    // Only show heatmap if there are a reasonable number of days
    if (totalDays > 90) {
      return (
        <div className="text-sm text-muted-foreground">
          Heatmap view available for periods up to 90 days
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-1">
        {days.map((day, idx) => (
          <div
            key={idx}
            className={`w-3 h-3 rounded-sm transition-all ${
              day.completed
                ? "bg-green-500 hover:bg-green-600"
                : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
            title={`${day.date.toLocaleDateString()}: ${
              day.completed ? "Completed" : "Not completed"
            }`}
          />
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (progressData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg text-muted-foreground">
        <BarChart3 size={48} className="mb-4 text-orange-200" />
        <p className="text-lg font-medium">No progress data yet</p>
        <p className="text-sm">
          Start logging your daily practices to see your progress here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header with time period selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your Progress</h2>
          <p className="text-muted-foreground">
            Track your consistency and growth
          </p>
        </div>
        <Select
          value={timePeriod}
          onValueChange={(v) => setTimePeriod(v as TimePeriod)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_PERIODS.map((period) => (
              <SelectItem key={period.value} value={period.value}>
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Progress cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {progressData.map((progress) => (
          <Card
            key={progress.userAsceticismId}
            className="overflow-hidden border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-all"
          >
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 border-amber-200"
                >
                  {progress.asceticism.category}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar size={14} />
                  <span>
                    Since {new Date(progress.startDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <CardTitle className="text-xl">
                {progress.asceticism.title}
              </CardTitle>
              <CardDescription>
                {progress.stats.completedDays} of {progress.stats.totalDays}{" "}
                days completed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                  <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                      {progress.stats.completionRate}%
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-500">
                      Completion
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950">
                  <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900">
                    <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                      {progress.stats.currentStreak}
                    </div>
                    <div className="text-xs text-orange-600 dark:text-orange-500">
                      Current Streak
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                      {progress.stats.longestStreak}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-500">
                      Best Streak
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                  <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                    <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                      {progress.stats.completedDays}
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-500">
                      Days Done
                    </div>
                  </div>
                </div>
              </div>

              {/* Heatmap */}
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Calendar size={16} />
                  Activity Heatmap
                </h4>
                {renderHeatmap(progress.logs)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

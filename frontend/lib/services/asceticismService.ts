import { client } from "@/lib/apiClient";
import type { TrackingType, AsceticismStatus } from "@/types/enums";
import type { components } from "@/types/api";

// Export API response types from OpenAPI schema
export type Asceticism = components["schemas"]["AsceticismResponse"];
export type AsceticismCreate = components["schemas"]["AsceticismCreate"];
export type LogEntry = components["schemas"]["LogCreate"];
export type LogResponse = components["schemas"]["LogResponse"];

// Keep custom interface types for compatibility with existing code
export interface UserAsceticism {
  id: number;
  userId: number;
  asceticismId: number;
  asceticism?: Asceticism;
  status: string;
  startDate: string;
  endDate?: string;
  targetValue?: number;
  logs?: Array<{
    id: number;
    date: string;
    completed: boolean;
    value?: number;
    notes?: string;
  }>;
}

export interface ProgressLog {
  date: string; // ISO
  completed: boolean;
  value?: number;
  notes?: string;
}

export interface ProgressStats {
  totalDays: number;
  completedDays: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
}

export interface AsceticismProgress {
  userAsceticismId: number;
  asceticism: Asceticism;
  startDate: string;
  stats: ProgressStats;
  logs: ProgressLog[];
}

export async function getAsceticisms(category?: string): Promise<Asceticism[]> {
  const { data, error } = await client.GET("/asceticisms/", {
    params: category ? { query: { category } } : undefined,
  });

  if (error) {
    throw new Error("Failed to fetch asceticisms");
  }

  return data || [];
}

export async function getActiveAsceticismIds(
  userId: number,
): Promise<Set<number>> {
  const userAsceticisms = await getUserAsceticisms(
    userId,
    undefined,
    undefined,
    false,
  ); // Only get active asceticisms
  const ids = new Set<number>();
  userAsceticisms.forEach((ua) => {
    if (ua.asceticismId) {
      ids.add(ua.asceticismId);
    }
  });
  return ids;
}

export async function getUserAsceticisms(
  userId: number,
  startDate?: string,
  endDate?: string,
  includeArchived: boolean = true,
): Promise<UserAsceticism[]> {
  const { data, error } = await client.GET("/asceticisms/my", {
    params: {
      query: {
        userId,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        includeArchived,
      },
    },
  });

  if (error) {
    throw new Error("Failed to fetch user asceticisms");
  }

  return (data as any) || [];
}

export async function getUserProgress(
  userId: number,
  startDate: string,
  endDate: string,
): Promise<AsceticismProgress[]> {
  const { data, error } = await client.GET("/asceticisms/progress", {
    params: {
      query: {
        userId,
        startDate,
        endDate,
      },
    },
  });

  if (error) {
    throw new Error("Failed to fetch progress data");
  }

  return (data as any) || [];
}

export async function createAsceticism(
  asceticismData: AsceticismCreate,
): Promise<Asceticism> {
  const { data, error } = await client.POST("/asceticisms/", {
    body: asceticismData,
  });

  if (error) {
    const errorMessage = error.detail || "Failed to create asceticism";
    throw new Error(errorMessage);
  }

  return data!;
}

export async function joinAsceticism(
  userId: number,
  asceticismId: number,
  targetValue?: number,
  startDate?: string,
  endDate?: string,
): Promise<UserAsceticism> {
  const { data, error } = await client.POST("/asceticisms/join", {
    body: {
      userId,
      asceticismId,
      targetValue: targetValue || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      custom_metadata: undefined,
    },
  });

  if (error) {
    const errorMessage = error.detail || "Failed to join asceticism";
    throw new Error(errorMessage);
  }

  return data as any;
}

export async function logProgress(entry: LogEntry): Promise<LogResponse> {
  const { data, error } = await client.POST("/asceticisms/log", {
    body: entry,
  });

  if (error) {
    const errorMessage = error.detail || "Failed to log progress";
    throw new Error(errorMessage);
  }

  return data!;
}

export async function updateAsceticism(
  id: number,
  asceticismData: AsceticismCreate,
): Promise<Asceticism> {
  const { data, error } = await client.PUT("/asceticisms/{asceticism_id}", {
    params: {
      path: {
        asceticism_id: id,
      },
    },
    body: asceticismData,
  });

  if (error) {
    throw new Error("Failed to update asceticism");
  }

  return data!;
}

export async function deleteAsceticism(id: number): Promise<void> {
  const { error } = await client.DELETE("/asceticisms/{asceticism_id}", {
    params: {
      path: {
        asceticism_id: id,
      },
    },
  });

  if (error) {
    throw new Error(error.detail || "Failed to delete asceticism");
  }
}

export async function leaveAsceticism(userAsceticismId: number): Promise<void> {
  const { error } = await client.DELETE(
    "/asceticisms/leave/{user_asceticism_id}",
    {
      params: {
        path: {
          user_asceticism_id: userAsceticismId,
        },
      },
    },
  );

  if (error) {
    console.error("Leave asceticism error:", error);
    throw new Error(
      `Failed to leave asceticism: ${error.detail || "Unknown error"}`,
    );
  }
}

export async function updateUserAsceticism(
  userAsceticismId: number,
  updateData: {
    startDate?: string;
    endDate?: string;
    targetValue?: number;
    status?: AsceticismStatus;
  },
): Promise<UserAsceticism> {
  const { data, error } = await client.PATCH(
    "/asceticisms/my/{user_asceticism_id}",
    {
      params: {
        path: {
          user_asceticism_id: userAsceticismId,
        },
      },
      body: updateData,
    },
  );

  if (error) {
    throw new Error("Failed to update user asceticism");
  }

  return data as any;
}

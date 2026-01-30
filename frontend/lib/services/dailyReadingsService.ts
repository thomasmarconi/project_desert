import { client } from "@/lib/apiClient";
import type { components } from "@/types/api";

// Export API response types from OpenAPI schema
export type DailyReadingNote =
  components["schemas"]["DailyReadingNoteResponse"];

// Types for Mass readings
export interface ReadingText {
  text: string;
  source?: string;
  heading?: string;
}

export interface MassReading {
  Mass_G?: ReadingText; // Gospel
  Mass_R1?: ReadingText; // First Reading
  Mass_R2?: ReadingText; // Second Reading
  Mass_Ps?: ReadingText; // Responsorial Psalm
  Mass_GA?: ReadingText; // Gospel Acclamation
  copyright?: ReadingText; // Copyright/Attribution
  day?: string;
  date?: string;
  number?: number;
  [key: string]: any;
}

/**
 * Fetch Mass readings from our backend API for a specific date
 * @param date - Date in YYYYMMDD format
 * @returns MassReading object
 */
export async function getMassReadings(date: string): Promise<MassReading> {
  const { data, error } = await client.GET("/daily-readings/readings/{date}", {
    params: {
      path: {
        date,
      },
    },
  });

  if (error) {
    console.error("Error fetching Mass readings:", error);
    throw new Error("Failed to fetch Mass readings");
  }

  return data as any;
}

/**
 * Format a Date object to YYYYMMDD string for Universalis API
 */
export function formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

/**
 * Format a Date object to ISO date string (YYYY-MM-DD)
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Clean HTML tags from reading text
 */
export function cleanHTML(html: string): string {
  if (typeof window === "undefined") {
    // Server-side: simple regex cleanup
    return html.replace(/<[^>]*>/g, "");
  }
  // Client-side: use DOM parser
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

// --- API calls for notes ---

/**
 * Create or update a daily reading note
 */
export async function saveReadingNote(
  userId: number,
  date: string,
  notes: string,
): Promise<DailyReadingNote> {
  const { data, error } = await client.POST("/daily-readings/notes", {
    body: {
      userId,
      date,
      notes,
    },
  });

  if (error) {
    throw new Error(error.detail || "Failed to save note");
  }

  return data!;
}

/**
 * Get a daily reading note for a specific date
 */
export async function getReadingNote(
  userId: number,
  date: string,
): Promise<DailyReadingNote | null> {
  const { data, error, response } = await client.GET(
    "/daily-readings/notes/{user_id}/{date}",
    {
      params: {
        path: {
          user_id: userId,
          date,
        },
      },
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (error) {
    throw new Error(error.detail || "Failed to fetch note");
  }

  return data!;
}

/**
 * Get all daily reading notes for a user
 */
export async function getAllUserNotes(
  userId: number,
  limit: number = 30,
): Promise<DailyReadingNote[]> {
  const { data, error } = await client.GET("/daily-readings/notes/{user_id}", {
    params: {
      path: {
        user_id: userId,
      },
      query: {
        limit,
      },
    },
  });

  if (error) {
    throw new Error(error.detail || "Failed to fetch notes");
  }

  return data || [];
}

/**
 * Delete a daily reading note
 */
export async function deleteReadingNote(noteId: number): Promise<void> {
  const { error } = await client.DELETE("/daily-readings/notes/{note_id}", {
    params: {
      path: {
        note_id: noteId,
      },
    },
  });

  if (error) {
    throw new Error(error.detail || "Failed to delete note");
  }
}

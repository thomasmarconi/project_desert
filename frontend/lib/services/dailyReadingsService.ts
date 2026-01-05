const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Types
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

export interface DailyReadingNote {
  id: number;
  userId: number;
  date: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Fetch Mass readings from our backend API for a specific date
 * @param date - Date in YYYYMMDD format
 * @returns MassReading object
 */
export async function getMassReadings(date: string): Promise<MassReading> {
  const url = `${API_BASE_URL}/daily-readings/readings/${date}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching Mass readings:", error);
    throw new Error("Failed to fetch Mass readings");
  }
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
  notes: string
): Promise<DailyReadingNote> {
  const res = await fetch(`${API_BASE_URL}/daily-readings/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, date, notes }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to save note");
  }

  return res.json();
}

/**
 * Get a daily reading note for a specific date
 */
export async function getReadingNote(
  userId: number,
  date: string
): Promise<DailyReadingNote | null> {
  const res = await fetch(
    `${API_BASE_URL}/daily-readings/notes/${userId}/${date}`
  );

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to fetch note");
  }

  return res.json();
}

/**
 * Get all daily reading notes for a user
 */
export async function getAllUserNotes(
  userId: number,
  limit: number = 30
): Promise<DailyReadingNote[]> {
  const res = await fetch(
    `${API_BASE_URL}/daily-readings/notes/${userId}?limit=${limit}`
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to fetch notes");
  }

  return res.json();
}

/**
 * Delete a daily reading note
 */
export async function deleteReadingNote(noteId: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/daily-readings/notes/${noteId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to delete note");
  }
}

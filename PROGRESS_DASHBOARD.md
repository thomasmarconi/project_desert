# Asceticism Progress Dashboard

## Overview

Added a comprehensive progress tracking dashboard to the asceticisms page that allows users to view their progress and consistency across different time periods.

## Features

### 1. Progress Dashboard Component (`progress-dashboard.tsx`)

- **Time Period Selection**: Users can view their progress over different time ranges:

  - Last 7 Days
  - Last 30 Days
  - Last 90 Days
  - Last Year
  - All Time

- **Statistics Cards**: For each asceticism, displays:

  - **Completion Rate**: Percentage of days completed
  - **Current Streak**: Consecutive days of completion
  - **Best Streak**: Longest streak in the selected period
  - **Days Done**: Total completed days

- **Activity Heatmap**: Visual representation of daily completion (available for periods up to 90 days)
  - Green squares indicate completed days
  - Gray squares indicate missed days
  - Hover to see specific dates

### 2. Backend API Endpoint

**Endpoint**: `GET /asceticisms/progress`

**Query Parameters**:

- `userId`: User ID
- `startDate`: ISO date string for range start
- `endDate`: ISO date string for range end

**Response**: Array of progress data including:

- Asceticism details
- Statistics (completion rate, streaks, etc.)
- Daily logs within the date range

### 3. Frontend Service

Added `getUserProgress()` function to `asceticismService.ts` to fetch progress data from the API.

## Design Features

- **Premium Aesthetics**:

  - Gradient backgrounds on stat cards
  - Color-coded categories (green for completion, orange for streaks, etc.)
  - Smooth animations and transitions
  - Responsive grid layout

- **User Experience**:
  - Loading skeletons for better perceived performance
  - Empty states with helpful messaging
  - Tooltips on heatmap for detailed information
  - Responsive design for mobile and desktop

## Usage

1. Navigate to `/asceticisms`
2. Click on the "Progress" tab
3. Select a time period from the dropdown
4. View your statistics and activity heatmap for each asceticism

## Technical Details

- Uses Shadcn UI components (Card, Select, Badge, Skeleton)
- Lucide React icons for visual elements
- TypeScript for type safety
- Responsive grid layout with Tailwind CSS
- Real-time data fetching with error handling

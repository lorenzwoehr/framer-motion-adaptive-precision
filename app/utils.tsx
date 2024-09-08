// Shared helper to format hours in 12-hour format with PM
export const formatTime = (hours: number, minutes: number = 0) => {
  const displayHours = hours > 12 ? hours - 12 : hours; // Convert to 12-hour format
  const formattedMinutes =
    minutes === 0 ? "" : `:${minutes.toString().padStart(2, "0")}`; // Drop ":00" on full hours
  return `${displayHours}${formattedMinutes} PM`; // Always PM
};

// Simplified function to format time from index position
export const getTimeFromIndex = (index: number) => {
  const baseHour = 13; // 1 PM in 24-hour format
  const hours = baseHour + Math.floor(index / 4); // Calculate the hour based on index
  const minutes = (index % 4) * 15; // Calculate the minutes based on index
  return formatTime(hours, minutes); // Use shared formatTime helper
};

// Simplified function to format hour labels from timeslots array
export const getLabelFromTimeSlots = (index: number) => {
  const baseHour = 13; // 1 PM in 24-hour format
  const hours = baseHour + index; // Get the hour based on the index
  return formatTime(hours, 0); // Use shared formatTime helper with 0 minutes for labels
};

// Helper to get time range from start and end index
export const getTimeRangeFromIndexes = (startIdx: number, endIdx: number) => {
  const startTime = getTimeFromIndex(startIdx);
  const endTime = getTimeFromIndex(endIdx);
  return `${startTime} - ${endTime}`;
};

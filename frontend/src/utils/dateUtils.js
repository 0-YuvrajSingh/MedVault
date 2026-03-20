/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatDistanceToNow = (date) => {
  if (!date) return "";

  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return past.toLocaleDateString();
};

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format time
 */
export const formatTime = (time) => {
  if (!time) return "";
  return time;
};

/**
 * Format datetime
 */
export const formatDateTime = (datetime) => {
  if (!datetime) return "";
  return new Date(datetime).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Check if date is today
 */
export const isToday = (date) => {
  const today = new Date();
  const check = new Date(date);
  return (
    check.getDate() === today.getDate() &&
    check.getMonth() === today.getMonth() &&
    check.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if date is in the past
 */
export const isPast = (date) => {
  return new Date(date) < new Date();
};

/**
 * Check if date is in the future
 */
export const isFuture = (date) => {
  return new Date(date) > new Date();
};

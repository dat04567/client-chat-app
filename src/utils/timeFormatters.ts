/**
 * Format countdown time to display in MM:SS format
 */
export const formatCountdownTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Format date for message timestamps with different levels of detail
 * @param date Date object or string to format
 * @param format Format type ('full' for separators, 'time' for message timestamps)
 * @returns Formatted date string
 */
export function formatMessageTime(date: Date | string, format: 'full' | 'time' = 'full'): string {
  const messageDate = date instanceof Date ? date : new Date(date);
  const now = new Date();
  
  // For messages individual timestamps, just show the time
  if (format === 'time') {
    return messageDate.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
  
  // For separator timestamps, format appropriately based on how recent
  const isToday = messageDate.toDateString() === now.toDateString();
  
  if (isToday) {
    return `Hôm nay, ${messageDate.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })}`;
  }
  
  // Check if yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (messageDate.toDateString() === yesterday.toDateString()) {
    return `Hôm qua, ${messageDate.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })}`;
  }
  
  // Check if within the last week
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);
  if (messageDate >= oneWeekAgo) {
    return `${messageDate.toLocaleDateString('vi-VN', { weekday: 'long' })}, ${
      messageDate.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }`;
  }
  
  // Older than a week, show full date
  return messageDate.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

/**
 * Format date for chat listings
 * @param date Date object or string to format
 * @returns Formatted date string
 */
export function formatChatTime(date: Date | string): string {
  const chatDate = date instanceof Date ? date : new Date(date);
  const now = new Date();
  
  // Today, just show time
  const isToday = chatDate.toDateString() === now.toDateString();
  if (isToday) {
    return chatDate.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
  
  // This week, show day name
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);
  if (chatDate >= oneWeekAgo) {
    return chatDate.toLocaleDateString('vi-VN', { weekday: 'long' });
  }
  
  // Older, show date
  return chatDate.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}
/**
 * Format timestamp thành định dạng dễ đọc
 * - Hiển thị giờ:phút nếu là ngày hiện tại
 * - Hiển thị "Yesterday" nếu là ngày hôm qua
 * - Hiển thị ngày/tháng nếu là ngày khác
 */
export function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  
  // Check if the date is today
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }
  
  // Check if the date is yesterday
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return 'Yesterday';
  }
  
  // If it's earlier than yesterday, return the date
  return date.toLocaleDateString('vi-VN', { 
    day: '2-digit',
    month: '2-digit'
  });
}
import moment from 'moment'

/**
 * Format a date to relative time (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(date: string | Date): string {
  try {
    return moment(date).fromNow()
  } catch (error) {
    return 'Unknown time'
  }
}

/**
 * Format a date to a readable string (e.g., "Jan 15, 2024")
 */
export function formatDate(date: string | Date): string {
  try {
    return moment(date).format('MMM DD, YYYY')
  } catch (error) {
    return 'Invalid date'
  }
}

/**
 * Format a date to date and time (e.g., "Jan 15, 2024 at 3:45 PM")
 */
export function formatDateTime(date: string | Date): string {
  try {
    return moment(date).format('MMM DD, YYYY [at] h:mm A')
  } catch (error) {
    return 'Invalid date'
  }
}

/**
 * Format a date for grouping (e.g., "Today", "Yesterday", "Jan 15, 2024")
 */
export function formatDateGroup(date: string | Date): string {
  try {
    const momentDate = moment(date)
    const now = moment()
    
    if (momentDate.isSame(now, 'day')) {
      return 'Today'
    } else if (momentDate.isSame(now.clone().subtract(1, 'day'), 'day')) {
      return 'Yesterday'
    } else if (momentDate.isSame(now, 'week')) {
      return momentDate.format('dddd') // Day of week (Monday, Tuesday, etc.)
    } else if (momentDate.isSame(now, 'year')) {
      return momentDate.format('MMM DD') // Month and day (Jan 15)
    } else {
      return momentDate.format('MMM DD, YYYY') // Full date (Jan 15, 2023)
    }
  } catch (error) {
    return 'Invalid date'
  }
}

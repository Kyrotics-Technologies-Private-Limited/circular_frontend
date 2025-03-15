// src/utils/formatters.ts

/**
 * Format date to a readable string
 * @param date Date object or string
 * @param includeTime Whether to include time in the formatted string
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string | number, includeTime: boolean = false): string => {
    if (!date) return 'N/A';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {})
    };
    
    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
  };
  
  /**
   * Format user name for display
   * @param displayName User's display name
   * @param email User's email
   * @returns Formatted user name string
   */
  export const formatUserName = (displayName?: string, email?: string): string => {
    if (displayName) return displayName;
    if (email) return email.split('@')[0];
    return 'User';
  };
  
  /**
   * Format number with commas as thousands separators
   * @param num Number to format
   * @returns Formatted number string
   */
  export const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  /**
   * Format percentage value
   * @param value Number to format as percentage
   * @param decimals Number of decimal places
   * @returns Formatted percentage string
   */
  export const formatPercentage = (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
  };
  
  /**
   * Truncate text to a specific length with ellipsis
   * @param text Text to truncate
   * @param maxLength Maximum length before truncation
   * @returns Truncated text string
   */
  export const truncateText = (text: string, maxLength: number = 50): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength) + '...';
  };
  
  /**
   * Format file path for display
   * @param path File path string
   * @returns Formatted path for display
   */
  export const formatFilePath = (path: string): string => {
    if (!path) return '';
    
    // Remove any leading slashes or 'organizations/'
    let formattedPath = path.replace(/^\/?(organizations\/[^\/]+\/)?/, '');
    
    // Replace slashes with a more readable separator
    formattedPath = formattedPath.replace(/\//g, ' › ');
    
    return formattedPath;
  };
  
  /**
   * Format time elapsed since a given date
   * @param date Date object or string
   * @returns Human-readable time elapsed string
   */
  export const formatTimeElapsed = (date: Date | string | number): string => {
    if (!date) return 'N/A';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    
    const now = new Date();
    const seconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      
      if (interval >= 1) {
        return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
      }
    }
    
    return 'Just now';
  };
  
  /**
   * Format a language code to its full name
   * @param code Language code (e.g., 'en', 'es', 'fr')
   * @returns Full language name
   */
  export const formatLanguageName = (code: string): string => {
    const languageNames: { [key: string]: string } = {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese',
      ru: 'Russian',
      zh: 'Chinese',
      ja: 'Japanese',
      ko: 'Korean',
      ar: 'Arabic',
      hi: 'Hindi',
      tr: 'Turkish',
      pl: 'Polish',
      nl: 'Dutch'
      // Add more as needed
    };
    
    return languageNames[code] || code;
  };
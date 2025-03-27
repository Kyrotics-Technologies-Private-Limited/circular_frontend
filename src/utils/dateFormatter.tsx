import React from 'react';
import { format, parseISO, parse, isValid } from 'date-fns';

// Updated interface to match the Firestore timestamp structure from your frontend
interface TimestampLike {
  seconds?: number;
  nanoseconds?: number;
  _seconds?: number;  // Added for frontend Firestore format
  _nanoseconds?: number;  // Added for frontend Firestore format
  toDate?: () => Date;
}

// Define the component props
interface DateFormatterProps {
  date: string | Date | TimestampLike | null | undefined;
  formatString?: string;
  fallback?: string;
  className?: string;
  relative?: boolean;
}

/**
 * A reusable component for formatting dates
 */
const DateFormatter: React.FC<DateFormatterProps> = ({ 
  date, 
  formatString = 'PPP', 
  fallback = 'N/A',
  className = '',
  relative = false
}) => {
  // Handle empty dates
  if (date === null || date === undefined) return <span className={className}>{fallback}</span>;

  // Function to parse and format the date
  const formatDate = (): string => {
    try {
      // Case 1: If it's a Firestore timestamp (handling both backend and frontend formats)
      if (typeof date === 'object' && (
          // Backend format without underscores
          (('seconds' in date && typeof date.seconds === 'number') || 
           ('toDate' in date && typeof date.toDate === 'function')) ||
          // Frontend format with underscores
          ('_seconds' in date && typeof date._seconds === 'number')
      )) {
        let jsDate: Date;
        
        // Handle toDate method if available
        if ('toDate' in date && typeof date.toDate === 'function') {
          jsDate = date.toDate();
        } 
        // Handle _seconds (frontend format)
        else if ('_seconds' in date && typeof date._seconds === 'number') {
          jsDate = new Date(date._seconds * 1000);
        }
        // Handle seconds (backend format)
        else if ('seconds' in date && typeof date.seconds === 'number') {
          jsDate = new Date(date.seconds * 1000);
        }
        // Fallback
        else {
          throw new Error('Invalid timestamp format');
        }
        
        return format(jsDate, formatString);
      }
      
      // Case 2: If it's a Date object already
      if (date instanceof Date && isValid(date)) {
        return format(date, formatString);
      }
      
      // Case 3: If it's an ISO string
      if (typeof date === 'string') {
        // Try to parse as ISO first (most common format)
        try {
          const parsedDate = parseISO(date);
          if (isValid(parsedDate)) {
            return format(parsedDate, formatString);
          }
        } catch (e) {
          // ISO parsing failed, continue to other formats
        }
        
        // Try to parse common date string formats
        try {
          // Try the format in your database: "27 March 2025 at 18:30:44 UTC+5:30"
          const parsedDate = parse(
            date,
            "d MMMM yyyy 'at' HH:mm:ss xx",
            new Date()
          );
          
          if (isValid(parsedDate)) {
            return format(parsedDate, formatString);
          }
        } catch (e) {
          // Specific format parsing failed
        }

        // Last resort: try JavaScript's built-in Date parsing
        const jsDate = new Date(date);
        if (isValid(jsDate)) {
          return format(jsDate, formatString);
        }
        
        // Nothing worked, return the original string
        return date;
      }
      
      // Fallback for any other case
      return fallback;
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return fallback;
    }
  };

  return (
    <span className={className}>
      {formatDate()}
    </span>
  );
};

export default DateFormatter;
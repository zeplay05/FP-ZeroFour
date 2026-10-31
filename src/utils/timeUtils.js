import { useState, useEffect } from 'react';

const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

const THAI_DAYS_SHORT = [
  'อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'
];

/**
 * Format a Date or timestamp to Thai date string: e.g. "31 ต.ค. 2569"
 */
export function formatThaiDateOnly(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  const day = d.getDate();
  const month = THAI_MONTHS_SHORT[d.getMonth()];
  const thaiYear = d.getFullYear() + 543;
  return `${day} ${month} ${thaiYear}`;
}

/**
 * Format a Date or timestamp to Thai time string: e.g. "14:30:15 น."
 */
export function formatThaiTimeOnly(date = new Date(), withSeconds = true) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  if (withSeconds) {
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds} น.`;
  }
  return `${hours}:${minutes} น.`;
}

/**
 * Format a Date or timestamp to full Thai date and time: e.g. "31 ต.ค. 2569 • 14:30:15 น."
 */
export function formatThaiDateTime(date = new Date(), withSeconds = true) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  const datePart = formatThaiDateOnly(d);
  const timePart = formatThaiTimeOnly(d, withSeconds);
  return `${datePart} • ${timePart}`;
}

/**
 * Smart formatter for booking timestamps in lottery cards.
 * If given a numeric timestamp (e.g. 1793115602835) or Date:
 * returns e.g. "31 ต.ค. 14:30 น."
 * If already a custom text like "25 ต.ค. 10:46" and can't be parsed, preserves it.
 */
export function formatBookingTime(timestampOrStr) {
  if (!timestampOrStr) return '';

  let d = null;
  if (typeof timestampOrStr === 'number') {
    d = new Date(timestampOrStr);
  } else if (typeof timestampOrStr === 'string') {
    // If it's a numeric string: "1793115602835"
    if (/^\d{10,14}$/.test(timestampOrStr.trim())) {
      d = new Date(Number(timestampOrStr.trim()));
    } else {
      const parsed = new Date(timestampOrStr);
      if (!isNaN(parsed.getTime())) {
        d = parsed;
      } else {
        // Fallback: return as-is
        return timestampOrStr;
      }
    }
  } else if (timestampOrStr instanceof Date) {
    d = timestampOrStr;
  }

  if (!d || isNaN(d.getTime())) {
    return String(timestampOrStr);
  }

  const now = new Date();
  const day = d.getDate();
  const month = THAI_MONTHS_SHORT[d.getMonth()];
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  // Check if today
  const isToday = d.getDate() === now.getDate() &&
                  d.getMonth() === now.getMonth() &&
                  d.getFullYear() === now.getFullYear();

  if (isToday) {
    return `วันนี้ ${hours}:${minutes} น.`;
  }

  // Check if yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.getDate() === yesterday.getDate() &&
                      d.getMonth() === yesterday.getMonth() &&
                      d.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `เมื่อวาน ${hours}:${minutes} น.`;
  }

  return `${day} ${month} ${hours}:${minutes} น.`;
}

/**
 * Format relative time (e.g. "เมื่อสักครู่", "5 นาทีที่แล้ว", "2 ชม. ที่แล้ว")
 */
export function formatRelativeTime(timestampOrStr) {
  if (!timestampOrStr) return '';
  let d = null;
  if (typeof timestampOrStr === 'number') {
    d = new Date(timestampOrStr);
  } else if (typeof timestampOrStr === 'string' && /^\d{10,14}$/.test(timestampOrStr.trim())) {
    d = new Date(Number(timestampOrStr.trim()));
  } else {
    d = new Date(timestampOrStr);
  }

  if (!d || isNaN(d.getTime())) return String(timestampOrStr);

  const diffMs = Date.now() - d.getTime();
  if (diffMs < 0) return 'เมื่อสักครู่';

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'เมื่อสักครู่';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} ชม. ที่แล้ว`;

  return formatBookingTime(d);
}

/**
 * React hook for a live clock that ticks every interval (default 1000ms).
 */
export function useRealtimeClock(intervalMs = 1000) {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);

  const thaiDay = THAI_DAYS_SHORT[currentTime.getDay()];
  const dateStr = formatThaiDateOnly(currentTime);
  const timeWithSec = formatThaiTimeOnly(currentTime, true);
  const timeWithoutSec = formatThaiTimeOnly(currentTime, false);
  const fullStr = `${thaiDay} ${dateStr} • ${timeWithSec}`;

  return {
    now: currentTime,
    thaiDay,
    dateStr,
    timeWithSec,
    timeWithoutSec,
    fullStr
  };
}

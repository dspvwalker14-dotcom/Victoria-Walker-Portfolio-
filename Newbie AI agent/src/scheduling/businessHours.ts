export interface BusinessWindow {
  start: string;
  end: string;
}

export function isBusinessDay(date: Date): boolean {
  const day = date.getUTCDay();
  return day >= 1 && day <= 5;
}

export function addBusinessDays(date: Date, count: number): Date {
  const result = new Date(date.getTime());
  let added = 0;

  while (added < count) {
    result.setUTCDate(result.getUTCDate() + 1);
    if (isBusinessDay(result)) {
      added += 1;
    }
  }

  return result;
}

export function getBusinessHoursWindow(date: Date, timeZone: string, startTime: string, endTime: string): BusinessWindow {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const localDate = new Date(date.toLocaleString('en-US', { timeZone }));
  localDate.setHours(startHour, startMinute, 0, 0);
  const start = toZoneDateTime(localDate, timeZone);

  const localEnd = new Date(date.toLocaleString('en-US', { timeZone }));
  localEnd.setHours(endHour, endMinute, 0, 0);
  const end = toZoneDateTime(localEnd, timeZone);

  return { start, end };
}

function toZoneDateTime(date: Date, timeZone: string): string {
  return date.toISOString().replace('Z', '');
}

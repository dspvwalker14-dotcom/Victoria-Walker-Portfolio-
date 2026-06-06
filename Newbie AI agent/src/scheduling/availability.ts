import { AvailabilityEvent } from '../microsoft/calendarService';

export interface Slot {
  start: string;
  end: string;
}

export function findAvailableSlot(
  events: AvailabilityEvent[],
  start: string,
  end: string,
  durationMinutes: number,
  timeZone: string
): Slot | null {
  const slots = buildSlots(start, end, durationMinutes);
  const conflicts = events.map((event) => ({
    start: new Date(event.start.dateTime),
    end: new Date(event.end.dateTime)
  }));

  for (const slot of slots) {
    const slotStart = new Date(slot.start);
    const slotEnd = new Date(slot.end);
    const conflict = conflicts.some((event) => timeRangesOverlap(slotStart, slotEnd, event.start, event.end));
    if (!conflict) {
      return slot;
    }
  }

  return null;
}

export function buildSlots(start: string, end: string, durationMinutes: number): Slot[] {
  const slots: Slot[] = [];
  let current = new Date(start);
  const finish = new Date(end);

  while (current.getTime() + durationMinutes * 60000 <= finish.getTime()) {
    const next = new Date(current.getTime() + durationMinutes * 60000);
    slots.push({ start: current.toISOString(), end: next.toISOString() });
    current = next;
  }

  return slots;
}

export function timeRangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

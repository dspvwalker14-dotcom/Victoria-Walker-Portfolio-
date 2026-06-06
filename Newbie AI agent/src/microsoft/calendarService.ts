import { graphGet, graphPost, getGraphAccessToken } from './graphClient';
import { config } from '../config';
import { NewHireInfo } from '../jira/jiraMapper';
import { findAvailableSlot } from '../scheduling/availability';
import { getBusinessHoursWindow, isBusinessDay, addBusinessDays } from '../scheduling/businessHours';

export interface CalendarEvent {
  id: string;
  subject: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
}

export interface AvailabilityEvent {
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
}

export async function findOnboardingSlot(newHire: NewHireInfo): Promise<{ start: string; end: string; timeZone: string }> {
  const accessToken = await getGraphAccessToken();
  const owner = config.itOwnerEmail;
  const preferredTimezone = newHire.timezone || config.defaultTimezone;
  const meetingDuration = config.meetingDurationMinutes;

  let dateCursor = new Date(newHire.startDate);
  const maxDays = 7;
  let attempts = 0;

  while (attempts < maxDays) {
    if (!isBusinessDay(dateCursor)) {
      dateCursor = addBusinessDays(dateCursor, 1);
      attempts += 1;
      continue;
    }

    const businessWindow = getBusinessHoursWindow(dateCursor, preferredTimezone, config.businessHoursStart, config.businessHoursEnd);
    const events = await getCalendarView(owner, businessWindow.start, businessWindow.end, preferredTimezone);
    const slot = findAvailableSlot(events, businessWindow.start, businessWindow.end, meetingDuration, preferredTimezone);

    if (slot) {
      return { start: slot.start, end: slot.end, timeZone: preferredTimezone };
    }

    dateCursor = addBusinessDays(dateCursor, 1);
    attempts += 1;
  }

  throw new Error('No available onboarding slot found within the next business days.');
}

export async function getCalendarView(ownerEmail: string, start: string, end: string, timeZone: string): Promise<AvailabilityEvent[]> {
  const accessToken = await getGraphAccessToken();
  const path = `/users/${encodeURIComponent(ownerEmail)}/calendarView`;
  const params = {
    startDateTime: start,
    endDateTime: end,
    $select: 'start,end'
  };

  const response = await graphGet(path, accessToken, params);
  return response.value || [];
}

export async function createOnboardingEvent(newHire: NewHireInfo, slot: { start: string; end: string; timeZone: string }) {
  const accessToken = await getGraphAccessToken();
  const owner = config.itOwnerEmail;
  const attendees = [
    {
      emailAddress: { address: newHire.newHireEmail, name: newHire.newHireName },
      type: 'required'
    },
    {
      emailAddress: { address: config.itOwnerEmail, name: config.itOwnerDisplayName },
      type: 'required'
    }
  ];

  if (newHire.managerEmail) {
    attendees.push({
      emailAddress: { address: newHire.managerEmail, name: newHire.managerName || newHire.managerEmail },
      type: 'optional'
    });
  }

  const eventBody = {
    subject: `IT Onboarding Session – ${newHire.newHireName}`,
    body: {
      contentType: 'HTML',
      content: `Welcome to the team! This IT onboarding session will help you get set up, review your IT access, answer questions, and make sure you have what you need for your first day.`
    },
    start: { dateTime: slot.start, timeZone: slot.timeZone },
    end: { dateTime: slot.end, timeZone: slot.timeZone },
    location: { displayName: newHire.location || 'Microsoft Teams meeting' },
    attendees,
    isOnlineMeeting: true,
    onlineMeetingProvider: 'teamsForBusiness',
    allowNewTimeProposals: false
  };

  return graphPost(`/users/${encodeURIComponent(owner)}/events`, accessToken, eventBody);
}

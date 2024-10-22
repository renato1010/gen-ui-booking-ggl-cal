'use server';

import { google } from 'googleapis';
import { DEFAULT_TIME_ZONE, GOOGLE_CAL_DEFAULT_ATTENDEE } from '@/utils/constants';
import { getListOfFreeSpots } from '@/utils/time-utils';
import { auth } from '@/utils/google-cal-auth';

async function getBusyIntervals(
  timeMin: string,
  timeMax: string
): Promise<Array<{ start: string; end: string }>> {
  const calendar = google.calendar({ version: 'v3', auth });
  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      timeZone: DEFAULT_TIME_ZONE,
      items: [{ id: 'primary' }]
    }
  });
  return (res.data.calendars?.['primary']['busy'] as Array<{ start: string; end: string }>) ?? [];
}

export async function createEvent(startTime: string, endTime: string) {
  const calendar = google.calendar({ version: 'v3', auth });
  try {
    const res = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: 'Test event',
        location: 'Guatemala',
        description: 'This is a test event',
        start: {
          dateTime: startTime
        },
        end: {
          dateTime: endTime
        },
        attendees: [{ email: GOOGLE_CAL_DEFAULT_ATTENDEE }]
      }
    });
    return res.data;
  } catch (error) {
    console.error(error);
    throw new Error(`Error creating event: ${error}`);
  }
}

export async function availableThirtyMinSpots(timeMin: string, timeMax: string) {
  const busyIntervals = await getBusyIntervals(timeMin, timeMax);
  const timeInterval = { start: timeMin, end: timeMax };
  const availableIntervals = getListOfFreeSpots(busyIntervals, timeInterval);
  return availableIntervals;
}

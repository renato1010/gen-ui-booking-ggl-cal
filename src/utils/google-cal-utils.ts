import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { getListOfFreeSpots } from '@/utils/time-utils';

export const auth = new JWT({
  email: keysJson.client_email,
  key: keysJson.private_key,
  scopes: ['https://www.googleapis.com/auth/calendar'],
  subject: 'contact@renatoperez.dev'
});

async function getBusyIntervals(): Promise<Array<{ start: string; end: string }>> {
  const calendar = google.calendar({ version: 'v3', auth });
  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      timeZone: 'America/Guatemala',
      items: [{ id: 'primary' }]
    }
  });
  return (res.data.calendars?.['primary']['busy'] as Array<{ start: string; end: string }>) ?? [];
}

export async function availableThirtyMinSpots() {
  const busyIntervals = await getBusyIntervals();
  const timeInterval = { start: timeMin, end: timeMax };
  const availableIntervals = getListOfFreeSpots(busyIntervals, timeInterval);
  console.dir({ availableIntervals }, { depth: Infinity });
}

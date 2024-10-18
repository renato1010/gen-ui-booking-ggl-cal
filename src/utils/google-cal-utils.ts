import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { Resource } from 'sst';
import { DEFAULT_TIME_ZONE } from '@/utils/constants';
import { getListOfFreeSpots } from '@/utils/time-utils';

const keysJson: { client_email: string; private_key: string } = JSON.parse(
  Resource.GoogleCalServiceAccJson.value
);
export const auth = new JWT({
  email: keysJson.client_email,
  key: keysJson.private_key,
  scopes: ['https://www.googleapis.com/auth/calendar'],
  subject: 'contact@renatoperez.dev'
});

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

export async function availableThirtyMinSpots(timeMin: string, timeMax: string) {
  const busyIntervals = await getBusyIntervals(timeMin, timeMax);
  const timeInterval = { start: timeMin, end: timeMax };
  const availableIntervals = getListOfFreeSpots(busyIntervals, timeInterval);
  console.dir({ availableIntervals }, { depth: Infinity });
  return availableIntervals;
}

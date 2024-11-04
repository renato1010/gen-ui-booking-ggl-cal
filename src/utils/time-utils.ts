import * as chrono from 'chrono-node';
import { differenceInMinutes, addHours, sub, isWithinInterval } from 'date-fns';
import {
  DEFAULT_TIME_INTERVAL_IN_HOURS,
  END_OF_DAY_HOUR,
  START_OF_DAY_HOUR,
  DEFAULT_TIME_SPOT_SPAN_IN_MINS
} from '@/utils/constants';

export type TimeInterval = { start: string; end: string };

type BusyIntervals = ReadonlyArray<TimeInterval>;

type FreeIntervals = { day: string; free: ReadonlyArray<TimeInterval> };

export function setIntervalHours(
  dateTimeString: string,
  hours: number = DEFAULT_TIME_INTERVAL_IN_HOURS
): string {
  const date = new Date(dateTimeString);
  return addHours(date, hours).toISOString();
}
export function isDateInUTC(date: Date): boolean {
  // Get the UTC and local time components of the date
  const utcYear = date.getUTCFullYear();
  const utcMonth = date.getUTCMonth();
  const utcDate = date.getUTCDate();
  const utcHours = date.getUTCHours();
  const utcMinutes = date.getUTCMinutes();
  const utcSeconds = date.getUTCSeconds();

  // Get the local time components
  const localYear = date.getFullYear();
  const localMonth = date.getMonth();
  const localDate = date.getDate();
  const localHours = date.getHours();
  const localMinutes = date.getMinutes();
  const localSeconds = date.getSeconds();

  // Compare if the local time components match the UTC components
  return (
    utcYear === localYear &&
    utcMonth === localMonth &&
    utcDate === localDate &&
    utcHours === localHours &&
    utcMinutes === localMinutes &&
    utcSeconds === localSeconds
  );
}
export const utcToLocaleTimeZone = (dateString: string): string => {
  const date = new Date(dateString);
  const offsetMinutes = date.getTimezoneOffset();
  const offsetHours = Math.abs(Math.floor(offsetMinutes / 60));
  const fragmentMins = offsetMinutes % 60;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  // Calculate the offset sign and format (e.g., -06:00)
  // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset#negative_values_and_positive_values
  const sign = offsetMinutes <= 0 ? '+' : '-';
  const formattedOffset = `${sign}${String(offsetHours).padStart(2, '0')}:${String(
    fragmentMins
  ).padStart(2, '0')}`;
  // Construct the final date string
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${formattedOffset}`;
};
function defaultEndOfDayStr(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    END_OF_DAY_HOUR,
    0,
    0,
    0
  ).toISOString();
}
function defaultStartOfDayStr(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    START_OF_DAY_HOUR,
    0,
    0,
    0
  ).toISOString();
}
export function getEndOfDay({ date }: { date: Date }) {
  // work with date as UTC
  const isUTC = isDateInUTC(date);
  if (!isUTC) {
    // work with utc date
    date = new Date(date.toISOString());
  }
  const defaultEndOfDayDate = new Date(defaultEndOfDayStr(date));
  const defaultStartOfDayDate = new Date(defaultStartOfDayStr(date));
  const isInInterval = isWithinInterval(date, {
    start: defaultStartOfDayDate,
    end: defaultEndOfDayDate
  });
  return isInInterval ? date.toISOString() : defaultEndOfDayDate.toISOString();
}

export function getStartOfDay({ date }: { date: Date }) {
  // work with date as UTC
  const isUTC = isDateInUTC(date);
  if (!isUTC) {
    // work with utc date
    date = new Date(date.toISOString());
  }
  const defaultStartOfDayDate = new Date(defaultStartOfDayStr(date));
  const defaultEndOfDayDate = new Date(defaultEndOfDayStr(date));
  // the latest time for a booking is the defaultEndOfDayDate minus the
  // default time spot span(30 min)
  const serviceEndOfDayDate = sub(defaultEndOfDayDate, { minutes: DEFAULT_TIME_SPOT_SPAN_IN_MINS });
  // interval of service is from defaultStartOfDayDate to serviceEndOfDayDate
  const isInInterval = isWithinInterval(date, {
    start: defaultStartOfDayDate,
    end: serviceEndOfDayDate
  });
  return isInInterval ? date.toISOString() : defaultStartOfDayDate.toISOString();
}

export function getLocalDateTimeString(dateTimeString: string, startOrEnd: 'start' | 'end') {
  return startOrEnd === 'start'
    ? utcToLocaleTimeZone(getStartOfDay({ date: new Date(dateTimeString) }))
    : utcToLocaleTimeZone(getEndOfDay({ date: new Date(dateTimeString) }));
}
// relative date(natural language)
export const naturalLangDateParser = (userInputRelativeDate: string) => {
  const parse = chrono.parse(userInputRelativeDate, new Date(), {
    forwardDate: true,
    timezones: { CST: -360 }
  });
  const { start, end } = parse[0];
  const parseDate = parse[0].date();
  const startDateTime = new Date(
    start.get('year') ?? parseDate.getUTCFullYear(),
    (start.get('month') ?? parseDate.getUTCMonth()) - 1,
    start.get('day') ?? parseDate.getUTCDate(),
    start.isCertain('hour') === true ? (start.get('hour') as number) : 6
  ).toISOString();

  let endDateString: string | null;
  if (!end) {
    endDateString = null;
  } else {
    endDateString = new Date(
      end.get('year') ?? parseDate.getUTCFullYear(),
      (end.get('month') ?? parseDate.getUTCMonth()) - 1,
      end.get('day') ?? parseDate.getUTCDate(),
      end?.isCertain('hour') === true ? (end.get('hour') as number) : 23
    ).toISOString();
  }
  const endDateTime = endDateString ? new Date(endDateString).toISOString() : null;

  return { startDateTime, endDateTime };
};

export const createLookupIntervalList = (
  timeInterval: TimeInterval,
  timeSpanInMinutes: number = 30
): Array<TimeInterval> => {
  const { start, end } = timeInterval;
  if (differenceInMinutes(new Date(end), new Date(start)) < timeSpanInMinutes) {
    return [];
  }
  let leftDate = start;
  const intervals: Array<TimeInterval> = [];
  while (differenceInMinutes(new Date(end), new Date(leftDate)) >= timeSpanInMinutes) {
    const newDate = new Date(leftDate);
    newDate.setMinutes(newDate.getMinutes() + timeSpanInMinutes);
    intervals.push({ start: new Date(leftDate).toISOString(), end: newDate.toISOString() });
    leftDate = newDate.toISOString();
  }

  return intervals;
};

const getThirtyMinIntervals = (interval: BusyIntervals) => {
  const resultIntervalList: TimeInterval[] = [];
  for (let i = 0; i < interval.length; i++) {
    const start = new Date(interval[i].start);
    const end = new Date(interval[i].end);
    if (differenceInMinutes(end, start) <= 30) {
      resultIntervalList.push({ start: start.toISOString(), end: end.toISOString() });
    } else {
      const thirtyMinIntervalList = createLookupIntervalList({
        start: interval[i].start,
        end: interval[i].end
      });
      resultIntervalList.push(...thirtyMinIntervalList);
    }
  }
  return resultIntervalList;
};

export function getListOfFreeSpots(
  busyIntervals: Readonly<BusyIntervals>,
  timeInterval: Readonly<TimeInterval>
): FreeIntervals {
  const lookupInterval = createLookupIntervalList(timeInterval);
  if (lookupInterval.length === 0) return { day: timeInterval.start, free: [] };
  const busyIntervalsThirtyMin = getThirtyMinIntervals(busyIntervals);
  console.log({ busyIntervalsThirtyMin, lookupInterval });
  if (busyIntervalsThirtyMin.length === 0) {
    return { day: timeInterval.start, free: lookupInterval };
  }
  const busySet = new Set(
    busyIntervalsThirtyMin.map((interval) => `${interval.start}-${interval.end}`)
  );

  const freeIntervals = lookupInterval.filter((int) => !busySet.has(`${int.start}-${int.end}`));

  return { day: timeInterval.start, free: freeIntervals };
}

export const formatHours = (hours: number): string => {
  if (hours > 23) {
    throw new Error('Invalid hours value');
  }
  return hours < 0 ? `-${String(hours).padStart(2, '0')}` : String(hours).padStart(2, '0');
};

export const testDateTime = (dayOfTheMonth?: number, hr?: number, mins?: number) => {
  const date = new Date();
  const fullYear = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = dayOfTheMonth || date.getDate();
  const hours = hr ?? date.getHours();
  const minutes = mins ?? date.getMinutes();
  const timezoneOffsetInMins = date.getTimezoneOffset();
  return `${fullYear}-${month}-${String(day).padStart(2, '0')}T${formatHours(hours)}:${String(
    minutes
  ).padStart(2, '0')}:00-${formatHours(Math.floor(timezoneOffsetInMins / 60))}:${String(
    timezoneOffsetInMins % 60
  ).padStart(2, '0')}`;
};

export const utcStringToLocalHrMin = (utcString: string) => {
  const date = new Date(utcString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${formatHours(hours)}:${String(minutes).padStart(2, '0')}`;
};



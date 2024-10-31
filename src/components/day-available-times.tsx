'use client';

import { useState, useTransition } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { utcStringToLocalHrMin, utcToLocaleTimeZone, type TimeInterval } from '@/utils/time-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import { createGoogleCalEvent } from '@/app/ai-sdk-rsc-demo/actions';
import { useToast } from '@/hooks/use-toast';

export type DayAvailableTimesProps = {
  day: string;
  availableTimes: ReadonlyArray<TimeInterval>;
};
export const DayAvailableTimes = ({ day, availableTimes }: DayAvailableTimesProps) => {
  const [intervalIndex, setIntervalIndex] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const onTimeSpotClick = (time: TimeInterval, index: number) => {
    // Implement your logic when a time slot is clicked
    setIntervalIndex(index);
    startTransition(async () => {
      const { email, error } = await createGoogleCalEvent(
        utcToLocaleTimeZone(time.start),
        utcToLocaleTimeZone(time.end)
      );
      if (error) {
        toast({
          title: 'Booking Error',
          description: `${error.toString()}`,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Booking Success',
          description: `Event created by (${email})`
        });
      }
    });
  };
  return (
    <Card className="w-fit">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="mr-2" />
          {new Intl.DateTimeFormat('en-US', {
            dateStyle: 'long'
          }).format(new Date(day))}
        </CardTitle>
        <CardDescription>Time slots available for booking</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-3">
        {availableTimes.map((time, index) => (
          <Button
            onClick={() => onTimeSpotClick(time, index)}
            className={clsx(
              'flex items-center bg-white active:bg-slate-200 hover:bg-blue-300 border',
              'border-blue-500 text-blue-900',
              `${intervalIndex === index ? 'bg-blue-500 border-blue-900 font-bold text-white' : ''}`
            )}
            key={index}
            disabled={isPending && intervalIndex === index}
          >
            {isPending && intervalIndex === index ? null : (
              <span className={clsx('rounded-md')}>
                {utcStringToLocalHrMin(time.start)} - {utcStringToLocalHrMin(time.end)}
              </span>
            )}
            {isPending && intervalIndex === index && (
              <Loader2 className="size-5 animate-spin z-10" strokeWidth={4} />
            )}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

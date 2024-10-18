import { Calendar } from 'lucide-react';
import { utcStringToLocalHrMin, type TimeInterval } from '@/utils/time-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type DayAvailableTimesProps = {
  day: string;
  availableTimes: ReadonlyArray<TimeInterval>;
};
export const DayAvailableTimes = ({ day, availableTimes }: DayAvailableTimesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="mr-2" />
          {new Intl.DateTimeFormat('en-US', {
            dateStyle: 'long'
          }).format(new Date(day))}
        </CardTitle>
        <CardDescription>Time slots available for bookings</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-3">
        {availableTimes.map((time, index) => (
          <Button className="bg-slate-200 hover:bg-slate-400" variant="outline" key={index}>
            {utcStringToLocalHrMin(time.start)} - {utcStringToLocalHrMin(time.end)}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

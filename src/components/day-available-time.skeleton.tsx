import { Card, CardContent, CardHeader } from './ui/card';
import { Skeleton } from './ui/skeleton';

export const AvailableTimesSkeleton = () => {
  return (
    <Card className="w-[350px] flex flex-col gap-4 border border-slate-400 bg-zinc-200">
      <CardHeader className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-full" />
        ))}
      </CardContent>
    </Card>
  );
};

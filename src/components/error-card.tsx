import { ChatRequestOptions } from 'ai';
import { XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from './ui/button';

type ErrorCardProps = {
  message?: string;
  reload?: (chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>;
};
export default function ErrorCard({
  message = 'An error occurred. Please try again.',
  reload
}: ErrorCardProps) {
  return (
    <Card className="w-full max-w-md border-red-200 bg-red-50">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-4">
          <XCircle className="h-6 w-6 text-red-500" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-800">Error</h3>
            <p className="text-sm text-destructive">{message}</p>
          </div>
        </div>
        {typeof reload !== 'undefined' ? (
          <Button onClick={() => reload()} className="mt-4">
            Try again
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-2">
          <h1 className="text-2xl font-bold text-center">
            Generative UI: Booking Google Calendar Demo
          </h1>
        </div>
      </header>
      <main className="h-screen grid place-content-center ">
        <Button asChild variant="link">
          <Link href="/ai-sdk-rsc-demo">AI SDK RSC Demo</Link>
        </Button>
        <Button asChild variant="link">
          <Link href="/ai-sdk-ui-demo">AI SDK UI Demo</Link>
        </Button>
        <Button asChild variant="link">
          <Link href="/ai-sdk-cot-prompt">AI SDK UI Demo(Prompt Eng)</Link>
        </Button>
      </main>
    </div>
  );
}

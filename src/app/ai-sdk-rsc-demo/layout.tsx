import type { Metadata } from 'next';
import { AI } from './actions';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'AI-SDK-RSC',
  description: 'Generative UI Google Calendar Demo'
};

export default function AISDKRSC({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AI>
      <Toaster />
      <div className="place-content-center h-screen">{children}</div>
    </AI>
  );
}

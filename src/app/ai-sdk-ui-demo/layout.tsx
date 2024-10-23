import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'AI-SDK-UI',
  description: 'Generative UI Google Calendar Demo'
};

export default function AISDKUI({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Toaster />
      <div className="place-content-center h-screen">{children}</div>
    </div>
  );
}

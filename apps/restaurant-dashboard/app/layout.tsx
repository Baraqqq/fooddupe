import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pizza Mario - Restaurant Dashboard',
  description: 'Restaurant management dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
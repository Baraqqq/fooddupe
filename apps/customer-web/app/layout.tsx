import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FoodDupe - Pizza Mario',
  description: 'Order delicious food online',
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
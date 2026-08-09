import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PackAI — AI-Assisted Container Packing Optimizer',
  description: 'AI-assisted 3D container packing optimizer determining optimal package arrangements to minimize containers and maximize space utilization.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#080c14] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}

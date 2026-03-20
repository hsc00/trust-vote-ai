import type { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google';
import './globals.css';

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TrustVote AI | Your Vote, Verified',
  description: 'Official vote verification portal. Check that your vote was safely recorded.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistMono.variable} antialiased bg-zinc-950 text-zinc-100`}>
        <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
            <span className="font-semibold tracking-tight text-zinc-100">
              Trust<span className="text-emerald-400">Vote</span>
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-6 py-12">{children}</main>

        <footer className="border-t border-zinc-800 py-8">
          <p className="text-center text-xs text-zinc-600">
            TrustVote · Official verification · © {new Date().getFullYear()}
          </p>
        </footer>
      </body>
    </html>
  );
}

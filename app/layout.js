import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next"
import KeepServerAlive from "./utils/KeepServerAlive";

// app/history/page.tsx or .jsx

export const metadata = {
  title: "Giveth Station",
  description: "View your favorite movies, TV shows, anime, and watch history on Giveth Station.",
  keywords: "Giveth Station, movies, TV shows, anime, favorites, watch history",
  authors: [{ name: "Giveth", url: "https://givethation.com" }],
  viewport: "width=device-width, initial-scale=1.0",
  icons: {
    icon: "favicon.ico",
    shortcut: "favicon.ico",
  },
};


export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.0/css/all.min.css" />
      </head>
      <body
        className="bg-stone-950 text-stone-100"
      >
        <KeepServerAlive>
        {children}
        <Analytics />
        </KeepServerAlive>
      </body>
    </html>
    </ClerkProvider>
  );
}

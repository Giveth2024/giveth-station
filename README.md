Here’s a **fully merged and corrected README.md** for **Giveth Station**, combining all previous sections, Clerk integration context, features, and Favorites/Watch History explanation:

````markdown
# Giveth Station

Giveth Station is a **Next.js-based streaming platform** where users can explore **movies, TV shows, and anime**. Users can **log in via Clerk**, save media to **favorites**, and track their **watch history**. The platform offers a clean UI with personalized features for signed-in users.

---

## Features

- Browse movies, TV shows, and anime.
- **Sign in / Sign up** with Google via Clerk SSO.
- **Favorites**: Save media for later viewing.
- **Watch history**: Track previously watched media.
- Responsive design with mobile-friendly navigation.
- **Player page** with multiple streaming sources (`vidsrc.xyz` and `vidsrc.cc`).
- View **Favorites** and **Watch History** side by side on the `History` page.
- Metadata such as title, year, genre, director, and ratings displayed on Player page.

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
````

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

You can start editing pages by modifying files in the `app/` directory. The page auto-updates as you edit them.

---

## Clerk Authentication

Giveth Station uses **Clerk** for authentication. Signed-out users are redirected to `/`.

**Setup Steps:**

1. Install Clerk:

```bash
npm install @clerk/nextjs
```

2. Add environment variables in `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_SECRET_KEY
```

3. Wrap your app in `app/layout.tsx`:

```tsx
import { ClerkProvider, SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <header>
            <SignedOut>
              <SignInButton /> <SignUpButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

4. Add `middleware.ts`:

```ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
```

---

## Navigation

* Desktop and mobile menus allow navigation between **Movies**, **TV Shows**, and **Anime**.
* Signed-in users see their **profile icon** on all devices.

---

## Player Page

* Loads media from session storage.
* Shows **poster, metadata, and embedded player**.
* Allows switching between streaming sources.
* Users can **favorite media** and it is stored in `localStorage`.
* **Watch history** is tracked automatically.

---

## History Page

* Displays **Favorites** and **Watch History** in **columns**:

```
Favorites        |     Watch History
```

* Click any item to resume watching.
* Both lists are saved in browser `localStorage`.

### Example `localStorage` structure

```json
{
  "favorites": [
    { "id": "tt1234567", "title": "Movie Title", "poster": "URL", "type": "movies" }
  ],
  "history": [
    { "id": "tt9876543", "title": "Anime Title", "poster": "URL", "type": "anime", "watchedAt": "2025-08-31T15:00:00Z" }
  ]
}
```

> Note: Clearing your browser cache will remove favorites and history stored locally.
> Users must be signed in via Clerk to access the History page.

---

## Metadata

```ts
export const metadata = {
  title: "Giveth Station",
  description: "A streaming platform for movies, TV shows, and anime with personalized favorites and watch history.",
};
```

---

## Learn More

* [Next.js Documentation](https://nextjs.org/docs) – learn about Next.js features and API.
* [Clerk Documentation](https://clerk.com/docs) – learn about authentication integration.
* [Learn Next.js](https://nextjs.org/learn) – interactive Next.js tutorial.
* [Next.js GitHub](https://github.com/vercel/next.js)

---

## Deploy on Vercel

The easiest way to deploy your app is via [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).
See [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



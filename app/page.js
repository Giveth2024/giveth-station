"use client";

import {
  SignInButton,
  SignUpButton,
  SignedOut,
  SignedIn,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Link from "next/link";

export default function LandingPage() {
  const { user } = useUser();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-center text-white px-6">
      {/* Hero Section */}
      <section className="max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
          Welcome to <span className="text-amber-400">Giveth<i className="fa-solid fa-bolt"></i>tation</span>
        </h1>
        <p className="text-lg md:text-xl text-stone-300 mb-8">
          A place where movies, TV shows, and anime come together to entertain
          you. Dive in and explore endless stories that await!
        </p>

        {/* If user is signed out → show login + signup buttons */}
        <SignedOut>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignInButton mode="modal">
              <button className="px-6 py-3 rounded-2xl bg-amber-400 text-stone-900 font-semibold shadow-md hover:bg-amber-500 transition">
                Login
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-6 py-3 rounded-2xl border border-stone-400 text-stone-200 font-semibold hover:bg-stone-700 transition">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </SignedOut>

        {/* If user is signed in → show welcome message + buttons */}
        <SignedIn>
          <div className="flex flex-col items-center gap-6 mt-12">
            <p className="text-2xl text-amber-400 font-semibold">
              Welcome back, {user?.firstName || "Guest"} 👋
            </p>

            <div className="flex gap-4">
              <Link
                title="Giveth Station"
                href="/home"
                className="px-5 py-2 rounded-xl bg-amber-400 text-stone-900 font-medium shadow hover:bg-amber-500 transition"
              >
                Let&apos;s Go Home
              </Link>
            </div>
          </div>
        </SignedIn>
      </section>

      {/* Footer */}
      <footer className="absolute bottom-4 text-stone-400 text-sm">
        © {new Date().getFullYear()} GivethSation. All rights reserved.
      </footer>
    </main>
  );
}

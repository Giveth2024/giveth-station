'use client';

import Link from "next/link";
import { useState } from "react";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  // Set state + force refresh
  const setSearchState = (state_value) => {
    sessionStorage.setItem("storedState", state_value);
    setIsOpen(false);
    window.location.href = "/search"; // ensures refresh + navigation
  };

  return (
    <nav className="p-4 bg-stone-900 flex flex-row justify-between items-center shadow-md relative">
      {/* Logo */}
      <Link
        title="Giveth Station"
        href="/home"
        className="text-2xl font-bold text-amber-400 flex items-center gap-1 hover:text-amber-500 transition"
      >
        Giveth<i className="fa-solid fa-bolt"></i>tation
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center space-x-6 text-stone-200 font-medium">
        {["movies", "tvshows", "anime"].map((cat) => (
          <button
            key={cat}
            title={`${cat}`}
            onClick={() => setSearchState(cat)}
            className="hover:text-amber-400 transition capitalize"
          >
            {cat.replace("tvshows", "TV Shows")}
          </button>
        ))}

        {/* User Section (Desktop) */}
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-3 py-1 rounded-lg bg-amber-400 text-stone-900 font-medium hover:bg-amber-500 transition">
              Login
            </button>
          </SignInButton>
        </SignedOut>
      </div>

      {/* Hamburger Icon (Mobile) */}
      <button
        className="md:hidden text-amber-400 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className={`fa-solid ${isOpen ? "fa-xmark" : "fa-bars"} text-2xl`}></i>
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="z-10 absolute top-full right-0 mt-2 w-48 bg-stone-900 border border-amber-500 rounded-lg shadow-lg flex flex-col">
          {["movies", "tvshows", "anime"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSearchState(cat)}
              className="px-4 py-2 text-stone-200 hover:bg-amber-400 hover:text-stone-950 transition text-left capitalize"
            >
              {cat.replace("tvshows", "TV Shows")}
            </button>
          ))}

          {/* User Section (Mobile) */}
          <div className="px-4 py-2 border-t border-stone-700 flex items-center justify-between">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-3 py-1 rounded-lg bg-amber-400 text-stone-900 font-medium hover:bg-amber-500 transition">
                  Login
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      )}
    </nav>
  );
}

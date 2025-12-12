'use client'
import Navigation from "../components/Navigation/page";
import Footer from "../components/Footer";
import MoviesAndSeries from "../components/MoviesAndSeries";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { useEffect } from "react";

export default function Home() {
  
  return (
    <>
      <SignedIn>
        {/* Navbar */}
        <Navigation />

        {/* Movies Section */}
        <MoviesAndSeries />
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn redirectUrl="/" />
      </SignedOut>

      <Footer />
    </>
  );
}

'use client'
import Navigation from "../components/Navigation/page";
import Footer from "../components/Footer";
import MoviesAndSeries from "../components/MoviesAndSeries";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { useEffect } from "react";
import { KeepServerAlive } from "../utils/KeepServerAlive";

export default function Home() {

  useEffect(()=>{
    KeepServerAlive(); // Keeps the server awake while using Giveth Station
  },[]);

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

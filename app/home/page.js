'use client'
import Navigation from "../components/Navigation/page";
import Card from "../components/Card";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const CACHE_KEY = "omdb_cache";
    const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

    async function searchOMDb(keyword, type = "movie", count = 10) {
      let results = [];
      let page = 1;

      while (results.length < count) {
        // ✅ Call your backend instead of OMDb directly
        const res = await fetch(`https://giveth-station-backend.onrender.com/api/search?s=${encodeURIComponent(keyword)}&type=${type}&page=${page}`);

        const data = await res.json();

        if (!data.Search) break; // stop if no results
        results.push(...data.Search);

        if (data.Search.length < 10) break; // stop if less than a page
        page++;
      }

      return results.slice(0, count); // only return requested count
    }

    async function fetchDetailsById(imdbID) {
      // ✅ Call backend API endpoint instead of exposing the API key
      const res = await fetch(`https://giveth-station-backend.onrender.com/api/details?id=${imdbID}`);
      const data = await res.json();
      return data;
    }


    async function fetchAndCache() {
      try {
        // Movies
        const mov = await searchOMDb("movie", "movie");
        const movDetails = await Promise.all(mov.map(m => fetchDetailsById(m.imdbID)));

        // TV Shows
        const tv = await searchOMDb("series", "series");
        const tvDetails = await Promise.all(tv.map(t => fetchDetailsById(t.imdbID)));

        // Anime
        const anim = await searchOMDb("anime", "series");
        const animDetails = await Promise.all(anim.map(a => fetchDetailsById(a.imdbID)));

        const cacheData = {
          timestamp: Date.now(),
          movies: movDetails,
          series: tvDetails,
          anime: animDetails,
        };

        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

        setMovies(movDetails);
        setSeries(tvDetails);
        setAnime(animDetails);
      } catch (err) {
        console.error(`Error fetching data: ${err}`);
      } finally {
        setLoading(false);
      }
    }

    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { timestamp, movies, series, anime } = JSON.parse(cached);
      setMovies(movies);
      setSeries(series);
      setAnime(anime);

      // Check if one week passed
      if (Date.now() - timestamp > ONE_WEEK) {
        fetchAndCache();
      } else {
        setLoading(false);
      }
    } else {
      fetchAndCache();
    }

  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-950 text-amber-400">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-amber-400 mb-4"></div>
        <p className="text-lg font-semibold">Loading content...</p>
      </div>
    );
  }

  return (
    <>
      <SignedIn>
        {/* Navbar */}
        <Navigation />

        {/* Movies Section */}
        <section className="border-l-4 border-amber-500 p-6 my-6">
          <h2 className="text-xl text-center md:text-2xl font-bold mb-8 text-amber-400">Movies</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {movies.filter((m) => m.imdbID)
            .map((m) => (
              <Card
                key={`movie-${m.imdbID}`}
                id={m.imdbID}
                title={m.Title}
                poster={m.Poster}
                year={m.Year}
                rating={m.imdbRating}
                genre={m.Genre}
                state={"movies"}
                data={m}
              />
            ))}
          </div>
        </section>

        {/* TV Section */}
        <section className="border-l-4 border-amber-500 p-6 my-6">
          <h2 className="text-xl text-center md:text-2xl font-bold mb-8 text-amber-400">TV Shows</h2>
          <div className="flex flex-wrap justify-center  gap-6">
            {series.filter((s) => s.imdbID)
            .map((s) => (
              <Card
                key={`series-${s.imdbID}`}
                id={s.imdbID}
                title={s.Title}
                poster={s.Poster}
                year={s.Year}
                rating={s.imdbRating}
                genre={s.Genre}
                state={"tvshows"}
                data={s}
              />
            ))}
          </div>
        </section>

        {/* Anime Section */}
        <section className="border-l-4 border-amber-500 p-6 my-6">
          <h2 className="text-xl text-center md:text-2xl font-bold mb-8 text-amber-400">Anime</h2>
          <div className="flex flex-wrap justify-center  gap-6">
            {anime.filter((a) => a.imdbID)
            .map((a) => (
              <Card
                key={`anime-${a.imdbID}`}
                id={a.imdbID}
                title={a.Title}
                poster={a.Poster}
                year={a.Year}
                rating={a.imdbRating}
                genre={a.Genre}
                state={"anime"}
                data={a}
              />
            ))}
          </div>
        </section>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn redirectUrl="/" />
      </SignedOut>

      <Footer />
    </>
  );
}

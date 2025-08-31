'use client';
import Navigation from "../components/Navigation/page";
import Card from "../components/Card";
import { useEffect, useState } from "react";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

export default function Home() {
  const apiKey = process.env.NEXT_PUBLIC_OMDB_API_KEY;
  const BASE_URL = 'https://www.omdbapi.com/';

  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function searchOMDb(keyword, type = "movie", count = 10) {
      let results = [];
      let page = 1;

      while (results.length < count) {
        const res = await fetch(`${BASE_URL}?apikey=${apiKey}&s=${encodeURIComponent(keyword)}&type=${type}&page=${page}`);
        const data = await res.json();
        if (!data.Search) break;
        results.push(...data.Search);
        if (data.Search.length < 10) break; 
        page++;
      }

      return results.slice(0, count);
    }

    async function fetchDetailsById(imdbID) {
      const res = await fetch(`${BASE_URL}?apikey=${apiKey}&i=${imdbID}&plot=short&r=json`);
      return await res.json();
    }

    (async () => {
      try {
        // Default searches
        const defaultMovies = await searchOMDb("Avengers", "movie");
        const defaultSeries = await searchOMDb("Friends", "series");
        const defaultAnime = await searchOMDb("Naruto", "series");

        // Fetch full details
        const movieDetails = await Promise.all(defaultMovies.map(m => fetchDetailsById(m.imdbID)));
        const seriesDetails = await Promise.all(defaultSeries.map(s => fetchDetailsById(s.imdbID)));
        const animeDetails = await Promise.all(defaultAnime.map(a => fetchDetailsById(a.imdbID)));

        setMovies(movieDetails.filter(m => m.imdbID));
        setSeries(seriesDetails.filter(s => s.imdbID));
        setAnime(animeDetails.filter(a => a.imdbID));
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [apiKey]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-950 text-amber-400">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-amber-400 border-solid mb-4"></div>
        <p className="text-lg font-semibold">Loading content...</p>
      </div>
    );
  }

  return (
    <>
      <SignedIn>
        <Navigation />

        {/* Movies */}
        <section className="border-l-4 border-amber-500 p-6 my-6">
          <h2 className="text-xl text-center md:text-2xl font-bold mb-8 text-amber-400">Movies</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {movies.map(m => (
              <Card
                key={`movie-${m.imdbID}`}
                id={m.imdbID}
                title={m.Title}
                poster={m.Poster && m.Poster !== "N/A" ? m.Poster : "/placeholder.jpg"}
                year={m.Year}
                rating={m.imdbRating}
                genre={m.Genre}
                state="movies"
                data={m}
              />
            ))}
          </div>
        </section>

        {/* TV Shows */}
        <section className="border-l-4 border-amber-500 p-6 my-6">
          <h2 className="text-xl text-center md:text-2xl font-bold mb-8 text-amber-400">TV Shows</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {series.map(s => (
              <Card
                key={`series-${s.imdbID}`}
                id={s.imdbID}
                title={s.Title}
                poster={s.Poster && s.Poster !== "N/A" ? s.Poster : "/placeholder.jpg"}
                year={s.Year}
                rating={s.imdbRating}
                genre={s.Genre}
                state="tvshows"
                data={s}
              />
            ))}
          </div>
        </section>

        {/* Anime */}
        <section className="border-l-4 border-amber-500 p-6 my-6">
          <h2 className="text-xl text-center md:text-2xl font-bold mb-8 text-amber-400">Anime</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {anime.map(a => (
              <Card
                key={`anime-${a.imdbID}`}
                id={a.imdbID}
                title={a.Title}
                poster={a.Poster && a.Poster !== "N/A" ? a.Poster : "/placeholder.jpg"}
                year={a.Year}
                rating={a.imdbRating}
                genre={a.Genre}
                state="anime"
                data={a}
              />
            ))}
          </div>
        </section>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn redirectUrl="/" />
      </SignedOut>
    </>
  );
}

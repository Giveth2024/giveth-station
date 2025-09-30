'use client'

import { useEffect, useState } from "react";
import Card from "./Card";
import { useUser } from "@clerk/nextjs";

export default function MoviesAndSeries() {
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser(); // Clerk user

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      try {
        // Fetch Movies
        const moviesRes = await fetch(
          `${process.env.NEXT_PUBLIC_GIVETH_SERVER_API}/api/search?s=movie&type=movie&page=1`,
          { headers: { "x-clerk-id": user.id } }
        );
        const moviesData = await moviesRes.json();

        if (moviesData.Search) setMovies(moviesData.Search);

        // Fetch Series
        const seriesRes = await fetch(
          `${process.env.NEXT_PUBLIC_GIVETH_SERVER_API}/api/search?s=series&type=series&page=1`,
          { headers: { "x-clerk-id": user.id } }
        );
        const seriesData = await seriesRes.json();

        if (seriesData.Search) setSeries(seriesData.Search);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-950 text-amber-400">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-amber-400 mb-4"></div>
        <p className="text-lg font-semibold">Loading movies & series...</p>
      </div>
    );
  }

  return (
    <section className="p-6">
      {/* Movies Section */}
      <h2 className="text-2xl text-center font-bold mb-8 text-amber-400">Movies</h2>
      <div className="flex flex-wrap justify-center gap-6 mb-12">
        {movies.map((m) => (
          <Card
            key={m.imdbID}
            id={m.imdbID}
            title={m.Title || m.title}
            poster={m.Poster || m.poster}
            year={m.Year || m.year}
            genre={m.Type || "movie"}
            state="movies"
          />
        ))}
      </div>

      {/* Series Section */}
      <h2 className="text-2xl text-center font-bold mb-8 text-amber-400">Series</h2>
      <div className="flex flex-wrap justify-center gap-6">
        {series.map((s) => (
          <Card
            key={s.imdbID}
            id={s.imdbID}
            title={s.Title || s.title}
            poster={s.Poster || s.poster}
            year={s.Year || s.year}
            genre={s.Type || "series"}
            state="series"
            data={s}
          />
        ))}
      </div>
    </section>
  );
}

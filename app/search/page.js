'use client';
import { useEffect, useState } from "react";
import Navigation from "../components/Navigation/page";
import Card from "../components/Card";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

export default function Search() {
  const apiKey = process.env.NEXT_PUBLIC_OMDB_API_KEY;
  const BASE_URL = "https://www.omdbapi.com/";

  const [state, setState] = useState("");       // movies | tvshows | anime
  const [query, setQuery] = useState("");       // search input
  const [results, setResults] = useState([]);   // card results
  const [loading, setLoading] = useState(true); // initial loader
  const [page, setPage] = useState(1);          // pagination

  // --- Helpers ---
  async function searchOMDb(keyword, type = "movie", count = 20, pageNum = 1) {
    let results = [];
    let currentPage = pageNum;

    while (results.length < count) {
      const res = await fetch(
        `${BASE_URL}?apikey=${apiKey}&s=${encodeURIComponent(keyword)}&type=${type}&page=${currentPage}`
      );
      const data = await res.json();
      if (!data.Search) break;
      results.push(...data.Search);
      if (data.Search.length < 10) break; // no more pages
      currentPage++;
    }

    return { results: results.slice(0, count), nextPage: currentPage };
  }

  async function fetchDetailsById(imdbID) {
    const res = await fetch(`${BASE_URL}?apikey=${apiKey}&i=${imdbID}&plot=short&r=json`);
    return await res.json();
  }

  function resolveType(val) {
    if (val === "movies") return "movie";
    if (val === "tvshows") return "series";
    if (val === "anime") return "series"; // anime treated as series
    return "movie";
  }

  // --- Load category from session ---
  useEffect(() => {
    const stored = sessionStorage.getItem("storedState");
    if (stored) {
      setState(stored);
      (async () => {
        try {
          const type = resolveType(stored);
          const { results: raw, nextPage } = await searchOMDb(stored, type, 20, 1);
          const details = await Promise.all(raw.map(r => fetchDetailsById(r.imdbID)));
          setResults(details.filter(d => d.imdbID)); // remove items without IDs
          setPage(nextPage);
        } catch (err) {
          console.error("Error:", err);
          setResults([]);
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }
  }, [apiKey]);

  // --- Manual Search ---
  async function handleSearch(newSearch = true) {
    if (!query) return;
    setLoading(true);

    try {
      const type = resolveType(state);
      const { results: raw, nextPage } = await searchOMDb(
        query,
        type,
        20,
        newSearch ? 1 : page
      );
      const details = await Promise.all(raw.map(r => fetchDetailsById(r.imdbID)));
      setResults(prev => (newSearch ? details.filter(d => d.imdbID) : [...prev, ...details.filter(d => d.imdbID)]));
      setPage(nextPage);
    } catch (err) {
      console.error("Search Error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  // --- KeyDown handler ---
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch(true);
    }
  };

  // --- UI ---
  if (loading && results.length === 0) {
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

        {/* Search Section */}
        <section className="w-[90%] p-8 my-6 mx-auto flex flex-col items-center justify-center bg-stone-900 rounded-2xl shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold text-amber-400 mb-6">
            Search {state || "movies"}
          </h2>
          <div className="flex w-full max-w-xl gap-4">
            <input
              type="text"
              placeholder={`Enter your ${state || "movies"} name here...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-4 py-3 rounded-lg bg-stone-800 text-stone-200 placeholder-stone-500 border border-stone-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
            <button
              onClick={() => handleSearch(true)}
              className="px-6 py-3 bg-amber-400 text-stone-900 font-semibold rounded-lg shadow-md hover:bg-amber-500 hover:scale-105 transform transition duration-300"
            >
              Search
            </button>
          </div>
        </section>

        {/* Results Section */}
        <section className="p-6 my-6 min-h-[50vh]">
          <h3 className="text-xl font-semibold text-amber-400 mb-4 text-center">
            {loading
              ? "Loading..."
              : results.length > 0
              ? `Results for "${query || state}"`
              : "No results found"}
          </h3>

          <div className="flex flex-wrap justify-center gap-6">
            {results.map((m, i) => (
              <Card
                key={`${state}-${m.imdbID || i}`} // ensures unique key
                id={m.imdbID}
                title={m.Title}
                poster={m.Poster && m.Poster !== "N/A" ? m.Poster : "/placeholder.jpg"}
                year={m.Year}
                rating={m.imdbRating}
                genre={m.Genre}
                state={state || "movies"}
                data={m}
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

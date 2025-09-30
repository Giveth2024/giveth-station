'use client';
import { useEffect, useState } from "react";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/nextjs";
import Card from "../components/Card";
import { useRouter } from "next/navigation";

export default function LibraryPage() {
  const { user } = useUser();
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const OMDB_API = process.env.NEXT_PUBLIC_OMDB_API_KEY;
  const API = process.env.NEXT_PUBLIC_GIVETH_SERVER_API;

  useEffect(() => {
    if (!user) return;

    async function fetchLibrary() {
      try {
        const [favRes, histRes] = await Promise.all([
          fetch(`${API}/api/favorite/${user.id}`, { headers: { "x-clerk-id": user.id } }),
          fetch(`${API}/api/history/${user.id}`, { headers: { "x-clerk-id": user.id } }),
        ]);

        const favIds = await favRes.json();
        const histIds = await histRes.json();

        const fetchOmdbDetails = async (items) => {
          const results = await Promise.all(
            items.map(async (item) => {
              try {
                const res = await fetch(`https://www.omdbapi.com/?i=${item.imdb_id}&apikey=${OMDB_API}`);
                const data = await res.json();
                if (data.Response === "True") {
                  return {
                    id: data.imdbID,
                    title: data.Title,
                    poster: data.Poster !== "N/A" ? data.Poster : "/placeholder.jpg",
                    genre: data.Type || "movie",
                    year: data.Year || "",
                    dbId: item.id, // db id for history, favorites use imdb_id
                  };
                }
                return null;
              } catch {
                return null;
              }
            })
          );
          return results.filter(Boolean);
        };

        const [favDetails, histDetails] = await Promise.all([
          fetchOmdbDetails(favIds),
          fetchOmdbDetails(histIds),
        ]);

        setFavorites(favDetails);
        setHistory(histDetails);
      } catch (err) {
        console.error("Failed to fetch library:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLibrary();
  }, [user]);

  const goToMedia = (item) => {
    router.push(`/player?id=${item.id}&type=${item.genre}`);
  };

  // Remove single favorite (needs clerk_id + imdb_id)
  const removeFavorite = async (imdbId) => {
    try {
      await fetch(`${API}/api/favorite/${user.id}/${imdbId}`, {
        method: "DELETE",
        headers: { "x-clerk-id": user.id },
      });
      setFavorites(favorites.filter(f => f.id !== imdbId));
    } catch (err) {
      console.error("Failed to remove favorite:", err);
    }
  };

  // Remove single history item
  const removeHistory = async (dbId) => {
    try {
      await fetch(`${API}/api/history/${dbId}`, {
        method: "DELETE",
        headers: { "x-clerk-id": user.id },
      });
      setHistory(history.filter(h => h.dbId !== dbId));
    } catch (err) {
      console.error("Failed to remove history:", err);
    }
  };

  // Clear all favorites
  const clearAllFavorites = async () => {
    try {
      await Promise.all(
        favorites.map(f =>
          fetch(`${API}/api/favorite/${user.id}/${f.id}`, {
            method: "DELETE",
            headers: { "x-clerk-id": user.id },
          })
        )
      );
      setFavorites([]);
    } catch (err) {
      console.error("Failed to clear all favorites:", err);
    }
  };

  // Clear all history
  const clearAllHistory = async () => {
    try {
      await Promise.all(
        history.map(h =>
          fetch(`${API}/api/history/${h.dbId}`, {
            method: "DELETE",
            headers: { "x-clerk-id": user.id },
          })
        )
      );
      setHistory([]);
    } catch (err) {
      console.error("Failed to clear all history:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-950 text-amber-400">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-amber-400 mb-4" />
        <p className="text-lg font-semibold">Loading your library...</p>
      </div>
    );
  }

  return (
    <SignedIn>
      <div className="min-h-screen bg-stone-950 text-stone-100 p-6 space-y-12">
        <button
          onClick={() => router.push("/home")}
          className="px-6 py-2 mb-6 bg-amber-400 text-stone-900 font-semibold rounded-lg shadow-md hover:bg-amber-500 hover:scale-105 transform transition duration-300"
        >
          Back
        </button>

        {/* Favorites Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-amber-400">Favorites ❤️</h1>
            {favorites.length > 0 && (
              <button
                onClick={clearAllFavorites}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Clear All
              </button>
            )}
          </div>
          {favorites.length ? (
            <div className="flex flex-wrap gap-6 justify-start">
              {favorites.map(f => (
                <Card
                  key={f.id}
                  {...f}
                  onClick={() => goToMedia(f)}
                  onRemove={() => removeFavorite(f.id)}
                />
              ))}
            </div>
          ) : <p className="text-stone-400">No favorites yet.</p>}
        </section>

        {/* History Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-amber-400">Watch History 🎬</h1>
            {history.length > 0 && (
              <button
                onClick={clearAllHistory}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Clear All
              </button>
            )}
          </div>
          {history.length ? (
            <div className="flex flex-wrap gap-6 justify-start">
              {history.map(h => (
                <Card
                  key={h.id}
                  {...h}
                  onClick={() => goToMedia(h)}
                  onRemove={() => removeHistory(h.dbId)}
                />
              ))}
            </div>
          ) : <p className="text-stone-400">No watch history yet.</p>}
        </section>
      </div>
    </SignedIn>
  );
}

<SignedOut>
  <RedirectToSignIn redirectUrl="/" />
</SignedOut>

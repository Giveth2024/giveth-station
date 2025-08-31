'use client';
import { useEffect, useState } from "react";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function History() {
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const router = useRouter();

  useEffect(() => {
    setFavorites(JSON.parse(localStorage.getItem("favorites") || "[]"));
    setHistory(JSON.parse(localStorage.getItem("history") || "[]"));
  }, []);

  const goToMedia = (media) => {
    sessionStorage.setItem("data", JSON.stringify(media));
    router.push("/player");
  };

  const removeFavorite = (id) => {
    const updated = favorites.filter(fav => fav.Id !== id);
    localStorage.setItem("favorites", JSON.stringify(updated));
    setFavorites(updated);
  };

  const clearHistory = () => {
    localStorage.setItem("history", JSON.stringify([]));
    setHistory([]);
  };

  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-stone-950 text-stone-100 p-6">
            <button
                onClick={() => router.push("/home")}
                className="px-6 py-2 mb-3 bg-amber-400 text-stone-900 font-semibold rounded-lg shadow-md hover:bg-amber-500 hover:scale-105 transform transition duration-300"
            >
                Back
            </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Favorites Column */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl text-amber-400 font-bold">Favorites</h1>
              </div>
              <div className="flex flex-col gap-4">
                {favorites.length ? favorites.map(fav => (
                  <div key={fav.Id} className="flex items-center gap-4 bg-stone-900 rounded-lg p-2 shadow-md">
                    <Image
                      src={fav.Data.Poster !== "N/A" ? fav.Data.Poster : "/placeholder.jpg"}
                      alt={fav.Data.Title}
                      className="rounded w-24 h-36 object-cover cursor-pointer"
                      onError={(e) => e.target.src = "/placeholder.jpg"}
                      onClick={() => goToMedia(fav)}
                    />
                    <div className="flex-1 flex justify-between items-center">
                      <p className="text-lg font-medium">{fav.Data.Title}</p>
                      <button
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                        onClick={() => removeFavorite(fav.Id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )) : <p>No favorites yet</p>}
              </div>
            </div>

            {/* Watch History Column */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl text-amber-400 font-bold">Watch History</h1>
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  onClick={clearHistory}
                >
                  Clear History
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {history.length ? history.map(item => (
                  <div key={item.Id} className="flex items-center gap-4 bg-stone-900 rounded-lg p-2 shadow-md">
                    <Image
                      src={item.Data.Poster !== "N/A" ? item.Data.Poster : "/placeholder.jpg"}
                      alt={item.Data.Title}
                      className="rounded w-24 h-36 object-cover cursor-pointer"
                      onError={(e) => e.target.src = "/placeholder.jpg"}
                      onClick={() => goToMedia(item)}
                    />
                    <p className="text-lg font-medium">{item.Data.Title}</p>
                  </div>
                )) : <p>No watch history yet</p>}
              </div>
            </div>
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn redirectUrl="/" />
      </SignedOut>
    </>
  );
}

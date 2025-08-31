'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";


export default function Player() {
  const router = useRouter();
  const [media, setMedia] = useState(null);
  const [source, setSource] = useState("xyz"); // default source
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    const storedData = sessionStorage.getItem("data");
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setMedia(parsed);

      // Check if this media is already favorited
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      setFavorited(favorites.some(fav => fav.Id === parsed.Id));

      // Add to watch history
      const history = JSON.parse(localStorage.getItem("history") || "[]");
      const alreadyInHistory = history.some(h => h.Id === parsed.Id);
      if (!alreadyInHistory) {
        history.unshift(parsed); // add to front
        localStorage.setItem("history", JSON.stringify(history));
      }
    }
  }, []);

  if (!media) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-950 text-amber-400">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-amber-400 border-solid mb-4"></div>
        <p className="text-lg font-semibold">Loading content...</p>
      </div>
    );
  }

  const { Id, Data, State } = media;

  const formatRatings = (ratings) =>
    ratings?.map(r => `${r.Source}: ${r.Value}`).join(" | ");

  // Embed URLs for both sources
  const embedUrls = {
    xyz: {
      movies: `https://vidsrc.xyz/embed/movie/${Id}`,
      tvshows: `https://vidsrc.xyz/embed/tv/${Id}`,
      anime: `https://vidsrc.xyz/embed/tv/${Id}`,
    },
    cc: {
      movies: `https://vidsrc.cc/v3/embed/movie/${Id}?autoPlay=false&poster=true`,
      tvshows: `https://vidsrc.cc/v3/embed/tv/${Id}?autoPlay=false&poster=true`,
      anime: `https://vidsrc.cc/v2/embed/anime/imdb${Id}/1/sub?autoPlay=false&autoSkipIntro=false`,
    }
  };

  const getEmbedUrl = () => {
    if (!State) return "";
    return embedUrls[source][State];
  };

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (favorited) {
      // remove
      const newFavs = favorites.filter(fav => fav.Id !== Id);
      localStorage.setItem("favorites", JSON.stringify(newFavs));
      setFavorited(false);
    } else {
      favorites.unshift(media);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      setFavorited(true);
    }
  };

  return (
    <>
      <SignedIn>
        <div className="bg-stone-950 text-stone-100 min-h-screen p-6">
          <button
            onClick={() => router.push("/home")}
            className="px-6 py-2 mb-3 bg-amber-400 text-stone-900 font-semibold rounded-lg shadow-md hover:bg-amber-500 hover:scale-105 transform transition duration-300"
          >
            Back
          </button>

          {/* Title & Poster */}
          <div className="flex flex-col md:flex-row gap-6 p-6 bg-stone-900 rounded-xl shadow-lg">
            <div className="flex-shrink-0 w-full md:w-64 lg:w-72">
              <img
                src={Data.Poster !== "N/A" ? Data.Poster : "/placeholder.jpg"}
                alt={Data.Title}
                className="w-full h-[360px] rounded-xl shadow-lg object-cover"
                onError={(e) => e.target.src = "/placeholder.jpg"}
              />
            </div>

            {/* Metadata */}
            <div className="flex-1 flex flex-col gap-4">
              <h1 className="text-4xl md:text-5xl font-extrabold text-amber-400 drop-shadow-lg">
                {Data.Title} <span className="text-stone-200 text-3xl">({Data.Year})</span>
              </h1>
              <p className="text-stone-300 italic">{Data.Genre}</p>
              <p className="text-stone-400 text-sm md:text-base leading-relaxed">{Data.Plot}</p>

              <div className="flex gap-4 mt-4">
                <button
                  onClick={toggleFavorite}
                  className={`px-4 py-2 rounded shadow-md ${favorited ? "bg-red-500 text-white" : "bg-stone-800 text-stone-200"}`}
                >
                  {favorited ? "Unfavorite ❤️" : "Add to Favorites 🤍"}
                </button>
                <button
                  onClick={() => router.push("/history")}
                  className="px-4 py-2 rounded shadow-md bg-amber-400 text-stone-900 hover:bg-amber-500 transition"
                >
                  View History
                </button>
              </div>
            </div>
          </div>

          {/* Video Player */}
          <div className="h-[100dvh] w-full mt-6">
            <iframe
              src={getEmbedUrl()}
              className="w-full h-[100dvh] rounded shadow-md"
              allowFullScreen
            ></iframe>
          </div>

          {/* Source Toggle Buttons */}
          <h4 className="my-4">Click on the other if one doesn&apos;t work</h4>
          <div className="flex gap-4">
            <button
              className={`px-4 py-2 rounded shadow-md ${source === "xyz" ? "bg-amber-400 text-stone-900" : "bg-stone-800 text-stone-200"}`}
              onClick={() => setSource("xyz")}
            >
              vidsrc.xyz
            </button>
            <button
              className={`px-4 py-2 rounded shadow-md ${source === "cc" ? "bg-amber-400 text-stone-900" : "bg-stone-800 text-stone-200"}`}
              onClick={() => setSource("cc")}
            >
              vidsrc.cc
            </button>
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn redirectUrl="/" />
      </SignedOut>
    </>
  );
}

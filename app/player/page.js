'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

export default function Player() {
  const router = useRouter();
  const [media, setMedia] = useState(null);
  const [source, setSource] = useState("xyz");
  const [favorited, setFavorited] = useState(false);

  // New states for image failover
  const [imgSrc, setImgSrc] = useState("");
  const [triedFallback, setTriedFallback] = useState(false);

  useEffect(() => {
    const storedData = sessionStorage.getItem("data");
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setMedia(parsed);

      // Initialize poster src
      const initialSrc = parsed.Data.Poster && parsed.Data.Poster !== "N/A"
        ? `https://img.omdbapi.com/?i=${parsed.Data.imdbID}&h=600&apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY}`
        : "/placeholder.jpg";
      setImgSrc(initialSrc);

      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      setFavorited(favorites.some(fav => fav.Id === parsed.Id));

      const history = JSON.parse(localStorage.getItem("history") || "[]");
      if (!history.some(h => h.Id === parsed.Id)) {
        history.unshift(parsed);
        localStorage.setItem("history", JSON.stringify(history));
      }
    }
  }, []);

  if (!media) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-950 text-amber-400">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-amber-400 mb-4"></div>
        <p className="text-lg font-semibold">Loading content...</p>
      </div>
    );
  }

  const { Id, Data, State } = media;

  const formatRatings = (ratings) =>
    ratings?.map(r => `${r.Source}: ${r.Value}`).join(" | ");

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
      const newFavs = favorites.filter(fav => fav.Id !== Id);
      localStorage.setItem("favorites", JSON.stringify(newFavs));
      setFavorited(false);
    } else {
      favorites.unshift(media);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      setFavorited(true);
    }
  };

  // Image failover handler
  const handleImgError = () => {
    if (!triedFallback && Data.Poster && Data.Poster !== "N/A") {
      setImgSrc(Data.Poster); // fallback to original poster
      setTriedFallback(true);
    } else {
      setImgSrc("/placeholder.jpg"); // final fallback
    }
  };

  return (
    <>
      <SignedIn>
        <div className="bg-stone-950 text-stone-100 min-h-screen p-6">
          <button
            onClick={() => router.push("/home")}
            className="px-6 py-2 mb-4 bg-amber-400 text-stone-900 font-semibold rounded-lg shadow-md hover:bg-amber-500 hover:scale-105 transform transition duration-300"
          >
            Back
          </button>

          {/* Main Card */}
          <div className="flex flex-col md:flex-row gap-6 p-6 bg-stone-900 rounded-2xl shadow-2xl border border-amber-500">
            {/* Poster */}
            <div className="flex-shrink-0 w-full md:w-64 lg:w-72">
              <img
                src={imgSrc}
                alt={Data.Title}
                className="w-full h-[360px] rounded-xl shadow-lg object-cover border border-amber-400"
                onError={handleImgError}
              />
            </div>

            {/* Metadata */}
            <div className="flex-1 flex flex-col gap-3">
              <h1 className="text-4xl md:text-5xl font-extrabold text-amber-400 drop-shadow-lg">
                {Data.Title} <span className="text-stone-200 text-3xl">({Data.Year})</span>
              </h1>
              <p className="text-stone-300 italic text-lg">{Data.Genre}</p>
              <p className="text-stone-400 text-base leading-relaxed">{Data.Plot}</p>

              {/* Dynamic Metadata */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 bg-stone-800 p-4 rounded-xl border border-amber-600">
                {Object.entries(Data).map(([key, value]) => {
                  if (key === "Poster" || key === "Title" || key === "Plot" || key === "Genre" || key === "Response") return null;
                  if (key === "Ratings") return <p key={key} className="text-amber-300 font-medium">Ratings: {formatRatings(value)}</p>;
                  if (Array.isArray(value)) return <p key={key} className="text-stone-200 font-light">{key}: {value.join(", ")}</p>;
                  if (typeof value === "object" && value !== null) return null;
                  return <p key={key} className="text-stone-200 font-light">{key}: {value}</p>;
                })}
              </div>

              <div className="flex gap-4 mt-4">
                <button
                  onClick={toggleFavorite}
                  className={`px-4 py-2 rounded shadow-md transition ${favorited ? "bg-red-500 text-white" : "bg-stone-800 text-stone-200 hover:bg-stone-700"}`}
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
          <div className="h-[100dvh] w-full mt-6 rounded-xl overflow-hidden shadow-2xl border border-amber-400">
            <iframe
              src={getEmbedUrl()}
              className="w-full h-[100dvh]"
              allowFullScreen
            ></iframe>
          </div>

          {/* Source Toggle */}
          <h4 className="my-4 text-stone-300">Click another source if one doesn't work</h4>
          <div className="flex gap-4 mb-8">
            <button
              className={`px-4 py-2 rounded shadow-md transition ${source === "xyz" ? "bg-amber-400 text-stone-900" : "bg-stone-800 text-stone-200 hover:bg-stone-700"}`}
              onClick={() => setSource("xyz")}
            >
              vidsrc.xyz
            </button>
            <button
              className={`px-4 py-2 rounded shadow-md transition ${source === "cc" ? "bg-amber-400 text-stone-900" : "bg-stone-800 text-stone-200 hover:bg-stone-700"}`}
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

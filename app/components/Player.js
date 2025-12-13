"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  useUser,
} from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShareNodes } from "@fortawesome/free-solid-svg-icons";

export default function Player() {
  const router = useRouter();
  const { user } = useUser();

  const [data, setData] = useState(null);
  const [media, setMedia] = useState(null);
  const [imgSrc, setImgSrc] = useState("/placeholder.jpg");
  const [triedDirect, setTriedDirect] = useState(false);
  const [source, setSource] = useState("xyz");
  const [url, setUrl] = useState("");

  const [favorited, setFavorited] = useState(false);
  const [favDbId, setFavDbId] = useState(null);
  const [savingFav, setSavingFav] = useState(false);

  // Url Search Parameters
  const searchParams = useSearchParams();
  const dataFromUrl = searchParams.get("data");

  // use effect just to get data from the Search Parameters
  // 🔹 Redirect if no Url Pramaters nor localStorage data
  useEffect(() => {
    // Check Url Parameters first
    if (dataFromUrl)
    {

      const decodedString = atob(dataFromUrl);

      const decodedObject = JSON.parse(decodedString);

      //Check if Id is valid
      if(!containsValidId(decodedObject.Id))
      {
        alert("!!!ID is invalid\nTry using a different ID or Contact Giveth Station Administrator\nRedirecting to home page!!!");
        localStorage.clear();
        router.push("/home");
      }

      const details = {
        Id : decodedObject.Id,
        State : decodedObject.State
      };

      localStorage.setItem("data", JSON.stringify(details));
    }
    else
    {
      console.log("No search Parameters in the url");
    }

    // Check for local Storage 
    const stored = localStorage.getItem("data");
    if (!stored  && !dataFromUrl)
    {
      router.replace("/home");
    } 
        
  }, [router, dataFromUrl]);

  // Check parameters first 
  // check local storage

  // 🔹 Refresh favorite state
  const refreshFavoritesState = useCallback(
    async (imdbId) => {
      if (!user) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_GIVETH_SERVER_API}/api/favorite/${user.id}`,
          { headers: { "x-clerk-id": user.id } }
        );
        const list = await res.json();
        const match = Array.isArray(list)
          ? list.find((f) => f.imdb_id === imdbId)
          : null;
        if (match) {
          setFavorited(true);
          setFavDbId(match.id);
        } else {
          setFavorited(false);
          setFavDbId(null);
        }
      } catch (err) {
        console.error("❌ Failed to load favorites:", err);
      }
    },
    [user]
  );

  // 🔹 Load media + history
  useEffect(() => {
    const stored = localStorage.getItem("data");
    if (!stored || !user) return;
    const parsed = JSON.parse(stored);
    setData(parsed);

    async function load() {
      try {
        // Fetch media
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_GIVETH_SERVER_API}/api/player?id=${parsed.Id}`,
          { headers: { "x-clerk-id": user.id } }
        );
        const json = await res.json();
        if (!json?.media) throw new Error("No media returned");

        setMedia(json.media);

        // Poster with fallback order: OMDb → direct → /404
        const omdbPoster =
          json.media.imdbID &&
          json.media.Poster &&
          json.media.Poster !== "N/A"
            ? `https://img.omdbapi.com/?i=${json.media.imdbID}&h=600&apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY}`
            : null;

        const directPoster =
          json.media.Poster && json.media.Poster !== "N/A"
            ? json.media.Poster
            : null;

        setImgSrc(omdbPoster || directPoster || "/404.jpg");
        setTriedDirect(false);

      //Check if Id is valid
      if(!containsValidId(json.media.imdbID))
      {
        alert("!!!ID is invalid\nTry using a different ID or Contact Giveth Station Administrator\nRedirecting to home page!!!");
        localStorage.clear();
        router.push("/home");
      }

        // Add to history
        await fetch(
          `${process.env.NEXT_PUBLIC_GIVETH_SERVER_API}/api/history`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-clerk-id": user.id,
            },
            body: JSON.stringify({
              clerk_id: user.id,
              imdb_id: json.media.imdbID,
            }),
          }
        );

        // Check if favorited
        await refreshFavoritesState(json.media.imdbID);
      } catch (err) {
        console.error("❌ Failed to load media:", err);
      }
    }

    load();
  }, [user, refreshFavoritesState]);

  // 🔹 Toggle favorites
  async function toggleFavorite() {
    if (!user || !media) return;
    setSavingFav(true);

    try {
      if (favorited && favDbId) {
        // Remove
        await fetch(
          `${process.env.NEXT_PUBLIC_GIVETH_SERVER_API}/api/favorite/${user.id}/${media.imdbID}`,
          { method: "DELETE", headers: { "x-clerk-id": user.id } }
        );
        setFavorited(false);
        setFavDbId(null);
      } else {
        // Add
        await fetch(
          `${process.env.NEXT_PUBLIC_GIVETH_SERVER_API}/api/favorite`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-clerk-id": user.id,
            },
            body: JSON.stringify({
              clerk_id: user.id,
              imdb_id: media.imdbID,
            }),
          }
        );
        await refreshFavoritesState(media.imdbID);
      }
    } catch (err) {
      console.error("❌ Favorite toggle failed:", err);
    } finally {
      setSavingFav(false);
    }
  }

  // 🔹 Poster fallback
  const handleImgError = () => {
    if (!triedDirect && media?.Poster && media.Poster !== "N/A") {
      setImgSrc(media.Poster);
      setTriedDirect(true);
    } else {
      setImgSrc("/404.jpg");
    }
  };

  // 🔹 Build Embed URL
  const Id = data?.Id || data?.id;
  const State = (data?.State || data?.state || "").toLowerCase();
  const stateKey =
    State.includes("movie") ? "movies" : State.includes("series") ? "series" : null;

  const embedUrls = {
    xyz: {
      movies: `https://vidsrc.xyz/embed/movie/${Id}`,
      series: `https://vidsrc.xyz/embed/tv/${Id}`,
    },
    cc: {
      movies: `https://vidsrc.cc/v3/embed/movie/${Id}?autoPlay=false&poster=true`,
      series: `https://vidsrc.cc/v3/embed/tv/${Id}?autoPlay=false&poster=true`,
    },
  };

  const embedUrl = Id && stateKey ? embedUrls[source][stateKey] : null;

  // 🔹 Loading screen
  if (!media || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-stone-950 text-amber-400">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-amber-400 mb-4" />
        <p className="text-lg font-semibold">Loading content...</p>
      </div>
    );
  }

  const formatRatings = (ratings) =>
    ratings?.map((r) => `${r.Source}: ${r.Value}`).join(" | ");

  // function to check if the variable contains id in this format "xxx...." and "ttxxx..." with "x" representing numbers.
  function containsValidId(value) {
  if (typeof value !== "string") return false;

  const pattern = /\b(?:\d{3}|tt\d{3})\d*\b/;
  return pattern.test(value);
}

async function createShareUrl()
{
  const shareId = data.Id;
  const shareState = data.State;

  // Create the payload
  const payload = JSON.stringify({
    Id : shareId,
    State : shareState
  });

  //Obsfucate
  const encoded = btoa(payload);

  setUrl(`${window.location.origin}/player?data=${encoded}`);

  // console.log("New Url :-> ", url);
  try
  {
    await navigator.clipboard.writeText(url);
    alert("Link copied! You may Share it with friends and family 😎🍿");
  }
  catch(err)
  {
    console.error("❌ Failed to copy :-> ", err);
  }
  
}

  return (
    <>
      <SignedIn>
        <div className="bg-stone-950 text-stone-100 min-h-screen p-6">
          {/* Back Button */}
          <button
            onClick={() => router.push("/home")}
            className="px-6 py-2 mb-4 bg-amber-400 text-stone-900 font-semibold rounded-lg shadow-md hover:bg-amber-500 hover:scale-105 transform transition"
          >
            Back
          </button>

          {/* Info Section */}
          <div className="flex flex-col md:flex-row gap-6 p-6 bg-stone-900 rounded-2xl shadow-2xl border border-amber-500">
            {/* Poster */}
            <div className="flex-shrink-0 w-full md:w-64 lg:w-72 relative h-[360px] rounded-xl shadow-lg border border-amber-400 overflow-hidden">
              <Image
                src={imgSrc || "/placeholder.jpg"}
                alt={media.Title}
                fill
                className="object-cover"
                onError={handleImgError}
                unoptimized
              />
            </div>

            {/* Details */}
            <div className="flex-1 flex flex-col gap-3">
              <h1 className="text-4xl md:text-5xl font-extrabold text-amber-400 drop-shadow-lg">
                {media.Title}{" "}
                <span className="text-stone-200 text-3xl">({media.Year})</span>
              </h1>
              {media.Genre && (
                <p className="text-stone-300 italic text-lg">{media.Genre}</p>
              )}
              {media.Plot && (
                <p className="text-stone-400 text-base leading-relaxed">
                  {media.Plot}
                </p>
              )}

              {/* Extra Info */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 bg-stone-800 p-4 rounded-xl border border-amber-600">
                {Object.entries(media).map(([key, value]) => {
                  if (
                    ["Poster", "Title", "Plot", "Genre", "Response"].includes(
                      key
                    ) ||
                    !value
                  )
                    return null;

                  if (key === "Ratings")
                    return (
                      <p key={key} className="text-amber-300 font-medium">
                        Ratings: {formatRatings(value)}
                      </p>
                    );

                  if (Array.isArray(value))
                    return (
                      <p key={key} className="text-stone-200 font-light">
                        {key}: {value.join(", ")}
                      </p>
                    );

                  if (typeof value === "object") return null;

                  return (
                    <p key={key} className="text-stone-200 font-light">
                      {key}: {value}
                    </p>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-4">
                <button
                  onClick={toggleFavorite}
                  disabled={savingFav}
                  className={`px-4 py-2 rounded shadow-md transition ${
                    favorited
                      ? "bg-red-500 text-white"
                      : "bg-stone-800 text-stone-200 hover:bg-stone-700"
                  }`}
                >
                  {savingFav
                    ? "Saving..."
                    : favorited
                    ? "Unfavorite ❤️"
                    : "Add to Favorites 🤍"}
                </button>

                <button
                  onClick={() => router.push("/history")}
                  className="px-4 py-2 rounded shadow-md bg-amber-400 text-stone-900 hover:bg-amber-500 transition"
                >
                  View History
                </button>

                <button title="Copy and Paste"
                  onClick={() => createShareUrl()}
                  className="px-4 py-2 rounded shadow-md bg-green-400 text-stone-900 hover:bg-green-500 transition"
                >
                  Share <FontAwesomeIcon icon={faShareNodes} />
                </button>
    
              </div>
            </div>
          </div>

          {/* Player */}
          {embedUrl && (
            <div className="h-[100dvh] w-full mt-6 rounded-xl overflow-hidden shadow-2xl border border-amber-400">
              <iframe
                src={embedUrl}
                className="w-full h-[100dvh]"
                allowFullScreen
                title="video player"
              />
            </div>
          )}

          {/* Source Switch */}
          <h4 className="my-4 text-stone-300">
            Click another source if one doesn&apos;t work
          </h4>
          <div className="flex gap-4 mb-8">
            <button
              className={`px-4 py-2 rounded shadow-md transition ${
                source === "xyz"
                  ? "bg-amber-400 text-stone-900"
                  : "bg-stone-800 text-stone-200 hover:bg-stone-700"
              }`}
              onClick={() => setSource("xyz")}
            >
              vidsrc.xyz
            </button>
            <button
              className={`px-4 py-2 rounded shadow-md transition ${
                source === "cc"
                  ? "bg-amber-400 text-stone-900"
                  : "bg-stone-800 text-stone-200 hover:bg-stone-700"
              }`}
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

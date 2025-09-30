import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export default function Card({ id, title, poster, genre, year, onRemove }) {
  const router = useRouter();
  const [imgSrc, setImgSrc] = useState(
    poster && poster !== "N/A"
      ? `https://img.omdbapi.com/?i=${id}&h=600&apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY}`
      : "/placeholder.jpg"
  );
  const [triedFallback, setTriedFallback] = useState(false);

  function setID(value) {
    const dataStorage = { Id: value, State: genre };
    localStorage.setItem("data", JSON.stringify(dataStorage));
    router.push("/player");
  }

  const handleError = () => {
    if (!triedFallback && poster && poster !== "N/A") {
      setImgSrc(poster);
      setTriedFallback(true);
    } else {
      setImgSrc("/placeholder.jpg");
    }
  };

  return (
    <div
      id={id}
      title={title}
      className="bg-stone-800 rounded-xl overflow-hidden shadow-lg hover:scale-105 transform transition duration-300 w-full sm:w-48 md:w-64 relative"
    >
      <div onClick={() => setID(id)} className="cursor-pointer relative w-full h-72">
        <Image
          src={imgSrc}
          alt={title}
          fill
          className="object-cover"
          onError={handleError}
          sizes="(max-width: 768px) 100vw, 16rem"
        />
      </div>

      <div className="p-3">h
        <h3
          className="text-lg font-semibold hover:text-amber-400 cursor-pointer transition"
          onClick={() => setID(id)}
        >
          {title}
        </h3>
        <p className="text-stone-400 text-sm mt-1">{genre}</p>
        <p className="text-stone-400 text-xs mt-1">{year}</p>
      </div>

      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs rounded hover:bg-red-700"
        >
          Remove
        </button>
      )}
    </div>
  );
}

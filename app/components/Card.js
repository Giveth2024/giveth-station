import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Card({id, title, poster, rating, genre, year, state, data}) {
  const router = useRouter();
  const [imgSrc, setImgSrc] = useState(
    poster && poster !== "N/A"
      ? `https://img.omdbapi.com/?i=${id}&h=600&apikey=${process.env.NEXT_PUBLIC_OMDB_API_KEY}`
      : "/placeholder.jpg"
  );
  const [triedFallback, setTriedFallback] = useState(false);

  function setID(value) {
    const dataStorage = {
      Id: value,
      State: state,
      Data: data
    };
    sessionStorage.setItem("data", JSON.stringify(dataStorage));
    router.push("/player");
  }

  const handleError = () => {
    if (!triedFallback && poster && poster !== "N/A") {
      setImgSrc(poster); // try original poster
      setTriedFallback(true);
    } else {
      setImgSrc("/placeholder.jpg"); // fallback to placeholder
    }
  };

  return (
    <div id={id} title={title} onClick={() => setID(id)} className="bg-stone-800 rounded-xl overflow-hidden shadow-lg hover:scale-105 transform transition duration-300 w-full sm:w-48 md:w-64">
      <div className="relative">
        <img
          src={imgSrc}
          alt={title}
          className="w-full h-72 object-cover"
          width={200}
          height={300}
          onError={handleError}
        />
        <div className="absolute bottom-2 right-2 bg-amber-400 text-stone-950 text-xs font-bold px-2 py-1 rounded-md shadow">
          ★ {rating}
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-lg font-semibold hover:text-amber-400 cursor-pointer transition">
          {title}
        </h3>
        <p className="text-stone-400 text-sm mt-1">{genre}</p>
        <p className="text-stone-400 text-xs mt-1">{year}</p>
      </div>
    </div>
  );
}

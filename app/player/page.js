import { Suspense } from "react";
import Player from "../components/Player";

export default function PlayerPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Player />
    </Suspense>
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      Loading player...
    </div>
  );
}

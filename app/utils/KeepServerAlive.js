"use client";

import { useEffect } from "react";
import axios from "axios";

export default function KeepServerAlive({ children }) {
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_GIVETH_SERVER_API}/`);
        const data = res.data;

        console.log("Server Status:", data.status);
      } catch (err) {
        console.error("KeepAlive Error:", err);
      }
    }, 60000);

    return () => clearInterval(id); // during hard refresh
  }, []);

  return children;
}

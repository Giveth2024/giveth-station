/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "i.pinimg.com",
      "m.media-amazon.com", // OMDb posters
      "img.omdbapi.com",    // OMDb image endpoint
      "upload.wikimedia.org" // Just in case
    ],
  },
};

export default nextConfig;

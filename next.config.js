/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "ofssokabeqkeydyzndjg.supabase.co",
      "i.imgur.com" // ✅ added Imgur to support jigsaw puzzle image loading
    ],
  },
  // ...other Next.js config options can go here
}

module.exports = nextConfig;

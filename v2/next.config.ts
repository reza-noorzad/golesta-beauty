import type { NextConfig } from "next";
const nextConfig:NextConfig={
  images:{remotePatterns:[
    {protocol:"https",hostname:"firebasestorage.googleapis.com",pathname:"/v0/b/**"},
    {protocol:"https",hostname:"res.cloudinary.com",pathname:"/**"},
  ]},
  turbopack:{rules:{"*.css":{loaders:["@tailwindcss/turbopack"],as:"*.css"}}},
};
export default nextConfig;

import type { NextConfig } from "next";
const nextConfig:NextConfig={
  async headers(){return [{source:"/:path*",headers:[
    {key:"Content-Security-Policy",value:"frame-ancestors 'none'; object-src 'none'; base-uri 'self'"},
    {key:"X-Frame-Options",value:"DENY"},
    {key:"X-Content-Type-Options",value:"nosniff"},
    {key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},
  ]}];},
  images:{remotePatterns:[
    {protocol:"https",hostname:"firebasestorage.googleapis.com",pathname:"/v0/b/**"},
    {protocol:"https",hostname:"res.cloudinary.com",pathname:"/**"},
  ]},
  turbopack:{rules:{"*.css":{loaders:["@tailwindcss/turbopack"],as:"*.css"}}},
};
export default nextConfig;

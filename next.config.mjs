/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  allowedDevOrigins: [
    'unsacramentarian-mitzi-unmodernized.ngrok-free.dev',  // Your ngrok domain
    'localhost:3000',  // Local fallback
    '*.ngrok-free.dev',  // Wildcard for other ngrok subdomains (optional)
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: '6mb'
    }
  }
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
   reactStrictMode: true,
   images: {
      domains: ['localhost', 'miumiu-chat-app-resources.s3.ap-southeast-1.amazonaws.com', 'example.com']
   }
};



export default nextConfig;
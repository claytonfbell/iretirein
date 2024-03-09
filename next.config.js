const million = require("million/compiler")

const millionConfig = {
  auto: true,
  // if you're using RSC:
  // auto: { rsc: true },
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  output: "export",
}

module.exports = million.next(nextConfig, millionConfig)

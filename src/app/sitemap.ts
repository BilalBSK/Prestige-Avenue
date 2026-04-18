import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/cars`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/booking`,
      lastModified: new Date(),
    },
  ];
}

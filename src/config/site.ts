export type SiteConfig = typeof siteConfig

const links = {
  instagram: "https://instagram.com/deeliciousbakes",
  facebook: "https://facebook.com/deeliciousbakes",
  tiktok: "https://tiktok.com/@deeliciousbakes",
  email: "mailto:hello@deeliciousbakes.co.uk",
}

export const siteConfig = {
  name: "Deelicious Bakes",
  description: "Handmade cakes, cupcakes, and celebration bakes in Salisbury.",
  url: "https://deeliciousbakes.co.uk",
  ogImage: "https://deeliciousbakes.co.uk/opengraph-image.png",
  links,
}
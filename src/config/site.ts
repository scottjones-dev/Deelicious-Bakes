import type { FooterItem, MainNavItem } from "@/types";

export type SiteConfig = typeof siteConfig;

const links = {
  instagram: "https://www.instagram.com/deeliciousbakes2026/",
  facebook: "https://www.facebook.com/profile.php?id=61590781655679",
  tiktok: "https://tiktok.com/@deeliciousbakes",
  email: "mailto:hello@deeliciousbakes.co.uk",
};

export const siteConfig = {
  name: "Deelicious Bakes",
  description: "Handmade cakes, cupcakes, and celebration bakes in Salisbury.",
  url: "https://deeliciousbakes.co.uk",
  ogImage: "https://deeliciousbakes.co.uk/opengraph-image.png",
  links,
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
  ] as MainNavItem[],
  footerNav: [
    {
      title: "Bakes",
      items: [
        {
          title: "Build a Cake",
          href: "/build-a-cake",
        },
        {
          title: "Join Waitlist",
          href: "/",
        },
      ],
    },
    {
      title: "Help",
      items: [
        {
          title: "About Us",
          href: "/about",
        },
        {
          title: "Contact Us",
          href: "/contact",
        },
        {
          title: "FAQs",
          href: "/faqs",
        },
      ],
    },
    {
      title: "Social",
      items: [
        {
          title: "Instagram",
          href: links.instagram,
          external: true,
        },
        {
          title: "Facebook",
          href: links.facebook,
          external: true,
        },
        {
          title: "TikTok",
          href: links.tiktok,
          external: true,
        },
      ],
    },
    {
      title: "Legal",
      items: [
        {
          title: "Terms of Service",
          href: "/terms",
        },
        {
          title: "Privacy Policy",
          href: "/privacy",
        },
      ],
    },
  ] as FooterItem[],
};

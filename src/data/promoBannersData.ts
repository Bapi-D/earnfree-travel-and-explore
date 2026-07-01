export interface PromoBanner {
  id: string;
  scriptTitleLine1: string; // e.g. "Domestic"
  scriptTitleLine2: string; // e.g. "Tour Packages"
  subtitle: string; // e.g. "Explore North India · North East · South India"
  priceLabel: string; // e.g. "Starting from"
  price: number;
  ctaText: string;
  ctaHref: string;
  images: [string, string, string]; // main, bottom-left, bottom-right
  accent: string; // tailwind bg color class for the swoop + tag, e.g. "bg-[#0B3B66]"
}

export const promoBanners: PromoBanner[] = [
  {
    id: "domestic",
    scriptTitleLine1: "Domestic",
    scriptTitleLine2: "Tour Packages",
    subtitle: "Explore North India · North East · South India",
    priceLabel: "Starting from",
    price: 17500,
    ctaText: "Explore All Packages",
    ctaHref: "#packages",
    images: [
      "https://placehold.co/500x600/0B3B66/ffffff?text=Ladakh",
      "https://placehold.co/400x400/0B3B66/ffffff?text=Houseboat",
      "https://placehold.co/400x400/0B3B66/ffffff?text=Group",
    ],
    accent: "bg-[#0B3B66]",
  },
  {
    id: "international",
    scriptTitleLine1: "International",
    scriptTitleLine2: "Tour Packages",
    subtitle: "Bali · Thailand · Bhutan · Dubai",
    priceLabel: "Starting from",
    price: 32000,
    ctaText: "Explore All Packages",
    ctaHref: "#packages",
    images: [
      "https://placehold.co/500x600/7A1F2B/ffffff?text=Bali",
      "https://placehold.co/400x400/7A1F2B/ffffff?text=Thailand",
      "https://placehold.co/400x400/7A1F2B/ffffff?text=Bhutan",
    ],
    accent: "bg-[#7A1F2B]",
  },
  {
    id: "group",
    scriptTitleLine1: "Group",
    scriptTitleLine2: "Tour Packages",
    subtitle: "Travel together with like-minded explorers",
    priceLabel: "Starting from",
    price: 14000,
    ctaText: "Explore All Packages",
    ctaHref: "#packages",
    images: [
      "https://placehold.co/500x600/1F5C2E/ffffff?text=Group+Tour",
      "https://placehold.co/400x400/1F5C2E/ffffff?text=Trek",
      "https://placehold.co/400x400/1F5C2E/ffffff?text=Camp",
    ],
    accent: "bg-[#1F5C2E]",
  },
];
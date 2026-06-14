import hero from "@/assets/hero.jpg";
import bali from "@/assets/pkg-bali.jpg";
import nepal from "@/assets/pkg-nepal.jpg";
import thailand from "@/assets/pkg-thailand.jpg";
import goa from "@/assets/pkg-goa.jpg";

export interface HeroDestination {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  cards: {
    title: string;
    image: string;
  }[];
}

export const heroSlides: HeroDestination[] = [
  {
    id: 1,
    title: "BALI",
    subtitle: "Island of the Gods",
    description:
      "Experience breathtaking beaches, ancient temples, tropical forests, and unforgettable sunsets in one of the world's most loved destinations.",
    image: bali,
    cards: [
      {
        title: "Ubud",
        image: bali,
      },
      {
        title: "Thailand",
        image: thailand,
      },
      {
        title: "Nepal",
        image: nepal,
      },
    ],
  },

  {
    id: 2,
    title: "THAILAND",
    subtitle: "Land of Smiles",
    description:
      "Discover vibrant nightlife, crystal-clear waters, exotic islands, luxury resorts, and rich cultural heritage across Thailand.",
    image: thailand,
    cards: [
      {
        title: "Phuket",
        image: thailand,
      },
      {
        title: "Bali",
        image: bali,
      },
      {
        title: "Goa",
        image: goa,
      },
    ],
  },

  {
    id: 3,
    title: "NEPAL",
    subtitle: "Gateway to Himalayas",
    description:
      "Explore majestic mountain ranges, peaceful monasteries, thrilling adventures, and breathtaking Himalayan landscapes.",
    image: nepal,
    cards: [
      {
        title: "Kathmandu",
        image: nepal,
      },
      {
        title: "Thailand",
        image: thailand,
      },
      {
        title: "Goa",
        image: goa,
      },
    ],
  },

  {
    id: 4,
    title: "GOA",
    subtitle: "India's Beach Paradise",
    description:
      "Relax on golden beaches, enjoy vibrant nightlife, water sports, Portuguese architecture, and unforgettable coastal experiences.",
    image: goa,
    cards: [
      {
        title: "North Goa",
        image: goa,
      },
      {
        title: "Bali",
        image: bali,
      },
      {
        title: "Nepal",
        image: nepal,
      },
    ],
  },
];

export const AUTO_SLIDE_INTERVAL = 4500;
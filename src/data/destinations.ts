import bali from "@/assets/pkg-bali.jpg";
import dubai from "@/assets/pkg-dubai.jpg";
import kashmir from "@/assets/pkg-kashmir.jpg";
import nepal from "@/assets/pkg-nepal.jpg";
import thailand from "@/assets/pkg-thailand.jpg";
import goa from "@/assets/pkg-goa.jpg";

export type PublicDestinationCard = {
  name: string;
  region: string;
  vibe: string;
  description: string;
  image: string;
  category: "Domestic" | "International" | "Group" | "Honeymoon" | "Adventure";
  packageCount: number;
  minPrice: number;
  bestSeason: string;
  duration: string;
  highlights: string[];
};

export const PUBLIC_DESTINATIONS: PublicDestinationCard[] = [
  {
    name: "Bali",
    region: "Indonesia",
    vibe: "Honeymoon favorite",
    description: "Luxury villas, tropical beaches, and slow sunsets with a polished island feel.",
    image: bali,
    category: "Honeymoon",
    packageCount: 2,
    minPrice: 42999,
    bestSeason: "Apr - Oct",
    duration: "5N / 6D",
    highlights: ["Private villa", "Ubud + Seminyak", "Candle-lit dinner"],
  },
  {
    name: "Dubai",
    region: "UAE",
    vibe: "City luxe",
    description: "Skyline icons, desert evenings, and premium city breaks made effortless.",
    image: dubai,
    category: "International",
    packageCount: 1,
    minPrice: 54999,
    bestSeason: "Nov - Mar",
    duration: "4N / 5D",
    highlights: ["Burj Khalifa", "Desert safari", "Marina cruise"],
  },
  {
    name: "Thailand",
    region: "Southeast Asia",
    vibe: "Beach escape",
    description: "A mix of island relaxation, nightlife, and easy short-haul adventure.",
    image: thailand,
    category: "International",
    packageCount: 1,
    minPrice: 39999,
    bestSeason: "Nov - Apr",
    duration: "5N / 6D",
    highlights: ["Phi Phi islands", "James Bond tour", "Beach resort"],
  },
  {
    name: "Nepal",
    region: "Himalayan gateway",
    vibe: "Mountain culture",
    description: "Heritage cities, sunrise viewpoints, and the kind of trip that feels refreshing.",
    image: nepal,
    category: "International",
    packageCount: 3,
    minPrice: 8999,
    bestSeason: "Sep - May",
    duration: "1N / 2D",
    highlights: ["Pashupatinath visit", "City tour", "Hotel + breakfast"],
  },
  {
    name: "Kashmir",
    region: "India",
    vibe: "Scenic retreat",
    description: "Lake stays, green valleys, and postcard views for a softer, slower holiday.",
    image: kashmir,
    category: "Domestic",
    packageCount: 1,
    minPrice: 24999,
    bestSeason: "Mar - Nov",
    duration: "5N / 6D",
    highlights: ["Dal Lake shikara", "Gulmarg gondola", "Pahalgam"],
  },
  {
    name: "Goa",
    region: "India",
    vibe: "Beach classic",
    description: "A balanced short break with beaches, nightlife, and relaxed resort time.",
    image: goa,
    category: "Domestic",
    packageCount: 1,
    minPrice: 12999,
    bestSeason: "Oct - Mar",
    duration: "3N / 4D",
    highlights: ["Beachfront stay", "Cruise + dinner", "North & South Goa"],
  },
];

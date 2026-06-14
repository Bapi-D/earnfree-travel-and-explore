import bali from "@/assets/pkg-bali.jpg";
import dubai from "@/assets/pkg-dubai.jpg";
import nepal from "@/assets/pkg-nepal.jpg";
import thailand from "@/assets/pkg-thailand.jpg";
import kashmir from "@/assets/pkg-kashmir.jpg";
import goa from "@/assets/pkg-goa.jpg";

export type Package = {
  id: string;
  name: string;
  destination: string;
  category: "Domestic" | "International" | "Group" | "Honeymoon" | "Adventure";
  duration: string;
  price: number;
  rating: number;
  image: string;
  highlights: string[];
};

export const packages: Package[] = [
  {
    id: "nepal-1",
    name: "Kathmandu Express",
    destination: "Nepal",
    category: "International",
    duration: "1N / 2D",
    price: 8999,
    rating: 4.6,
    image: nepal,
    highlights: ["Pashupatinath visit", "City tour", "Hotel + breakfast"],
  },
  {
    id: "bali-1",
    name: "Bali Bliss Escape",
    destination: "Bali",
    category: "Honeymoon",
    duration: "5N / 6D",
    price: 42999,
    rating: 4.9,
    image: bali,
    highlights: ["Private villa", "Ubud + Seminyak", "Candle-lit dinner"],
  },
  {
    id: "dubai-1",
    name: "Dubai Luxury Tour",
    destination: "Dubai",
    category: "International",
    duration: "4N / 5D",
    price: 54999,
    rating: 4.8,
    image: dubai,
    highlights: ["Burj Khalifa", "Desert safari", "Marina cruise"],
  },
  {
    id: "thailand-1",
    name: "Phuket & Krabi",
    destination: "Thailand",
    category: "International",
    duration: "5N / 6D",
    price: 39999,
    rating: 4.7,
    image: thailand,
    highlights: ["Phi Phi islands", "James Bond tour", "Beach resort"],
  },
  {
    id: "kashmir-1",
    name: "Kashmir Paradise",
    destination: "Kashmir",
    category: "Domestic",
    duration: "5N / 6D",
    price: 24999,
    rating: 4.8,
    image: kashmir,
    highlights: ["Dal Lake shikara", "Gulmarg gondola", "Pahalgam"],
  },
  {
    id: "goa-1",
    name: "Goa Beach Breeze",
    destination: "Goa",
    category: "Domestic",
    duration: "3N / 4D",
    price: 12999,
    rating: 4.5,
    image: goa,
    highlights: ["Beachfront stay", "Cruise + dinner", "North & South Goa"],
  },
  {
    id: "thailand-grp",
    name: "Thailand Group Departure",
    destination: "Bangkok",
    category: "Group",
    duration: "6N / 7D",
    price: 34999,
    rating: 4.6,
    image: thailand,
    highlights: ["Group leader", "Veg meals", "All sightseeing"],
  },
  {
    id: "bali-grp",
    name: "Bali Group Tour",
    destination: "Bali",
    category: "Group",
    duration: "6N / 7D",
    price: 46999,
    rating: 4.7,
    image: bali,
    highlights: ["Fixed departures", "Group activities", "Curated itinerary"],
  },
];

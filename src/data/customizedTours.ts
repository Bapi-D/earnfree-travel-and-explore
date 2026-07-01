export interface DestinationCard {
  id: string;
  title: string;
  tagline: string;
  packageCount: string; // e.g. "22+ Packages"
  price: number;
  image: string;
  href: string;
}

const wm = (file: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(
    file
  ).replace(/%2C/g, ",")}?width=800`;

export const internationalTours: DestinationCard[] = [
  {
    id: "bali",
    title: "Bali",
    tagline: "The Island of Gods, exotic beaches and cultural heritage",
    packageCount: "22+ Packages",
    price: 39000,
    image: wm("Bali Pura Lempuyang Luhur.jpg"),
    href: "#packages",
  },
  {
    id: "thailand",
    title: "Thailand",
    tagline: "Land of smiles with tropical beaches",
    packageCount: "15+ Packages",
    price: 25000,
    image: wm("KohPhiPhi.JPG"),
    href: "#packages",
  },
  {
    id: "bhutan",
    title: "Bhutan",
    tagline: "The land of the Thunder Dragon",
    packageCount: "9+ Packages",
    price: 29000,
    image: wm("Taktshang.jpg"),
    href: "#packages",
  },
  {
    id: "vietnam",
    title: "Vietnam",
    tagline: "The land of the Ascending Dragon",
    packageCount: "16+ Packages",
    price: 35500,
    image: wm("The Golden Bridge, Ba Na Hills, Vietnam.jpg"),
    href: "#packages",
  },
];

export const indiaTours: DestinationCard[] = [
  {
    id: "kashmir",
    title: "Kashmir",
    tagline: "Paradise on Earth with valleys and lakes",
    packageCount: "12+ Packages",
    price: 22000,
    image: wm("Houseboat- Dal Lake, srinagar Kashmir.JPG"),
    href: "#packages",
  },
  {
    id: "kerala",
    title: "Kerala",
    tagline: "God's own country of backwaters and hills",
    packageCount: "18+ Packages",
    price: 18500,
    image: wm("Kerala houseboat.jpg"),
    href: "#packages",
  },
  {
    id: "rajasthan",
    title: "Rajasthan",
    tagline: "Land of Kings, forts and desert",
    packageCount: "20+ Packages",
    price: 16000,
    image: wm("Hawa Mahal Jaipur.jpg"),
    href: "#packages",
  },
  {
    id: "himachal",
    title: "Himachal",
    tagline: "Snow-capped peaks and hill stations",
    packageCount: "14+ Packages",
    price: 15500,
    image: wm("Mountains, Manali, Himachal Pradesh.jpg"),
    href: "#packages",
  },
];
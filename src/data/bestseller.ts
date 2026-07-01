export interface BestSellerPackage {
  id: string;
  titleLine1: string; // big bold word e.g. "BHUTAN"
  titleLine2: string; // subtitle e.g. "BIKE & BACKPACKING TRIP"
  name: string; // full package name shown below title
  route: string; // e.g. "Bagdogra to Bagdogra"
  duration: string; // e.g. "7N/8D"
  dateRange: string; // e.g. "Sep - May"
  price: number;
  image: string;
  tag?: string; // small top-right tag, e.g. "6N/7D"
}

export const bestSellerPackages: BestSellerPackage[] = [
  {
    id: "andaman-island-hopping",
    titleLine1: "ANDAMAN",
    titleLine2: "ISLAND HOPPING TRIP",
    name: "Andaman Island Hopping | 6 Days Andaman Tour",
    route: "Port Blair to Port Blair",
    duration: "5N/6D",
    dateRange: "Oct - May",
    price: 32000,
    image: "https://picsum.photos/seed/andaman-islands/800/1000",
  },
  {
    id: "bhutan-bike-backpacking",
    titleLine1: "BHUTAN",
    titleLine2: "BIKE & BACKPACKING TRIP",
    name: "Bhutan Bike and Backpacking | 8 Days Bhutan Bike Tour",
    route: "Bagdogra to Bagdogra",
    duration: "7N/8D",
    dateRange: "Sep - May",
    price: 45000,
    image: "https://picsum.photos/seed/bhutan-monastery/800/1000",
  },
  {
    id: "darjeeling-hills-heritage",
    titleLine1: "DARJEELING",
    titleLine2: "HILLS & HERITAGE TRIP",
    name: "Darjeeling Hills Escape | 5 Days Darjeeling Tour",
    route: "NJP to NJP",
    duration: "4N/5D",
    dateRange: "Oct - Apr",
    price: 18500,
    image: "https://picsum.photos/seed/darjeeling-hills/800/1000",
  },
  {
    id: "sikkim-mountain-explorer",
    titleLine1: "SIKKIM",
    titleLine2: "MOUNTAIN EXPLORER TRIP",
    name: "Sikkim Mountain Explorer | 6 Days Sikkim Tour",
    route: "Bagdogra to Bagdogra",
    duration: "5N/6D",
    dateRange: "Sep - May",
    price: 24500,
    image: "https://picsum.photos/seed/sikkim-mountains/800/1000",
  },
  {
    id: "thailand-full-moon-party",
    titleLine1: "THAILAND",
    titleLine2: "FULL MOON PARTY",
    name: "Thailand - Phuket with Full Moon Party",
    route: "Phuket to Phuket",
    duration: "6N/7D",
    dateRange: "Jul - Dec",
    price: 57000,
    image: "https://picsum.photos/seed/thailand-full-moon-party/800/1000",
    tag: "6N/7D",
  },
];
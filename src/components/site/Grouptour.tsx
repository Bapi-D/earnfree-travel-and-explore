import React, { useMemo, useState } from "react";
import { Calendar, Clock, MapPin } from "lucide-react";

type Category = "domestic" | "international";

interface TourCardData {
  id: string;
  category: Category;
  photo: string;
  cardTitle: string;
  route: string;
  duration: string;
  dateRange: string;
  price: string;
}

const TOURS: TourCardData[] = [
  {
    id: "kashmir",
    category: "domestic",
    photo:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Houseboat-_Dal_Lake,_srinagar_Kashmir.JPG?width=800",
    cardTitle: "Kashmir Great Lakes Group Tour - Srinagar, Gulmarg…",
    route: "Srinagar to Srinagar",
    duration: "5N/6D",
    dateRange: "May - Sep",
    price: "24,000",
  },
  {
    id: "ladakh",
    category: "domestic",
    photo:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Leh,_Ladakh,_India.jpg?width=800",
    cardTitle: "Ladakh Bike Expedition - Leh, Nubra, Pangong…",
    route: "Leh to Leh",
    duration: "6N/7D",
    dateRange: "Jun - Sep",
    price: "28,000",
  },
  {
    id: "thailand-full-moon",
    category: "international",
    photo:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Patong_beach,_Phuket,_Thailand.jpg?width=800",
    cardTitle: "Thailand - Phuket Krabi Group Tour with Full…",
    route: "Phuket to Phuket",
    duration: "6N/7D",
    dateRange: "Jul - Dec",
    price: "57,000",
  },
  {
    id: "bhutan",
    category: "international",
    photo:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Punakha_Dzong_BHUTAN.jpg?width=800",
    cardTitle: "Bhutan Tour with Phobjikha Valley - 8 Days…",
    route: "Bagdogra to Bagdogra",
    duration: "7N/8D",
    dateRange: "Oct - Oct",
    price: "45,000",
  },
  {
    id: "vietnam",
    category: "international",
    photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Ha_Long_Bay.jpg?width=800",
    cardTitle: "Vietnam Group Tour - Hanoi, Halong Bay, Ho Chi Minh…",
    route: "Hanoi to Ho Chi Minh",
    duration: "6N/7D",
    dateRange: "Oct - Mar",
    price: "52,000",
  },
  {
    id: "bali-gili",
    category: "international",
    photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Uluwatu_Temple.jpg?width=800",
    cardTitle: "Bali with Gili Island Group Tour - Ubud, Nus…",
    route: "Bali Airport to Bali Airport",
    duration: "7N/8D",
    dateRange: "Sep - Mar",
    price: "56,000",
  },
];

const TourCard: React.FC<{ tour: TourCardData }> = ({ tour }) => {
  return (
    <div className="group relative overflow-hidden rounded-[26px] bg-black shadow-lg aspect-[3/4]">
      <img
        src={tour.photo}
        alt={tour.cardTitle}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />

      <div className="absolute inset-x-0 bottom-0 space-y-2 p-3">
        <p className="text-[13px] font-semibold leading-snug text-white drop-shadow">
          {tour.cardTitle}
        </p>

        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-gray-800 shadow-sm">
          <MapPin className="h-3 w-3 text-blue-600" />
          {tour.route}
        </span>

        <div className="flex items-center gap-2 text-[11px] text-white/85 drop-shadow">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {tour.duration}
          </span>
          <span className="text-white/40">|</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {tour.dateRange}
          </span>
        </div>

        <p className="text-lg font-bold text-white drop-shadow">₹ {tour.price}</p>
      </div>
    </div>
  );
};

const GroupTour: React.FC = () => {
  const [category, setCategory] = useState<Category>("domestic");

  const visibleTours = useMemo(
    () => TOURS.filter((tour) => tour.category === category),
    [category]
  );

  return (
    <section className="bg-white pb-10 pt-6">
      <h1 className="pb-4 text-center text-3xl font-extrabold text-gray-900">
        Group Tour
      </h1>

      <div className="mx-auto mb-6 flex w-fit rounded-full bg-blue-50 p-1.5">
        {(["domestic", "international"] as Category[]).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`rounded-full px-8 py-2.5 text-sm font-semibold capitalize transition-colors ${
              category === cat
                ? "bg-blue-600 text-white shadow"
                : "bg-transparent text-gray-800 hover:bg-blue-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 px-3 sm:grid-cols-3 lg:grid-cols-4">
        {visibleTours.map((tour) => (
          <TourCard key={tour.id} tour={tour} />
        ))}
      </div>
    </section>
  );
};

export default GroupTour;

import { SectionHeader } from "./SectionHeader";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import kashmir from "@/assets/pkg-kashmir.jpg";
import nepal from "@/assets/pkg-nepal.jpg";

const destinations = [
  {
    name: "Paris",
    img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=70",
  },
  {
    name: "Taj Mahal",
    img: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=70",
  },
  {
    name: "Goa",
    img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=70",
  },
  { name: "Kashmir", img: kashmir },
  {
    name: "Jaipur",
    img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=70",
  },
  {
    name: "Kerala",
    img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=70",
  },
  {
    name: "Darjeeling",
    img: "https://images.unsplash.com/photo-1544634076-a90160ddf44c?auto=format&fit=crop&w=600&q=70",
  },
  {
    name: "Shimla",
    img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=70",
  },
  { name: "Manali", img: kashmir },
  {
    name: "Udaipur",
    img: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=70",
  },
  {
    name: "Varanasi",
    img: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=70",
  },
  { name: "Gangtok", img: nepal },
  {
    name: "Ooty",
    img: "https://images.unsplash.com/photo-1606298855672-3efb63017be8?auto=format&fit=crop&w=600&q=70",
  },
  {
    name: "Leh",
    img: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=600&q=70",
  },
  {
    name: "Andaman",
    img: "https://images.unsplash.com/photo-1586500036706-41963de24d8b?auto=format&fit=crop&w=600&q=70",
  },
  {
    name: "Shillong",
    img: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=600&q=70",
  },
  {
    name: "Dubai",
    img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=70",
  },
  {
    name: "Maldives",
    img: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=70",
  },
  {
    name: "Santorini",
    img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=70",
  },
  {
    name: "Bali",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=70",
  },
  {
    name: "Switzerland",
    img: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=600&q=70",
  },
  {
    name: "Singapore",
    img: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=600&q=70",
  },
  {
    name: "Bangkok",
    img: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=600&q=70",
  },
  {
    name: "Tokyo",
    img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=70",
  },
  {
    name: "London",
    img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=70",
  },
  {
    name: "New York",
    img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=70",
  },
];

function Capsule({ name, img }: { name: string; img: string }) {
  return (
    <div className="group relative shrink-0 mx-3 w-[180px] sm:w-[220px] h-[260px] sm:h-[300px] rounded-[110px] overflow-hidden cursor-pointer">
      {/* gradient border */}
      <div className="absolute inset-0 rounded-[110px] p-[2px] bg-gradient-to-br from-primary via-gold to-primary opacity-70 group-hover:opacity-100 transition-opacity">
        <div className="h-full w-full rounded-[108px] bg-charcoal overflow-hidden">
          <img
            src={img}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 rounded-[108px] bg-gradient-to-t from-charcoal/85 via-charcoal/20 to-transparent" />
          <div className="absolute bottom-6 inset-x-0 text-center px-4">
            <span className="font-display font-bold text-white text-base sm:text-lg tracking-wide drop-shadow-lg">
              {name}
            </span>
          </div>
        </div>
      </div>
      {/* glow on hover */}
      <div className="absolute -inset-2 rounded-[120px] bg-gradient-to-br from-primary/40 to-gold/40 blur-2xl opacity-0 group-hover:opacity-80 transition-opacity -z-10" />
    </div>
  );
}

export function MostDemanded() {
  const ref = useScrollReveal<HTMLDivElement>();
  // duplicate the list for seamless infinite scroll
  const list = [...destinations, ...destinations];

  return (
    <section
      id="most-demanded"
      className="section bg-gradient-to-b from-secondary via-background to-secondary overflow-hidden"
    >
      <div ref={ref}>
        <div data-reveal>
          <SectionHeader
            eyebrow="Bucket-list favourites"
            title="Most Demanded"
            highlight="Tourist Places"
            description="From the snowy peaks of Switzerland to the beaches of Bali — our travelers' most loved destinations, on an endless loop."
          />
        </div>

        <div data-reveal className="relative mt-4">
          {/* edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-secondary to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-secondary to-transparent z-10" />

          <div className="overflow-hidden">
            <div className="flex animate-marquee" style={{ width: "max-content" }}>
              {list.map((d, i) => (
                <Capsule key={`${d.name}-${i}`} name={d.name} img={d.img} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

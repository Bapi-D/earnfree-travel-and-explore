import { useEffect, useState } from "react";
import bus from "@/assets/bus.png";

type PreloaderProps = {
  onFinish: () => void;
};

export default function Preloader({ onFinish }: PreloaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let current = 0;

    const interval = setInterval(() => {
      current += 5;

      setProgress(Math.min(current, 100));

      if (current >= 100) {
        clearInterval(interval);

        setTimeout(() => {
          onFinish();
        }, 400);
      }
    }, 8);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800;900&display=swap');

        @keyframes roadMove {
          0% {
            transform: translateX(0);
          }

          100% {
            transform: translateX(-220px);
          }
        }

        @keyframes glowPulse {
          0% {
            opacity: 0.7;
            transform: scale(1);
          }

          50% {
            opacity: 1;
            transform: scale(1.05);
          }

          100% {
            opacity: 0.7;
            transform: scale(1);
          }
        }

        .animate-road {
          animation: roadMove 1s linear infinite;
          will-change: transform;
        }

        .animate-glow {
          animation: glowPulse 2s ease-in-out infinite;
          will-change: transform;
        }
      `}</style>

      <div className="fixed inset-0 z-[999999] overflow-hidden flex flex-col items-center justify-center bg-white">

        {/* BACKGROUND GLOW */}
        <div className="absolute top-[-120px] left-[-120px] w-[420px] h-[420px] rounded-full bg-yellow-300/30 blur-3xl animate-glow" />

        <div className="absolute bottom-[-160px] right-[-120px] w-[500px] h-[500px] rounded-full bg-orange-300/25 blur-3xl animate-glow" />

        {/* TITLE */}
        <div className="relative z-10 text-center mb-12">

  <h1
    className="text-4xl md:text-7xl font-extrabold tracking-wide leading-tight"
    style={{
      fontFamily: "'Montserrat', sans-serif",
    }}
  >
    <span className="text-zinc-900">
      Earnfree
    </span>{" "}

    <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 bg-clip-text text-transparent">
      Travel
    </span>

    <span className="text-zinc-700">
      {" "} & Explore
    </span>
  </h1>

</div>

        {/* ROAD AREA */}
        <div className="relative w-screen h-56 overflow-visible">

          {/* ROAD */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[120vw] h-24 rounded-xl bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-950 border border-zinc-700/40 shadow-[0_-12px_50px_rgba(0,0,0,0.25)] overflow-hidden">

            {/* ROAD SHINE */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/20" />

            {/* ROAD TEXTURE */}
            <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:5px_5px]" />

            {/* ROAD LINES */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 flex animate-road w-max">
              {Array.from({ length: 70 }).map((_, i) => (
                <div
                  key={i}
                  className="w-24 h-[5px] rounded-full mx-8 bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-500 shadow-[0_0_14px_rgba(255,180,0,0.9)]"
                />
              ))}
            </div>
          </div>

          {/* BUS */}
          <img
            src={bus}
            alt="Bus"
            className="absolute bottom-[118px] w-56 md:w-80 h-auto drop-shadow-[0_14px_24px_rgba(0,0,0,0.35)] z-20"
            style={{
              left: `calc(${progress}% - 320px)`,
              transform: "scaleX(-1)",
              transition: "left 0.08s linear",
              willChange: "left",
            }}
          />
        </div>

        {/* LOADING TEXT */}
        <div
          className="mt-4 text-zinc-700 text-sm md:text-lg tracking-[0.45em] uppercase font-bold"
          style={{
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          Loading Journey...
        </div>

        {/* PROGRESS BAR */}
        <div className="mt-8 w-[85%] max-w-2xl relative z-10">

          <div className="flex justify-between text-sm text-zinc-700 mb-3 font-semibold">
            <span>Opening Website</span>
            <span>{progress}%</span>
          </div>

          {/* BAR BACKGROUND */}
          <div className="w-full h-6 rounded-full bg-zinc-200 overflow-hidden border border-zinc-300 shadow-inner relative">

            {/* PROGRESS FILL */}
            <div
              className="h-full rounded-full shadow-[0_0_24px_rgba(255,180,0,0.9)] transition-all duration-75"
              style={{
                width: `${progress}%`,
                background:
                  "linear-gradient(90deg,#fde047 0%,#facc15 20%,#fb923c 55%,#f59e0b 80%,#fde047 100%)",
              }}
            />

            {/* SHINE EFFECT */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </>
  );
}
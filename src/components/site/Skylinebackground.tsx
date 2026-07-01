export function SkylineBackground({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 300"
      preserveAspectRatio="xMidYMax slice"
      className={`absolute inset-0 h-full w-full pointer-events-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Clouds */}
      <g fill="none" stroke="#BFD7EA" strokeWidth="2" opacity="0.7">
        <path d="M40 40 a10 10 0 1 1 20 -2 a12 12 0 1 1 14 14 h-34 a10 10 0 0 1 0 -12z" />
        <path d="M180 24 a8 8 0 1 1 16 -2 a10 10 0 1 1 11 11 h-27 a8 8 0 0 1 0 -9z" />
        <path d="M300 50 a9 9 0 1 1 18 -2 a11 11 0 1 1 12 12 h-30 a9 9 0 0 1 0 -10z" />
      </g>

      {/* Skyline silhouette (line art) */}
      <g fill="none" stroke="#BFD7EA" strokeWidth="1.5" opacity="0.9">
        {/* clock tower */}
        <rect x="10" y="150" width="26" height="110" />
        <circle cx="23" cy="140" r="12" />
        <line x1="23" y1="128" x2="23" y2="110" />
        <rect x="18" y="100" width="10" height="10" />

        {/* low building */}
        <rect x="45" y="190" width="40" height="70" />
        <line x1="55" y1="200" x2="55" y2="255" />
        <line x1="65" y1="200" x2="65" y2="255" />
        <line x1="75" y1="200" x2="75" y2="255" />

        {/* minaret */}
        <line x1="110" y1="260" x2="110" y2="150" />
        <path d="M100 150 q10 -30 20 0 z" />
        <circle cx="110" cy="145" r="3" />

        {/* dome building */}
        <rect x="140" y="210" width="55" height="50" />
        <path d="M140 210 q27.5 -45 55 0 z" />
        <circle cx="167.5" cy="158" r="3" />

        {/* tall tower */}
        <rect x="210" y="120" width="22" height="140" />
        <path d="M210 120 l11 -20 l11 20 z" />

        {/* mid building */}
        <rect x="245" y="175" width="45" height="85" />
        <line x1="255" y1="185" x2="255" y2="255" />
        <line x1="267" y1="185" x2="267" y2="255" />
        <line x1="279" y1="185" x2="279" y2="255" />

        {/* second minaret pair */}
        <line x1="305" y1="260" x2="305" y2="160" />
        <path d="M296 160 q9 -26 18 0 z" />
        <line x1="330" y1="260" x2="330" y2="170" />
        <path d="M322 170 q8 -24 16 0 z" />

        {/* wide low building */}
        <rect x="350" y="200" width="60" height="60" />
        <line x1="362" y1="210" x2="362" y2="255" />
        <line x1="374" y1="210" x2="374" y2="255" />
        <line x1="386" y1="210" x2="386" y2="255" />
        <line x1="398" y1="210" x2="398" y2="255" />

        {/* clock tower 2 */}
        <rect x="425" y="140" width="24" height="120" />
        <circle cx="437" cy="130" r="11" />
        <line x1="437" y1="119" x2="437" y2="105" />

        {/* dome building 2 */}
        <rect x="460" y="205" width="50" height="55" />
        <path d="M460 205 q25 -40 50 0 z" />

        {/* final low buildings */}
        <rect x="520" y="215" width="70" height="45" />
        <line x1="532" y1="225" x2="532" y2="255" />
        <line x1="544" y1="225" x2="544" y2="255" />
        <line x1="556" y1="225" x2="556" y2="255" />
        <line x1="568" y1="225" x2="568" y2="255" />
      </g>
    </svg>
  );
}
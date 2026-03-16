type PartnerLogo = {
  id: number;
  name: string;
  source: string;
  website: string;
};

const PARTNER_LOGOS: PartnerLogo[] = [
  {
    id: 1,
    name: "MoEFCC",
    source: "/partners/moefcc-logo.png",
    website: "https://moef.gov.in/",
  },
  {
    id: 2,
    name: "UIDAI",
    source: "/partners/uidai-logo.svg",
    website: "https://www.uidai.gov.in/",
  },
  {
    id: 3,
    name: "Aadhaar",
    source: "/partners/aadhaar-logo.svg",
    website: "https://www.uidai.gov.in/",
  },
  {
    id: 4,
    name: "MyGov",
    source: "/partners/mygov-logo.png",
    website: "https://www.mygov.in/",
  },
  {
    id: 5,
    name: "NSWS",
    source: "/partners/nsws-logo.png",
    website: "https://www.nsws.gov.in/",
  },
  {
    id: 6,
    name: "National Portal of India",
    source: "/partners/npi-logo.svg",
    website: "https://www.india.gov.in/",
  },
  {
    id: 7,
    name: "MyScheme",
    source: "/partners/myscheme-logo.svg",
    website: "https://www.india.gov.in/",
  },
  {
    id: 8,
    name: "NIC",
    source: "/partners/nic-logo.png",
    website: "https://www.nic.gov.in/",
  },
];

function PartnerCard({ logo }: { logo: PartnerLogo }) {
  return (
    <a
      href={logo.website}
      target="_blank"
      rel="noreferrer"
      className="flex-shrink-0 bg-white border border-gray-100 rounded-lg shadow-sm px-5 py-3 mx-3 h-20 min-w-[220px] max-w-[260px] flex items-center justify-center hover:shadow-md hover:border-[#1A5C1A]/30 transition-all duration-300"
      aria-label={logo.name}
      title={logo.name}
    >
      <img
        src={logo.source}
        alt={logo.name}
        className="max-h-10 w-auto object-contain"
        loading="lazy"
        draggable={false}
      />
    </a>
  );
}

function MarqueeRow({ items, speed = 40, reverse = false }: { items: PartnerLogo[]; speed?: number; reverse?: boolean }) {
  const looped = [...items, ...items, ...items];
  const totalWidth = looped.length * 250;

  return (
    <div className="overflow-hidden w-full" style={{ maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)" }}>
      <div
        className="flex hover:[animation-play-state:paused]"
        style={{
          animation: `marquee-${reverse ? "rev" : "fwd"} ${speed}s linear infinite`,
          width: `${totalWidth}px`,
        }}
      >
        {looped.map((logo, i) => (
          <PartnerCard key={`${logo.id}-${i}`} logo={logo} />
        ))}
      </div>
    </div>
  );
}

export function PartnersSection() {
  const firstRow = PARTNER_LOGOS.slice(0, 4);
  const secondRow = PARTNER_LOGOS.slice(4);

  return (
    <section className="relative bg-[#E2ECE2] border-t border-b border-[#B8D2B9] py-10 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(#1A5C1A 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />

      <div className="max-w-7xl mx-auto px-6 mb-7">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 rounded-full bg-[#1A5C1A]" />
          <div>
            <h2 className="font-black text-[#1A5C1A]" style={{ fontSize: 20 }}>
              Partners &amp; Integrations
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Official logos from integrated Government of India organizations
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <MarqueeRow items={firstRow} speed={34} reverse={false} />
      </div>

      <MarqueeRow items={secondRow} speed={46} reverse={true} />

      <style>{`
        @keyframes marquee-fwd {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 3)); }
        }
        @keyframes marquee-rev {
          0% { transform: translateX(calc(-100% / 3)); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}

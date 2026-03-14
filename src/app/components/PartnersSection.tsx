/**
 * PartnersSection – infinite auto-scroll marquee of partner logos.
 * Partners shown: all Government Ministry partners + digital platform partners.
 * Two rows scrolling in opposite directions for a dynamic feel.
 */

/* ── Ashoka Emblem SVG (simplified national emblem of India) ── */
function AshokaEmblem({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden>
      {/* Base plinth */}
      <rect x="14" y="52" width="36" height="5" rx="2" fill="#7B6B3A" />
      {/* Abacus */}
      <rect x="18" y="45" width="28" height="7" rx="1.5" fill="#9B8B4A" />
      {/* Dharma Chakra on abacus */}
      <circle cx="32" cy="48" r="3.5" fill="none" stroke="#4A3F1E" strokeWidth="1.2" />
      <circle cx="32" cy="48" r="1" fill="#4A3F1E" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
        <line
          key={i}
          x1={32 + 1.2 * Math.cos((a * Math.PI) / 180)}
          y1={48 + 1.2 * Math.sin((a * Math.PI) / 180)}
          x2={32 + 3.2 * Math.cos((a * Math.PI) / 180)}
          y2={48 + 3.2 * Math.sin((a * Math.PI) / 180)}
          stroke="#4A3F1E" strokeWidth="0.8"
        />
      ))}
      {/* Lions body (simplified) */}
      <ellipse cx="32" cy="34" rx="10" ry="8" fill="#C8A84B" />
      {/* Left lion */}
      <ellipse cx="22" cy="33" rx="6" ry="7" fill="#C8A84B" />
      <circle cx="20" cy="28" r="4" fill="#C8A84B" />
      {/* Right lion */}
      <ellipse cx="42" cy="33" rx="6" ry="7" fill="#C8A84B" />
      <circle cx="44" cy="28" r="4" fill="#C8A84B" />
      {/* Front lion */}
      <ellipse cx="32" cy="31" rx="7" ry="8" fill="#D4B05A" />
      <circle cx="32" cy="24" r="5" fill="#D4B05A" />
      {/* Mane detail */}
      <circle cx="32" cy="24" r="5" fill="none" stroke="#B8952A" strokeWidth="1" />
      {/* Eyes */}
      <circle cx="30" cy="23" r="0.8" fill="#333" />
      <circle cx="34" cy="23" r="0.8" fill="#333" />
      {/* Wheel above lions */}
      <circle cx="32" cy="16" r="5" fill="none" stroke="#B8952A" strokeWidth="1.5" />
      <circle cx="32" cy="16" r="1.2" fill="#B8952A" />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a, i) => (
        <line
          key={i}
          x1={32 + 1.5 * Math.cos((a * Math.PI) / 180)}
          y1={16 + 1.5 * Math.sin((a * Math.PI) / 180)}
          x2={32 + 4.5 * Math.cos((a * Math.PI) / 180)}
          y2={16 + 4.5 * Math.sin((a * Math.PI) / 180)}
          stroke="#B8952A" strokeWidth="0.9"
        />
      ))}
    </svg>
  );
}

/* ── Individual partner logo definitions ── */
function AadhaarLogo() {
  return (
    <div className="flex items-center gap-1.5">
      <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
        {/* Fingerprint rings */}
        <circle cx="32" cy="32" r="28" fill="#FFF5E6" />
        {[26, 20, 14, 8].map((r, i) => (
          <path key={i} d={`M${32 - r},32 a${r},${r} 0 0,1 ${r * 2},0`}
            fill="none" stroke={i === 0 ? "#FF6B00" : "#E55A00"}
            strokeWidth="2.2" strokeLinecap="round" />
        ))}
        <circle cx="32" cy="32" r="4" fill="#FF6B00" />
        {/* Bottom rectangle */}
        <rect x="20" y="50" width="24" height="6" rx="3" fill="#1A5C1A" />
      </svg>
      <div>
        <p className="text-[11px] font-black text-[#1A1A1A] tracking-wide">AADHAAR</p>
        <p className="text-[8px] text-gray-400 leading-tight">Unique Identification</p>
      </div>
    </div>
  );
}

function BharatkoshLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#003087] to-[#0055C8] flex items-center justify-center">
        <span className="text-white font-black" style={{ fontSize: 18 }}>B</span>
      </div>
      <div>
        <p className="font-black" style={{ color: "#003087", fontSize: 13 }}>Bharat<span style={{ color: "#FF6B00" }}>kosh</span></p>
        <p className="text-[8px] text-gray-400 leading-tight">Govt. of India Resource Portal</p>
      </div>
    </div>
  );
}

function DotLogo() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {["#E63946", "#F4A261", "#2A9D8F"].map((c, i) => (
          <div key={i} className="w-3 h-10 rounded-sm flex items-center justify-center"
            style={{ background: c }}>
            <span className="text-white font-black rotate-0" style={{ fontSize: 11 }}>
              {["D", "O", "T"][i]}
            </span>
          </div>
        ))}
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-700">Dept. of</p>
        <p className="text-[10px] font-bold text-gray-700">Telecom</p>
      </div>
    </div>
  );
}

function QciLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-9 h-9">
        <svg viewBox="0 0 40 40" className="w-full h-full">
          <circle cx="20" cy="20" r="18" fill="#003087" />
          <text x="20" y="26" textAnchor="middle" fill="white" fontSize="18" fontWeight="900">Q</text>
          <circle cx="20" cy="20" r="18" fill="none" stroke="#FF6B00" strokeWidth="2" />
        </svg>
      </div>
      <div>
        <p className="text-[10px] font-black text-[#003087]">Quality Council</p>
        <p className="text-[10px] font-black text-[#003087]">of India</p>
        <p className="text-[7.5px] text-gray-400">Creating an Ecosystem for Quality</p>
      </div>
    </div>
  );
}

function NswsLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-9 h-9 bg-[#1A5C1A] rounded flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 8l-3 4 3 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        </svg>
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-800">National Single</p>
        <p className="text-[10px] font-black text-gray-800">Window System</p>
      </div>
    </div>
  );
}

function GatiShaktiLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FFB347] flex items-center justify-center shadow">
        <span className="text-white font-black" style={{ fontSize: 13 }}>PM</span>
      </div>
      <div>
        <p className="text-[9px] font-semibold text-gray-500">PM</p>
        <p className="font-black" style={{ fontSize: 12 }}>
          <span style={{ color: "#003087" }}>Gati</span>
          <span style={{ color: "#FF6B00" }}>Shakti</span>
        </p>
        <p className="text-[7px] text-gray-400">National Master Plan</p>
      </div>
    </div>
  );
}

function NicLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 rounded-full border-2 border-[#FF6B00] flex items-center justify-center">
        <svg viewBox="0 0 40 40" className="w-8 h-8">
          {/* Sun-like emblem */}
          <circle cx="20" cy="20" r="8" fill="#FF6B00" />
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a, i) => (
            <line key={i}
              x1={20 + 10 * Math.cos(a * Math.PI / 180)}
              y1={20 + 10 * Math.sin(a * Math.PI / 180)}
              x2={20 + 14 * Math.cos(a * Math.PI / 180)}
              y2={20 + 14 * Math.sin(a * Math.PI / 180)}
              stroke="#FF6B00" strokeWidth={i % 3 === 0 ? "2" : "1"} strokeLinecap="round"
            />
          ))}
          <circle cx="20" cy="20" r="4" fill="white" />
        </svg>
      </div>
      <div>
        <p className="text-[11px] font-black text-[#003087]">NIC</p>
        <p className="text-[7.5px] text-gray-400">Nat. Informatics Centre</p>
      </div>
    </div>
  );
}

function Ideas4LifeLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-9 h-9 bg-[#003087] rounded-full flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
          <circle cx="12" cy="8" r="4" fill="none" stroke="white" strokeWidth="2" />
          <path d="M12 12v4M9 18h6" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <p className="font-black" style={{ fontSize: 12, color: "#003087" }}>Ideas</p>
        <p className="font-black" style={{ fontSize: 12, color: "#1A5C1A" }}>4Life</p>
      </div>
    </div>
  );
}

/* ── Ministry card with Ashoka emblem ── */
function MinistryCard({ name, sub = "Government of India" }: { name: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3">
      <AshokaEmblem size={42} />
      <div>
        <p className="text-[11px] font-bold text-gray-800 leading-tight max-w-[110px]">{name}</p>
        <p className="text-[9px] text-gray-500 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

/* ── All partners list ── */
const PARTNERS: { id: number; node: React.ReactNode }[] = [
  { id: 1,  node: <MinistryCard name="Ministry of Coal" /> },
  { id: 2,  node: <MinistryCard name="Ministry of Commerce and Industry" /> },
  { id: 3,  node: <MinistryCard name="Ministry of Petroleum and Natural Gas" /> },
  { id: 4,  node: <MinistryCard name="Ministry of Mines" /> },
  { id: 5,  node: <MinistryCard name="Ministry of Environment, Forest and Climate Change" /> },
  { id: 6,  node: <MinistryCard name="Ministry of Water Resources" /> },
  { id: 7,  node: <BharatkoshLogo /> },
  { id: 8,  node: <DotLogo /> },
  { id: 9,  node: <AadhaarLogo /> },
  { id: 10, node: <Ideas4LifeLogo /> },
  { id: 11, node: <QciLogo /> },
  { id: 12, node: <NswsLogo /> },
  { id: 13, node: <GatiShaktiLogo /> },
  { id: 14, node: <NicLogo /> },
];

/* ── Card wrapper ── */
function PartnerCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-shrink-0 bg-white border border-gray-100 rounded-lg shadow-sm px-5 py-3
                    flex items-center gap-3 mx-3 h-20 min-w-[190px] max-w-[230px]
                    hover:shadow-md hover:border-[#1A5C1A]/30 transition-shadow duration-300">
      {children}
    </div>
  );
}

/* ── Marquee row ── */
function MarqueeRow({ speed = 40, reverse = false }: { speed?: number; reverse?: boolean }) {
  // Triple the list for seamless loop
  const items = [...PARTNERS, ...PARTNERS, ...PARTNERS];
  const totalWidth = items.length * 210; // approx px per card

  return (
    <div className="overflow-hidden w-full" style={{ maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)" }}>
      <div
        className="flex"
        style={{
          animation: `marquee-${reverse ? "rev" : "fwd"} ${speed}s linear infinite`,
          width: `${totalWidth}px`,
        }}
      >
        {items.map((p, i) => (
          <PartnerCard key={`${p.id}-${i}`}>{p.node}</PartnerCard>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Main Export
══════════════════════════════════════════ */
export function PartnersSection() {
  return (
    <section className="relative bg-[#F0F7F0] border-t border-b border-[#C8E6C9] py-10 overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(#1A5C1A 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      {/* Heading */}
      <div className="max-w-7xl mx-auto px-6 mb-7">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 rounded-full bg-[#1A5C1A]" />
          <div>
            <h2 className="font-black text-[#1A5C1A]" style={{ fontSize: 20 }}>
              Partners &amp; Integrations
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Integrated with key Government of India ministries and digital platforms
            </p>
          </div>
        </div>
      </div>

      {/* Row 1 — forward */}
      <div className="mb-4">
        <MarqueeRow speed={38} reverse={false} />
      </div>

      {/* Row 2 — reverse, slightly faster */}
      <MarqueeRow speed={50} reverse={true} />

      {/* Inline keyframes */}
      <style>{`
        @keyframes marquee-fwd {
          0%   { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 3)); }
        }
        @keyframes marquee-rev {
          0%   { transform: translateX(calc(-100% / 3)); }
          100% { transform: translateX(0); }
        }
        .flex:has(.marquee-pause):hover { animation-play-state: paused; }
      `}</style>
    </section>
  );
}

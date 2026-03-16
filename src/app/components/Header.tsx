import { Link } from "react-router";

/* ── Ashoka Wheel (Dharma Chakra) SVG ── */
function DharmaChakra({ size = 54 }: { size?: number }) {
  const spokes = Array.from({ length: 24 }, (_, i) => i * 15);
  const r = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle cx={r} cy={r} r={r - 1} fill="#003087" />
      <circle cx={r} cy={r} r={r - 4} fill="none" stroke="#3b82f6" strokeWidth="2.5" />
      <circle cx={r} cy={r} r={r * 0.22} fill="#3b82f6" />
      {spokes.map((a) => {
        const rad = (a * Math.PI) / 180;
        const inner = r * 0.25;
        const outer = r * 0.75;
        return (
          <line key={a}
            x1={r + inner * Math.cos(rad)} y1={r + inner * Math.sin(rad)}
            x2={r + outer * Math.cos(rad)} y2={r + outer * Math.sin(rad)}
            stroke="#93c5fd" strokeWidth="1.2" />
        );
      })}
    </svg>
  );
}

/* ── LiFE Badge ── */
function LifeBadge() {
  return (
    <div className="flex items-center gap-1.5 border border-green-200 rounded-lg px-3 py-1.5 bg-green-50">
      <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center">
        <span className="text-white text-[8px] font-black">LiFE</span>
      </div>
      <div>
        <p className="text-[9px] font-black text-green-800 leading-none">Lifestyle</p>
        <p className="text-[7px] text-green-600 leading-none">for Environment</p>
      </div>
    </div>
  );
}

/* ── Azadi Badge ── */
function AzadiBadge() {
  return (
    <div className="flex items-center gap-1.5 border border-amber-200 rounded-lg px-3 py-1.5 bg-amber-50">
      <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center">
        <span className="text-white text-[7px] font-black">75</span>
      </div>
      <div>
        <p className="text-[9px] font-black text-amber-800 leading-none">आज़ादी का</p>
        <p className="text-[7px] text-amber-700 leading-none">अमृत महोत्सव</p>
      </div>
    </div>
  );
}

/* ── Parivesh SVG Logo ── */
function PariveshLogoSVG({ size = 56 }: { size?: number }) {
  const segs = [
    "#22C55E","#06B6D4","#60A5FA","#818CF8","#FBBF24","#F87171","#FB923C",
  ];
  const segAngle = 360 / segs.length;
  const r = size / 2;
  const OR = r * 0.9;
  const IR = r * 0.5;
  function polarToXY(deg: number, radius: number) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: r + radius * Math.cos(rad), y: r + radius * Math.sin(rad) };
  }
  function segPath(start: number, end: number) {
    const s1 = polarToXY(start + 2, OR), e1 = polarToXY(end - 2, OR);
    const s2 = polarToXY(end - 2, IR), e2 = polarToXY(start + 2, IR);
    const lg = end - start > 180 ? 1 : 0;
    return `M ${s1.x} ${s1.y} A ${OR} ${OR} 0 ${lg} 1 ${e1.x} ${e1.y} L ${s2.x} ${s2.y} A ${IR} ${IR} 0 ${lg} 0 ${e2.x} ${e2.y} Z`;
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="PARIVESH logo">
      {segs.map((c, i) => (
        <path key={i} d={segPath(i * segAngle, (i + 1) * segAngle)} fill={c} />
      ))}
      <circle cx={r} cy={r} r={IR - 2} fill="white" />
      <text x={r} y={r + 3} textAnchor="middle" fill="#030352" fontSize={size * 0.13} fontWeight="900" fontFamily="sans-serif">
        परिवेश
      </text>
    </svg>
  );
}

export function Header() {
  return (
    <>
      {/* ── Government of India Top Bar ── */}
      <div className="bg-[#e8f1fb]" style={{ borderTop: "1px solid #cfe0f5", borderBottom: "1px solid #cfe0f5" }}>
        <div className="max-w-[1400px] mx-auto px-4 py-1.5 flex items-center justify-start">
          <div className="flex items-center gap-2.5">
            <div className="relative overflow-hidden border border-[#c0d2e9]" style={{ width: 30, height: 18 }} aria-hidden>
              <div className="h-1/3 bg-[#FF9933]" />
              <div className="h-1/3 bg-white flex items-center justify-center">
                <div className="w-[6px] h-[6px] rounded-full border border-[#000080]" />
              </div>
              <div className="h-1/3 bg-[#138808]" />
            </div>
            <p className="text-[13px] sm:text-[14px] text-[#0f172a] leading-none" style={{ fontFamily: "Arial, sans-serif" }}>
              <span className="font-bold">भारत सरकार</span>
              <span className="mx-2 text-[#64748b] font-normal">|</span>
              <span className="font-medium">Government of India</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Ministry Header ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Left: Logo + Ministry Branding */}
          <Link to="/" className="flex items-center gap-4 group">
            <div className="relative flex-shrink-0">
              <PariveshLogoSVG size={62} />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-[#1A5C1A]" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                  PARI<span style={{ color: "#FF6B00" }}>V</span>ESH
                </span>
                <span className="text-xs font-bold text-[#FF6B00] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">3.0</span>
              </div>
              <p className="text-[10px] font-bold text-[#1A5C1A] leading-tight mt-0.5">
                पर्यावरण, वन और जलवायु परिवर्तन मंत्रालय
              </p>
              <p className="text-[10px] text-gray-600 leading-tight">
                Ministry of Environment, Forest and Climate Change
              </p>
            </div>
          </Link>

          {/* Right: Partner Badges + Emblem */}
          <div className="hidden md:flex items-center gap-3">
            <LifeBadge />
            <AzadiBadge />
            <DharmaChakra size={52} />
          </div>
        </div>
      </div>
    </>
  );
}
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
      <text x={r} y={r + 3} textAnchor="middle" fill="#1A5C1A" fontSize={size * 0.13} fontWeight="900" fontFamily="sans-serif">
        परिवेश
      </text>
    </svg>
  );
}

export function Header() {
  return (
    <>
      {/* ── Government of India Top Bar ── */}
      <div className="bg-[#003087] text-white" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="max-w-[1400px] mx-auto px-4 py-1.5 flex items-center justify-between">
          {/* Left: India flag + GOI text */}
          <div className="flex items-center gap-2.5">
            {/* Tricolour flag pill */}
            <div className="flex flex-col overflow-hidden rounded-sm" style={{ width: 22, height: 15 }}>
              <div className="flex-1 bg-orange-500" />
              <div className="flex-1 bg-white flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#003087]" />
              </div>
              <div className="flex-1 bg-green-600" />
            </div>
            <span className="text-[11px] font-semibold tracking-wide">
              <span className="opacity-80 text-amber-200">भारत</span>
              <span className="mx-1.5 opacity-40">|</span>
              <span>Government of India</span>
            </span>
          </div>

          {/* Right: Accessibility + Language */}
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-medium opacity-60 uppercase tracking-wider hidden sm:inline">Accessibility</span>
            <div className="flex items-center gap-0.5">
              <button className="w-6 h-6 flex items-center justify-center text-[10px] font-bold hover:bg-white/10 rounded transition-colors" title="Decrease font size">A-</button>
              <button className="w-6 h-6 flex items-center justify-center text-[11px] font-bold hover:bg-white/10 rounded transition-colors border border-white/20" title="Default font size">A</button>
              <button className="w-7 h-6 flex items-center justify-center text-[13px] font-bold hover:bg-white/10 rounded transition-colors" title="Increase font size">A+</button>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <button className="flex items-center gap-1 text-[11px] font-medium hover:bg-white/10 px-2 py-0.5 rounded transition-colors" title="Switch language">
              🌐 English ▾
            </button>
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
                <span className="text-xs text-gray-400 font-medium hidden sm:inline">(CPC GREEN)</span>
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
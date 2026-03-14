import { Header } from "../components/Header";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { PartnersSection } from "../components/PartnersSection";
import { PariveshWheelWatermark } from "../components/PariveshWatermark";
import {
  ArrowRight, FileCheck, Users, MapPin, FileText, Search,
  CheckCircle, Clock, Shield, Globe, Leaf,
  Plus, Bell, BookOpen, HelpCircle,
  Download, ChevronRight, ChevronLeft, Zap, Sparkles, ExternalLink, TreePine, Workflow,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState, useRef, useCallback } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;
const GREEN  = "#1A5C1A";
const ORANGE = "#FF6B00";
const BLUE   = "#003087";

function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActive(true); }, { threshold: 0.3 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!active) return;
    let v = 0; const step = target / (duration / 16);
    const id = setInterval(() => { v += step; if (v >= target) { setCount(target); clearInterval(id); } else setCount(Math.floor(v)); }, 16);
    return () => clearInterval(id);
  }, [active, target, duration]);
  return { count, ref };
}

function StatCard({ value, suffix, label, icon: Icon, color }: {
  value: number; suffix: string; label: string; icon: React.ElementType; color: string;
}) {
  const { count, ref } = useCountUp(value);
  return (
    <motion.div ref={ref} className="flex flex-col items-center py-8 px-4 group cursor-default"
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.5, ease: EASE }}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
        style={{ background: color + "15" }}>
        <Icon style={{ width: 20, height: 20, color }} />
      </div>
      <p className="font-black text-gray-900 mb-0.5" style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "2.1rem", lineHeight: 1 }}>
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-xs text-gray-500 font-medium text-center">{label}</p>
    </motion.div>
  );
}

const TAG_MAP: Record<string, { bg: string; text: string }> = {
  NEW:    { bg: "#dcfce7", text: "#16a34a" },
  UPDATE: { bg: "#e0f2fe", text: "#0284c7" },
  LAUNCH: { bg: "#ede9fe", text: "#7c3aed" },
  POLICY: { bg: "#fef9c3", text: "#ca8a04" },
  ALERT:  { bg: "#fee2e2", text: "#dc2626" },
};
function NewsTag({ tag }: { tag: string }) {
  const s = TAG_MAP[tag] ?? { bg: "#f3f4f6", text: "#6b7280" };
  return (
    <span className="flex-shrink-0 text-[9px] font-black px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.text }}>{tag}</span>
  );
}

function FaqItem({ q, a, open, toggle }: { q: string; a: string; open: boolean; toggle: () => void }) {
  return (
    <div className="overflow-hidden rounded-xl border transition-all duration-200"
      style={{ borderColor: open ? GREEN + "40" : "#e5e7eb", background: open ? "#f0faf0" : "#ffffff" }}>
      <button onClick={toggle} className="w-full flex items-center justify-between px-5 py-4 text-left gap-4">
        <span className="text-sm font-semibold" style={{ color: open ? GREEN : "#1f2937" }}>{q}</span>
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: open ? GREEN : "#f3f4f6" }}>
          <Plus style={{ width: 14, height: 14, color: open ? "white" : "#6b7280" }} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="a" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: EASE }}>
            <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const SLIDES = [
  {
    badge: "NEXT-GENERATION CLEARANCE PORTAL",
    titleLines: ["PARIVESH", "3.0"],
    highlight: "3.0",
    sub: "Pro-Active and Responsive Facilitation by Interactive Virtuous Environmental Single-Window Hub",
    cta1: { label: "Apply for Clearance", link: "/login" },
    cta2: { label: "Explore Portal", link: "/about" },
    accent: ORANGE,
    bg: "linear-gradient(135deg, #021a02 0%, #0a2e0a 45%, #001a4a 100%)",
  },
  {
    badge: "ENVIRONMENTAL CLEARANCE - EIA 2006",
    titleLines: ["ENVIRONMENTAL", "CLEARANCE"],
    highlight: "CLEARANCE",
    sub: "End-to-end digital processing for Category A, B1, and B2 environmental impact assessment projects",
    cta1: { label: "Start EC Application", link: "/clearance/environmental" },
    cta2: { label: "Know More", link: "/about" },
    accent: "#22C55E",
    bg: "linear-gradient(135deg, #021a02 0%, #063a1f 50%, #0a5c1a 100%)",
  },
  {
    badge: "FOREST CONSERVATION ACT 1980",
    titleLines: ["FOREST", "CLEARANCE"],
    highlight: "CLEARANCE",
    sub: "Streamlined diversion proposals under FCA, integrating state-level approvals with MoEFCC review",
    cta1: { label: "Apply for FC", link: "/clearance/forest" },
    cta2: { label: "View Guidelines", link: "/downloads" },
    accent: "#4ade80",
    bg: "linear-gradient(135deg, #021a02 0%, #052e0d 50%, #1a4a0a 100%)",
  },
];

const TICKER_ITEMS = [
  "EIA Notification Amendment 2026 Released - Updated provisions for linear projects and offshore activities",
  "Digital Payment via NPCI is now Live - UPI and Net Banking enabled for all clearance fees",
  "AI Auto-Gist deployed for Category B2 - Automated summarisation cuts scrutiny time by 40 percent",
  "EDS Response Window Reduced to 30 Days - Proponents must reply within revised timelines",
  "New SOP for Public Hearing documentation uploaded in the Downloads section",
];

const NEWS = [
  { tag: "NEW",    date: "10 Mar 2026", title: "EIA Notification Amendment 2026 Released",    desc: "Updated provisions for linear projects and offshore activities under EIA 2006." },
  { tag: "UPDATE", date: "28 Feb 2026", title: "Digital Payment Integration via NPCI Live",    desc: "All clearance application fees now payable through UPI and Net Banking." },
  { tag: "LAUNCH", date: "15 Feb 2026", title: "AI Auto-Gist Deployed for Category B2",       desc: "Automated document summarisation now live - cuts scrutiny time by 40 percent." },
  { tag: "POLICY", date: "30 Jan 2026", title: "EDS Response Window Reduced to 30 Days",      desc: "Proponents must reply to EDS queries within new revised timelines." },
  { tag: "ALERT",  date: "12 Jan 2026", title: "Mandatory PAN Linkage for New Applications",  desc: "All new proposals require verified PAN linked to the registered account." },
];

const FAQS = [
  { q: "How do I register on PARIVESH 3.0?",            a: "Click Register Here on the Login page. Fill in your organisation details, PAN, and contact info. After OTP verification your account is activated within 24 hours." },
  { q: "What documents are required for EC?",           a: "Project concept note, EIA study, public hearing records, land documents, and NOC from local authorities. The exact list varies by category A, B1, or B2." },
  { q: "How do I track my application status?",         a: "Use the Track bar on this page or log in to your Proponent Dashboard where real-time pipeline status across all 7 stages is shown with timelines." },
  { q: "What are the EC processing timelines?",         a: "Category A: up to 210 days. B1: 105 days. B2: 75 days. Timelines are tracked automatically with notifications at each milestone." },
  { q: "Is there a fee for clearance applications?",    a: "Yes. Fees depend on project category and cost. Payment is processed via the integrated NPCI/SBI gateway inside the portal." },
];

const CLEARANCES = [
  { icon: Globe,    label: "Environmental Clearance", short: "EC",  sub: "Category A and B projects - EIA 2006",      accent: GREEN,     link: "/clearance/environmental", days: "75-210 days" },
  { icon: TreePine, label: "Forest Clearance",         short: "FC",  sub: "Diversion under Forest Conservation Act",  accent: "#15803D", link: "/clearance/forest",        days: "60-180 days" },
  { icon: Shield,   label: "Wildlife Clearance",       short: "WC",  sub: "Protected areas and national parks",        accent: BLUE,      link: "/clearance/wildlife",      days: "90-210 days" },
  { icon: MapPin,   label: "CRZ Clearance",            short: "CRZ", sub: "Coastal Regulation Zone projects",          accent: "#C2410C", link: "/clearance/crz",           days: "60-150 days" },
];

const PROCESS_STEPS = [
  { num: "01", label: "Register and Login",    desc: "Create your proponent account with PAN-verified credentials",         icon: Users },
  { num: "02", label: "Submit Application",    desc: "Upload documents, fill CAF and pay processing fees online",           icon: FileCheck },
  { num: "03", label: "Scrutiny Review",       desc: "Expert scrutiny team reviews and may raise EDS queries",             icon: Search },
  { num: "04", label: "Committee Appraisal",   desc: "EAC or SEAC appraises the project and recommends conditions",        icon: Workflow },
  { num: "05", label: "Grant of Clearance",    desc: "Clearance letter issued with binding environmental conditions",       icon: CheckCircle },
  { num: "06", label: "Compliance and Monitor",desc: "Half-yearly compliance reports submitted through PARIVESH portal",   icon: Zap },
];

export default function Home() {
  const navigate = useNavigate();
  const [trackId, setTrackId]   = useState("");
  const [slideIdx, setSlideIdx] = useState(0);
  const [openFaq, setOpenFaq]   = useState<number | null>(0);
  const [tickerPaused, setTickerPaused] = useState(false);
  const slideTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const slide = SLIDES[slideIdx];
  const nextSlide = useCallback(() => setSlideIdx(i => (i + 1) % SLIDES.length), []);
  const prevSlide = useCallback(() => setSlideIdx(i => (i - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    slideTimer.current = setInterval(nextSlide, 6000);
    return () => { if (slideTimer.current) clearInterval(slideTimer.current); };
  }, [nextSlide]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackId.trim()) navigate(`/proponent?track=${trackId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Navigation />

      {/* NEWS TICKER */}
      <div className="bg-[#003087] text-white overflow-hidden" style={{ borderBottom: "2px solid #FF6B00" }}>
        <div className="max-w-[1400px] mx-auto flex items-stretch">
          <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2" style={{ background: ORANGE, minWidth: 130 }}>
            <Bell style={{ width: 14, height: 14, color: "white" }} className="animate-pulse" />
            <span className="text-[11px] font-black tracking-wider text-white">WHAT'S NEW</span>
          </div>
          <div className="overflow-hidden flex-1"
            onMouseEnter={() => setTickerPaused(true)}
            onMouseLeave={() => setTickerPaused(false)}>
            <motion.div
              className="flex items-center gap-8 whitespace-nowrap py-2 px-4 text-[11.5px] font-medium text-white/90"
              animate={tickerPaused ? {} : { x: ["0%", "-50%"] }}
              transition={tickerPaused ? {} : { duration: 40, ease: "linear", repeat: Infinity }}
              style={{ display: "flex" }}>
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                <span key={i} className="flex-shrink-0">{item}<span className="mx-6 text-white/30">|</span></span>
              ))}
            </motion.div>
          </div>
          <button className="flex-shrink-0 flex items-center gap-1 px-3 text-[10px] font-bold text-white/60 hover:text-white transition-colors border-l border-white/10">
            <ExternalLink style={{ width: 12, height: 12 }} />More
          </button>
        </div>
      </div>

      {/* HERO CAROUSEL */}
      <div className="relative overflow-hidden" style={{ minHeight: "88vh", background: slide.bg }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)", backgroundSize: "20px 20px" }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 60% 70% at 30% 50%, ${slide.accent}18, transparent 70%)` }} />

        <div className="max-w-[1400px] mx-auto px-6 py-16 lg:py-24 relative z-10 flex flex-col lg:flex-row items-center gap-12 min-h-[88vh]">

          {/* LEFT: Hero content */}
          <div className="flex-1 max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div key={slideIdx + "b"}
                initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 mb-8"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", backdropFilter: "blur(12px)" }}>
                <motion.span className="w-2 h-2 rounded-full" style={{ background: slide.accent }}
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                <span className="text-[9.5px] font-black tracking-[0.18em] text-white/80 uppercase">{slide.badge}</span>
                <Sparkles style={{ width: 12, height: 12, color: slide.accent }} />
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div key={slideIdx + "t"}
                initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: EASE }}>
                <h1 className="font-black leading-[0.92] mb-5"
                  style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "clamp(3rem, 7vw, 5.8rem)", color: "white" }}>
                  {slide.titleLines.map((part, i) => (
                    <span key={i} className="block"
                      style={part === slide.highlight ? {
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent}cc)`, backgroundClip: "text",
                      } : {}}>
                      {part}
                    </span>
                  ))}
                </h1>
                <p className="text-base leading-relaxed mb-8 max-w-lg" style={{ color: "rgba(187,247,208,0.72)" }}>{slide.sub}</p>
              </motion.div>
            </AnimatePresence>

            <motion.form onSubmit={handleTrack}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: EASE }}
              className="flex mb-7 overflow-hidden"
              style={{ maxWidth: 540, borderRadius: 16, background: "rgba(255,255,255,0.07)", backdropFilter: "blur(18px)", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 16px 48px rgba(0,0,0,0.35)" }}>
              <div className="flex items-center flex-1 px-5 gap-3">
                <Search style={{ width: 18, height: 18, flexShrink: 0, color: "#34d399" }} />
                <input type="text" value={trackId} onChange={e => setTrackId(e.target.value)}
                  placeholder="Track Your Proposal e.g. ENV/2026/001234"
                  className="flex-1 py-3.5 text-sm text-white bg-transparent outline-none placeholder-white/40 font-medium" />
              </div>
              <button type="submit"
                className="px-6 text-sm font-bold text-white whitespace-nowrap flex items-center gap-1.5 transition-opacity hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${ORANGE}, #cc5200)` }}>
                Track <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
            </motion.form>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45, duration: 0.6 }}
              className="flex flex-wrap gap-3">
              <AnimatePresence mode="wait">
                <motion.div key={slideIdx + "c"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Link to={slide.cta1.link}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-90"
                    style={{ background: `linear-gradient(135deg, ${GREEN}, #145014)`, boxShadow: "0 8px 28px rgba(26,92,26,0.45)" }}>
                    <FileCheck style={{ width: 16, height: 16 }} />{slide.cta1.label}
                  </Link>
                </motion.div>
              </AnimatePresence>
              <Link to={slide.cta2.link}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold text-white/85 hover:text-white transition-colors"
                style={{ border: "1.5px solid rgba(255,255,255,0.22)", backdropFilter: "blur(8px)" }}>
                {slide.cta2.label} <ChevronRight style={{ width: 16, height: 16 }} />
              </Link>
            </motion.div>

            <div className="flex items-center gap-4 mt-10">
              <button onClick={prevSlide}
                className="w-9 h-9 rounded-full flex items-center justify-center border border-white/20 hover:bg-white/10 transition-colors">
                <ChevronLeft style={{ width: 16, height: 16, color: "white" }} />
              </button>
              <div className="flex gap-2">
                {SLIDES.map((_, i) => (
                  <button key={i} onClick={() => setSlideIdx(i)} className="transition-all duration-300 rounded-full"
                    style={{ width: i === slideIdx ? 24 : 8, height: 8, background: i === slideIdx ? slide.accent : "rgba(255,255,255,0.25)" }} />
                ))}
              </div>
              <button onClick={nextSlide}
                className="w-9 h-9 rounded-full flex items-center justify-center border border-white/20 hover:bg-white/10 transition-colors">
                <ChevronRight style={{ width: 16, height: 16, color: "white" }} />
              </button>
            </div>
          </div>

          {/* RIGHT: Wheel + Latest News */}
          <div className="flex-shrink-0 hidden lg:flex flex-col items-center gap-6 relative" style={{ width: 460 }}>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="rounded-full blur-3xl opacity-20"
                style={{ width: 400, height: 400, background: `radial-gradient(circle, ${ORANGE}, transparent 70%)` }} />
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: EASE }} className="relative z-10">
              <PariveshWheelWatermark size={340} opacity={0.95} duration={120} darkCenter />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="w-full rounded-2xl overflow-hidden relative z-10"
              style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <div className="flex items-center justify-between px-5 py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}>
                <div className="flex items-center gap-2">
                  <Bell style={{ width: 16, height: 16, color: ORANGE }} />
                  <span className="text-sm font-bold text-white">What's New</span>
                </div>
                <button className="flex items-center gap-1 text-[10px] text-white/50 hover:text-white/80 transition-colors">
                  View all <ExternalLink style={{ width: 10, height: 10 }} />
                </button>
              </div>
              {NEWS.slice(0, 4).map((n, i) => (
                <motion.div key={i}
                  className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors group border-b border-white/5 last:border-0"
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.07, duration: 0.4 }}>
                  <NewsTag tag={n.tag} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-white/40 mb-0.5">{n.date}</p>
                    <p className="text-[11px] font-semibold text-white/85 leading-snug group-hover:text-white transition-colors line-clamp-2">{n.title}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1.5"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <span className="text-[8px] text-white/30 font-bold tracking-[0.2em] uppercase">Scroll</span>
          <div className="w-px h-7 bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </div>

      {/* STATS STRIP */}
      <div className="border-b border-gray-100" style={{ background: "#fafafa" }}>
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">
            <StatCard value={124583} suffix="+" label="Proposals Filed"    icon={FileText}    color={GREEN}  />
            <StatCard value={89456}  suffix="+" label="Clearances Granted" icon={CheckCircle} color="#15803D" />
            <StatCard value={45892}  suffix="+" label="Registered Users"   icon={Users}       color={BLUE}   />
            <StatCard value={12347}  suffix="+" label="Active Projects"    icon={MapPin}      color={ORANGE} />
          </div>
        </div>
      </div>

      {/* CLEARANCE TYPES */}
      <section className="py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-6">
          <motion.div className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.55, ease: EASE }}>
            <span className="inline-block text-[10px] font-black tracking-[0.2em] uppercase mb-3 px-3 py-1 rounded-full"
              style={{ color: GREEN, background: "#f0faf0", border: "1px solid #bbf7d0" }}>Green Clearances</span>
            <h2 className="font-black text-gray-900 mb-3"
              style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "clamp(2rem, 4vw, 2.8rem)" }}>
              Choose Your Clearance Type
            </h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto">Select the appropriate category to begin your application</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CLEARANCES.map((c, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, ease: EASE, delay: i * 0.07 }}>
                <Link to={c.link}>
                  <div className="group h-full rounded-2xl p-7 cursor-pointer flex flex-col relative overflow-hidden bg-white transition-all duration-300"
                    style={{ border: `1.5px solid ${c.accent}20`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.boxShadow = `0 16px 48px ${c.accent}20`;
                      el.style.borderColor = c.accent + "50";
                      el.style.transform = "translateY(-6px)";
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
                      el.style.borderColor = c.accent + "20";
                      el.style.transform = "translateY(0)";
                    }}>
                    <span className="absolute top-4 right-4 text-[9px] font-black px-2 py-0.5 rounded-lg"
                      style={{ background: c.accent + "15", color: c.accent }}>{c.short}</span>
                    <div className="w-14 h-14 rounded-2xl mb-5 flex items-center justify-center"
                      style={{ background: c.accent + "12" }}>
                      <c.icon style={{ width: 24, height: 24, color: c.accent }} />
                    </div>
                    <h3 className="font-black text-gray-900 mb-1.5 leading-snug"
                      style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "1.1rem" }}>{c.label}</h3>
                    <p className="text-xs text-gray-500 mb-4 flex-1 leading-relaxed">{c.sub}</p>
                    <div className="flex items-center gap-1.5 mb-5">
                      <Clock style={{ width: 12, height: 12, color: c.accent }} />
                      <span className="text-[10px] font-semibold" style={{ color: c.accent }}>{c.days}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: c.accent }}>
                      Apply Now <ArrowRight style={{ width: 14, height: 14 }} />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-2xl"
                      style={{ background: `linear-gradient(90deg, ${c.accent}, ${c.accent}88)` }} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* QUICK ACCESS + NEWS */}
      <section className="py-24" style={{ background: "linear-gradient(180deg, #f8fffe 0%, #f0faf0 100%)" }}>
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">

            <div>
              <motion.div className="mb-10"
                initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5 }}>
                <span className="inline-block text-[10px] font-black tracking-[0.2em] uppercase mb-3 px-3 py-1 rounded-full"
                  style={{ color: BLUE, background: "#eff6ff", border: "1px solid #bfdbfe" }}>Quick Access</span>
                <h3 className="font-black text-gray-900 mb-2" style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "2rem" }}>
                  Essential Services
                </h3>
                <p className="text-xs text-gray-500">Everything you need at your fingertips</p>
              </motion.div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Download, label: "Downloads",        sub: "Forms, templates and SOPs",    link: "/downloads",  accent: GREEN,     bg: "#f0faf0" },
                  { icon: FileText, label: "Grievance Portal", sub: "File and track complaints",      link: "/complaints", accent: BLUE,      bg: "#eff6ff" },
                  { icon: BookOpen, label: "User Guide",        sub: "Step-by-step portal manual",    link: "/guide",      accent: ORANGE,    bg: "#fff7ed" },
                  { icon: Users,    label: "Dashboard",         sub: "Login to your role portal",     link: "/login",      accent: "#7C3AED", bg: "#f5f3ff" },
                ].map((q, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.4, ease: EASE, delay: i * 0.05 }}>
                    <Link to={q.link}>
                      <div className="group p-5 rounded-2xl bg-white border transition-all duration-200 cursor-pointer"
                        style={{ borderColor: q.accent + "20" }}
                        onMouseEnter={e => {
                          const el = e.currentTarget as HTMLDivElement;
                          el.style.background = q.bg;
                          el.style.borderColor = q.accent + "45";
                          el.style.transform = "translateY(-3px)";
                          el.style.boxShadow = `0 8px 24px ${q.accent}18`;
                        }}
                        onMouseLeave={e => {
                          const el = e.currentTarget as HTMLDivElement;
                          el.style.background = "white";
                          el.style.borderColor = q.accent + "20";
                          el.style.transform = "translateY(0)";
                          el.style.boxShadow = "none";
                        }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                          style={{ background: q.accent + "15" }}>
                          <q.icon style={{ width: 20, height: 20, color: q.accent }} />
                        </div>
                        <p className="font-bold text-sm text-gray-800 mb-0.5">{q.label}</p>
                        <p className="text-xs text-gray-500 leading-snug">{q.sub}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <motion.div className="mb-10"
                initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5 }}>
                <span className="inline-block text-[10px] font-black tracking-[0.2em] uppercase mb-3 px-3 py-1 rounded-full"
                  style={{ color: ORANGE, background: "#fff7ed", border: "1px solid #fed7aa" }}>Notifications</span>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-black text-gray-900 mb-2" style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "2rem" }}>
                    Latest Updates
                  </h3>
                  <Link to="/downloads" className="text-xs font-bold flex items-center gap-1 transition-colors" style={{ color: ORANGE }}>
                    View All <ExternalLink style={{ width: 12, height: 12 }} />
                  </Link>
                </div>
                <p className="text-xs text-gray-500">Recent notifications from MoEFCC</p>
              </motion.div>
              <div className="space-y-2.5">
                {NEWS.map((n, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.4, ease: EASE, delay: i * 0.06 }}>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-100 cursor-pointer group hover:border-gray-200 hover:shadow-sm transition-all duration-200">
                      <NewsTag tag={n.tag} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-gray-400 mb-1">{n.date}</p>
                        <p className="text-sm font-semibold text-gray-800 leading-snug mb-0.5 group-hover:text-green-800 transition-colors">{n.title}</p>
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-1">{n.desc}</p>
                      </div>
                      <ChevronRight style={{ width: 16, height: 16, color: "#d1d5db" }} className="flex-shrink-0 mt-0.5" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS STEPS */}
      <section className="py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-6">
          <motion.div className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.55, ease: EASE }}>
            <span className="inline-block text-[10px] font-black tracking-[0.2em] uppercase mb-3 px-3 py-1 rounded-full"
              style={{ color: BLUE, background: "#eff6ff", border: "1px solid #bfdbfe" }}>How It Works</span>
            <h2 className="font-black text-gray-900 mb-3"
              style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "clamp(2rem, 4vw, 2.8rem)" }}>
              Clearance Process Step by Step
            </h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto">From registration to final clearance, fully digital and fully transparent</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROCESS_STEPS.map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, ease: EASE, delay: i * 0.08 }}>
                <div className="p-6 rounded-2xl bg-white border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-250 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${GREEN}, #15803d)` }}>
                      <s.icon style={{ width: 20, height: 20, color: "white" }} />
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-gray-300"
                      style={{ fontFamily: "Rajdhani, sans-serif" }}>STEP {s.num}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2" style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "1rem" }}>{s.label}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24" style={{ background: "#f8fffe" }}>
        <div className="max-w-4xl mx-auto px-6">
          <motion.div className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.55, ease: EASE }}>
            <span className="inline-block text-[10px] font-black tracking-[0.2em] uppercase mb-3 px-3 py-1 rounded-full"
              style={{ color: GREEN, background: "#f0faf0", border: "1px solid #bbf7d0" }}>FAQs</span>
            <h2 className="font-black text-gray-900 mb-3"
              style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "clamp(2rem, 4vw, 2.8rem)" }}>
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 text-sm">Common clearance process queries answered</p>
          </motion.div>
          <div className="space-y-2.5">
            {FAQS.map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, ease: EASE, delay: i * 0.05 }}>
                <FaqItem q={f.q} a={f.a} open={openFaq === i} toggle={() => setOpenFaq(openFaq === i ? null : i)} />
              </motion.div>
            ))}
          </div>
          <motion.div className="text-center mt-10"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <Link to="/contact" className="inline-flex items-center gap-2 text-sm font-bold transition-colors" style={{ color: GREEN }}>
              <HelpCircle style={{ width: 16, height: 16 }} />
              Need more help? Contact our support team
              <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* PARTNERS */}
      <div style={{ background: "#fafafa", borderTop: "1px solid #f0f0f0" }}>
        <PartnersSection />
      </div>

      {/* CTA BANNER */}
      <section className="py-20 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, #0a1f0a 0%, ${BLUE} 100%)` }}>
        <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ background: GREEN }} />
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ background: ORANGE }} />
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, ease: EASE }}>
            <div className="w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
              <Leaf style={{ width: 28, height: 28, color: "#4ade80" }} />
            </div>
            <h2 className="font-black text-white mb-4"
              style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
              Ready to Begin Your Clearance Journey?
            </h2>
            <p className="text-base mb-10 max-w-xl mx-auto" style={{ color: "rgba(187,247,208,0.65)" }}>
              Join thousands of project proponents across India who trust PARIVESH 3.0 for seamless environmental clearance.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/login"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${ORANGE}, #cc5200)`, boxShadow: "0 8px 32px rgba(255,107,0,0.45)" }}>
                Get Started Now <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
              <Link to="/guide"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-semibold text-white/85 hover:text-white transition-colors"
                style={{ border: "1.5px solid rgba(255,255,255,0.22)" }}>
                <BookOpen style={{ width: 16, height: 16 }} />View User Guide
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

import { Header } from "../components/Header";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { Breadcrumb } from "../components/Breadcrumb";
import { DecorativePattern } from "../components/DecorativePattern";
import {
  CheckCircle, Users, FileText, Calendar, Shield, Globe, Zap, Database,
  ArrowRight, ChevronDown, ChevronUp, Award, Clock, BarChart3, Leaf,
  Building2, Phone, Mail, MapPin, ExternalLink, BookOpen, Scale, TreePine,
  Fish, Mountain, Waves, ChevronRight, Download, Landmark, Network,
  GitBranch, GraduationCap, Info, Target, Eye, CircleDot, Layers,
  BadgeCheck, Banknote, History
} from "lucide-react";
import { useNavigate, Link } from "react-router";
import { motion } from "motion/react";
import { useState, useEffect, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  Reusable sub-components                                            */
/* ------------------------------------------------------------------ */

function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, end, duration]);

  return <div ref={ref}>{count.toLocaleString()}{suffix}</div>;
}

function SectionHeading({ id, title, titleHi }: { id: string; title: string; titleHi: string }) {
  return (
    <div id={id} className="scroll-mt-24 mb-6">
      <h2
        className="text-2xl text-[#003087] border-b-2 border-[#FF6B00] pb-2 inline-block"
        style={{ fontFamily: "Rajdhani, sans-serif" }}
      >
        {title}
      </h2>
      <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: "Noto Sans Devanagari, sans-serif" }}>
        {titleHi}
      </p>
    </div>
  );
}

function AccordionItem({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className="text-sm text-gray-800">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-[#1A5C1A]" /> : <ChevronDown className="w-4 h-4 text-[#1A5C1A]" />}
      </button>
      {open && (
        <div className="px-4 py-3 text-sm text-gray-600 bg-white border-t border-gray-100 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sidebar nav items                                                  */
/* ------------------------------------------------------------------ */

const sidebarSections = [
  { id: "about-parivesh", label: "About PARIVESH", labelHi: "परिवेश के बारे में", icon: <Info className="w-4 h-4" /> },
  { id: "vision-mission", label: "Vision & Mission", labelHi: "विजन और मिशन", icon: <Eye className="w-4 h-4" /> },
  { id: "objectives", label: "Objectives", labelHi: "उद्देश्य", icon: <Target className="w-4 h-4" /> },
  { id: "types-of-clearances", label: "Types of Clearances", labelHi: "मंजूरी के प्रकार", icon: <Layers className="w-4 h-4" /> },
  { id: "evolution", label: "Evolution of PARIVESH", labelHi: "परिवेश का विकास", icon: <History className="w-4 h-4" /> },
  { id: "acts-rules", label: "Acts & Rules", labelHi: "अधिनियम और नियम", icon: <Scale className="w-4 h-4" /> },
  { id: "stakeholders", label: "Stakeholders", labelHi: "हितधारक", icon: <Users className="w-4 h-4" /> },
  { id: "process-flow", label: "Process Flow", labelHi: "प्रक्रिया प्रवाह", icon: <GitBranch className="w-4 h-4" /> },
  { id: "key-features", label: "Key Features", labelHi: "प्रमुख विशेषताएं", icon: <Zap className="w-4 h-4" /> },
  { id: "statistics", label: "Statistics", labelHi: "आँकड़े", icon: <BarChart3 className="w-4 h-4" /> },
  { id: "contact", label: "Contact & Helpdesk", labelHi: "संपर्क और हेल्पडेस्क", icon: <Phone className="w-4 h-4" /> },
];

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function About() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("about-parivesh");

  // Scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0.1 }
    );
    sidebarSections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8]" style={{ fontFamily: "Noto Sans, sans-serif" }}>
      <Header />
      <Navigation />

      {/* ── Page Title Bar (Govt-style) ────────────────────────── */}
      <div className="bg-gradient-to-r from-[#1A5C1A] to-[#145014] text-white relative overflow-hidden">
        <DecorativePattern position="top-right" size="lg" opacity={0.06} />
        <div className="max-w-7xl mx-auto px-6 py-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h1 className="text-3xl" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                About PARIVESH
              </h1>
              <p className="text-green-200 text-sm" style={{ fontFamily: "Noto Sans Devanagari, sans-serif" }}>
                परिवेश के बारे में
              </p>
            </div>
            <div className="text-green-100 text-xs flex items-center gap-1">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white">About</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content Area ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── LEFT SIDEBAR ─────────────────────────────────── */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-4 overflow-hidden">
              <div className="bg-[#003087] text-white px-4 py-3">
                <h3 className="text-sm" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                  In This Section
                </h3>
                <p className="text-blue-200 text-xs" style={{ fontFamily: "Noto Sans Devanagari, sans-serif" }}>
                  इस अनुभाग में
                </p>
              </div>
              <nav className="py-1">
                {sidebarSections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollTo(sec.id)}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors border-l-3 ${
                      activeSection === sec.id
                        ? "bg-green-50 text-[#1A5C1A] border-l-[3px] border-[#1A5C1A]"
                        : "text-gray-600 hover:bg-gray-50 hover:text-[#003087] border-l-[3px] border-transparent"
                    }`}
                  >
                    <span className="flex-shrink-0">{sec.icon}</span>
                    <span>{sec.label}</span>
                  </button>
                ))}
              </nav>
              {/* Quick Links */}
              <div className="border-t border-gray-200 p-4 space-y-2">
                <a href="#" className="flex items-center gap-2 text-xs text-[#003087] hover:underline">
                  <Download className="w-3 h-3" /> User Manual (PDF)
                </a>
                <a href="#" className="flex items-center gap-2 text-xs text-[#003087] hover:underline">
                  <Download className="w-3 h-3" /> PARIVESH Guidelines
                </a>
                <a href="#" className="flex items-center gap-2 text-xs text-[#003087] hover:underline">
                  <ExternalLink className="w-3 h-3" /> MoEFCC Official Website
                </a>
              </div>
            </div>
          </aside>

          {/* ── RIGHT CONTENT AREA ───────────────────────────── */}
          <main className="flex-1 min-w-0 space-y-8">

            {/* ── About PARIVESH ──────────────────────────────── */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <SectionHeading id="about-parivesh" title="About PARIVESH" titleHi="परिवेश के बारे में" />

              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-5 rounded-lg border-l-4 border-[#1A5C1A] mb-5">
                <p className="text-gray-800">
                  <strong className="text-[#1A5C1A] text-lg">PARIVESH</strong> &mdash;{" "}
                  <strong className="text-[#1A5C1A]">P</strong>ro-<strong className="text-[#1A5C1A]">A</strong>ctive and{" "}
                  <strong className="text-[#1A5C1A]">R</strong>esponsive facilitation by{" "}
                  <strong className="text-[#1A5C1A]">I</strong>nteractive,{" "}
                  <strong className="text-[#1A5C1A]">V</strong>irtuous and{" "}
                  <strong className="text-[#1A5C1A]">E</strong>nvironmental{" "}
                  <strong className="text-[#1A5C1A]">S</strong>ingle-window{" "}
                  <strong className="text-[#1A5C1A]">H</strong>ub
                </p>
                <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: "Noto Sans Devanagari, sans-serif" }}>
                  सक्रिय और उत्तरदायी सुविधा इंटरैक्टिव, सदाचारी और पर्यावरणीय एकल-खिड़की केंद्र द्वारा
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-5 mb-5">
                <div className="md:col-span-2 space-y-3 text-sm text-gray-700 leading-relaxed">
                  <p>
                    PARIVESH is a web-based, role-based workflow application which has been developed by the Ministry of Environment, Forest & Climate Change (MoEFCC), Government of India in collaboration with the National Informatics Centre (NIC). It has been designed for online submission, monitoring and management of proposals seeking Environment, Forest, Wildlife and CRZ Clearances from Central, State and District Level Authorities.
                  </p>
                  <p>
                    The portal serves as a <strong>single-window integrated system</strong> that enables project proponents to submit applications, upload required documents, track application status and download clearance letters. It provides separate role-based dashboards for all stakeholders including project proponents, regional offices, Expert Appraisal Committees (EAC), State Expert Appraisal Committees (SEAC), State Environment Impact Assessment Authorities (SEIAA), and the MoEFCC.
                  </p>
                  <p>
                    PARIVESH 3.0 represents the next evolution of this platform, integrating <strong>AI-powered auto-gist generation</strong>, advanced analytics, enhanced bilingual support, and modernized user interfaces while maintaining full compliance with government security standards and the Digital India initiative.
                  </p>
                </div>
                <div className="rounded-lg overflow-hidden shadow-md">
                  <img
                    src="https://images.unsplash.com/photo-1663070550354-b61db69a758b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGZvcmVzdCUyMGNhbm9weSUyMGFlcmlhbCUyMEluZGlhfGVufDF8fHx8MTc3MzI0NzQ5N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Indian forest canopy"
                    className="w-full h-52 object-cover"
                  />
                  <div className="bg-[#1A5C1A] text-white text-center py-2 text-xs">
                    Protecting India's Natural Heritage
                  </div>
                </div>
              </div>

              <div className="bg-[#FFF8F0] rounded-lg p-4 border-l-4 border-[#FF6B00]">
                <p className="text-sm text-gray-800 italic">
                  "The environment is no one's property to destroy; it's everyone's responsibility to protect."
                </p>
                <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: "Noto Sans Devanagari, sans-serif" }}>
                  "पर्यावरण किसी की नष्ट करने की संपत्ति नहीं है; इसकी रक्षा करना सभी की जिम्मेदारी है।"
                </p>
              </div>
            </section>

            {/* ── Vision & Mission ─────────────────────────────── */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <SectionHeading id="vision-mission" title="Vision & Mission" titleHi="विजन और मिशन" />
              <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-gradient-to-br from-[#1A5C1A] to-[#2E7D32] rounded-lg p-5 text-white relative overflow-hidden">
                  <DecorativePattern position="bottom-right" size="sm" opacity={0.08} />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <Eye className="w-5 h-5" />
                      <h3 className="text-lg" style={{ fontFamily: "Rajdhani, sans-serif" }}>Vision / दृष्टि</h3>
                    </div>
                    <p className="text-green-100 text-sm leading-relaxed">
                      To create a transparent, efficient, and technology-driven environmental governance system that facilitates sustainable development while ensuring the conservation and protection of India's rich natural heritage for present and future generations, in alignment with the principles of the <strong>National Environment Policy, 2006</strong> and the <strong>Digital India</strong> initiative.
                    </p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#003087] to-[#1A4C8B] rounded-lg p-5 text-white relative overflow-hidden">
                  <DecorativePattern position="bottom-right" size="sm" opacity={0.08} />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-5 h-5" />
                      <h3 className="text-lg" style={{ fontFamily: "Rajdhani, sans-serif" }}>Mission / मिशन</h3>
                    </div>
                    <p className="text-blue-100 text-sm leading-relaxed">
                      To provide a single-window, paperless, and transparent clearance mechanism for all environment-related approvals in India. The platform aims to reduce processing timelines, eliminate physical movement of files, enable real-time tracking, and ensure accountability at every stage of the clearance process while empowering all stakeholders.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Objectives ──────────────────────────────────── */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <SectionHeading id="objectives" title="Objectives" titleHi="उद्देश्य" />
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { text: "Single-window system for submission of applications seeking Environmental, Forest, Wildlife and CRZ Clearances", icon: <Layers className="w-4 h-4" /> },
                  { text: "Facilitate online submission and tracking of proposals by project proponents from anywhere", icon: <Globe className="w-4 h-4" /> },
                  { text: "Transparency in decision making and reducing the timeline for granting clearances", icon: <Clock className="w-4 h-4" /> },
                  { text: "Paperless processing and movement of files at Central and State levels", icon: <FileText className="w-4 h-4" /> },
                  { text: "Geo-spatial analysis and integration with existing databases like Survey of India, FSI, etc.", icon: <MapPin className="w-4 h-4" /> },
                  { text: "Standardization of clearance process across all States and Union Territories", icon: <BadgeCheck className="w-4 h-4" /> },
                  { text: "Online payment of fees, deposits and other charges", icon: <Banknote className="w-4 h-4" /> },
                  { text: "Real-time monitoring of compliance conditions post-clearance", icon: <Shield className="w-4 h-4" /> },
                ].map((obj, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="bg-[#1A5C1A] text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                      {i + 1}
                    </div>
                    <p className="text-sm text-gray-700">{obj.text}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Types of Clearances ─────────────────────────── */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <SectionHeading id="types-of-clearances" title="Types of Clearances" titleHi="मंजूरी के प्रकार" />
              <p className="text-sm text-gray-600 mb-5">
                PARIVESH facilitates four major types of environmental clearances as mandated by various acts and notifications of the Government of India:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    title: "Environmental Clearance (EC)",
                    titleHi: "पर्यावरण मंजूरी",
                    icon: <Mountain className="w-6 h-6" />,
                    color: "#1A5C1A",
                    bg: "bg-green-50",
                    act: "EIA Notification, 2006 (as amended)",
                    image: "https://images.unsplash.com/photo-1769184615151-9c328cb905d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMHN1c3RhaW5hYmxlJTIwZW52aXJvbm1lbnQlMjB3aW5kJTIwZW5lcmd5fGVufDF8fHx8MTc3MzI0NzQ5OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
                    desc: "Prior Environmental Clearance is required for new projects or expansion/modernization of existing projects listed in the Schedule to the EIA Notification, 2006. Projects are categorized into Category A (Central level) and Category B (State level) based on their potential environmental impact. The process includes screening, scoping, public consultation, and appraisal stages."
                  },
                  {
                    title: "Forest Clearance (FC)",
                    titleHi: "वन मंजूरी",
                    icon: <TreePine className="w-6 h-6" />,
                    color: "#2E7D32",
                    bg: "bg-green-50",
                    act: "Forest (Conservation) Act, 1980",
                    image: "https://images.unsplash.com/photo-1663070550354-b61db69a758b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGZvcmVzdCUyMGNhbm9weSUyMGFlcmlhbCUyMEluZGlhfGVufDF8fHx8MTc3MzI0NzQ5N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
                    desc: "Diversion of forest land for non-forest purposes requires prior approval of the Central Government under the Forest (Conservation) Act, 1980. This includes mining, construction of dams, roads, railways, and other developmental activities. The process involves site inspection, compensatory afforestation planning, and Net Present Value (NPV) calculation."
                  },
                  {
                    title: "Wildlife Clearance (WL)",
                    titleHi: "वन्यजीव मंजूरी",
                    icon: <Fish className="w-6 h-6" />,
                    color: "#FF6B00",
                    bg: "bg-orange-50",
                    act: "Wildlife (Protection) Act, 1972",
                    image: "https://images.unsplash.com/photo-1760862873992-d5ee8be88851?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCZW5nYWwlMjB0aWdlciUyMHdpbGRsaWZlJTIwc2FuY3R1YXJ5fGVufDF8fHx8MTc3MzI0NzQ5N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
                    desc: "Projects located within or near National Parks, Wildlife Sanctuaries, or Tiger Reserves require clearance from the National Board for Wildlife (NBWL) / Standing Committee of NBWL. The Wildlife Institute of India (WII) provides technical evaluation. This ensures that developmental activities do not adversely affect wildlife habitats and biodiversity."
                  },
                  {
                    title: "CRZ Clearance",
                    titleHi: "तटीय विनियमन क्षेत्र मंजूरी",
                    icon: <Waves className="w-6 h-6" />,
                    color: "#003087",
                    bg: "bg-blue-50",
                    act: "CRZ Notification, 2019",
                    image: "https://images.unsplash.com/photo-1642510099881-9246375a5c5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBjb2FzdGxpbmUlMjBtYW5ncm92ZSUyMGJlYWNofGVufDF8fHx8MTc3MzI0NzQ5OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
                    desc: "Activities in the Coastal Regulation Zone require CRZ clearance under the CRZ Notification, 2019. The coastal zone is classified into CRZ-I to CRZ-IV categories. Applications are processed through the State/UT Coastal Zone Management Authority (CZMA) and the MoEFCC depending on the category and scale of the project."
                  }
                ].map((clearance, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`${clearance.bg} rounded-lg border overflow-hidden hover:shadow-md transition-shadow`}
                    style={{ borderColor: clearance.color + "33" }}
                  >
                    <div className="h-32 overflow-hidden relative">
                      <img src={clearance.image} alt={clearance.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center gap-2 text-white">
                        {clearance.icon}
                        <div>
                          <h4 className="text-sm">{clearance.title}</h4>
                          <p className="text-xs opacity-80" style={{ fontFamily: "Noto Sans Devanagari, sans-serif" }}>{clearance.titleHi}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="text-xs text-white px-2 py-1 rounded mb-3 inline-block" style={{ backgroundColor: clearance.color }}>
                        {clearance.act}
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{clearance.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* ── Evolution of PARIVESH ───────────────────────── */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <SectionHeading id="evolution" title="Evolution of PARIVESH" titleHi="परिवेश का विकास" />
              <p className="text-sm text-gray-600 mb-6">
                PARIVESH has evolved through multiple phases, each building upon the previous to create a more efficient, transparent and technology-driven clearance system:
              </p>
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#1A5C1A] via-[#003087] to-[#FF6B00]" />
                <div className="space-y-6">
                  {[
                    {
                      year: "2018",
                      title: "PARIVESH 1.0",
                      titleHi: "परिवेश 1.0",
                      color: "#1A5C1A",
                      points: [
                        "Launched by Hon'ble Prime Minister Shri Narendra Modi on the occasion of World Biofuel Day (10th August 2018)",
                        "Unified portal for Environmental, Forest and Wildlife Clearances",
                        "Online submission of proposals replacing physical file movement",
                        "Integration with GIS mapping for spatial analysis",
                        "Automated alerts and notifications via SMS and email"
                      ]
                    },
                    {
                      year: "2022",
                      title: "PARIVESH 2.0",
                      titleHi: "परिवेश 2.0",
                      color: "#003087",
                      points: [
                        "Enhanced user interface with improved navigation and usability",
                        "Integration with DigiLocker and Aadhaar for authentication",
                        "Online payment gateway for fees and deposits",
                        "Advanced GIS integration with Forest Survey of India (FSI) data",
                        "CRZ clearance module added to the single-window system",
                        "Compliance monitoring module for post-clearance tracking",
                        "District-level forest clearance processing capability"
                      ]
                    },
                    {
                      year: "2026",
                      title: "PARIVESH 3.0",
                      titleHi: "परिवेश 3.0",
                      color: "#FF6B00",
                      points: [
                        "AI-powered auto-gist generation for application summaries",
                        "Advanced role-based workflow with customized dashboards",
                        "Intelligent document classification and anomaly detection",
                        "Enhanced bilingual support (Hindi & English) across all modules",
                        "Meeting management system with MoM generation",
                        "Responsive design for mobile and tablet access",
                        "Real-time analytics dashboard for administrators",
                        "Integration with National Single Window System (NSWS)"
                      ]
                    }
                  ].map((phase, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15 }}
                      className="relative pl-16"
                    >
                      {/* Circle marker */}
                      <div
                        className="absolute left-3 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs shadow-md"
                        style={{ backgroundColor: phase.color }}
                      >
                        <CircleDot className="w-3.5 h-3.5" />
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className="text-xs text-white px-2 py-0.5 rounded"
                            style={{ backgroundColor: phase.color }}
                          >
                            {phase.year}
                          </span>
                          <h4 className="text-gray-800">{phase.title}</h4>
                          <span className="text-xs text-gray-400" style={{ fontFamily: "Noto Sans Devanagari, sans-serif" }}>
                            {phase.titleHi}
                          </span>
                        </div>
                        <ul className="space-y-1.5">
                          {phase.points.map((pt, j) => (
                            <li key={j} className="flex items-start gap-2 text-xs text-gray-600">
                              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: phase.color }} />
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Acts & Rules ────────────────────────────────── */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <SectionHeading id="acts-rules" title="Acts & Rules" titleHi="अधिनियम और नियम" />
              <p className="text-sm text-gray-600 mb-4">
                PARIVESH operates under the framework of the following key legislation enacted by the Parliament of India and notifications issued by MoEFCC:
              </p>
              <AccordionItem title="Environment (Protection) Act, 1986" defaultOpen>
                <p className="mb-2">
                  The umbrella legislation for environmental protection in India. It empowers the Central Government to take measures to protect and improve the environment, set standards for emissions and discharges, regulate the handling of hazardous substances, and inspect industrial plants. It also provides the framework under which the EIA Notification has been issued.
                </p>
                <p className="text-xs text-gray-400">Enacted: 23 May 1986 | Amended: 1991, 2006</p>
              </AccordionItem>
              <AccordionItem title="Environmental Impact Assessment (EIA) Notification, 2006">
                <p className="mb-2">
                  This notification makes it mandatory for certain categories of developmental projects to obtain prior Environmental Clearance (EC) before commencement of construction or operations. Projects are classified as Category A (requiring clearance from MoEFCC) or Category B (requiring clearance from SEIAA). The notification prescribes a four-stage process: Screening, Scoping, Public Consultation, and Appraisal.
                </p>
                <p className="text-xs text-gray-400">S.O. 1533(E) dated 14th September, 2006 | Amended multiple times</p>
              </AccordionItem>
              <AccordionItem title="Forest (Conservation) Act, 1980">
                <p className="mb-2">
                  This Act restricts the de-reservation of reserved forests, prevents use of forest land for non-forest purposes, and prohibits the felling of trees without the prior approval of the Central Government. The Forest (Conservation) Rules, 2003 prescribe the procedure for diversion of forest land. Proposals are processed in two stages — In-Principle approval (Stage I) and Final approval (Stage II).
                </p>
                <p className="text-xs text-gray-400">Enacted: 25 October 1980 | Amended: 1988, 2023</p>
              </AccordionItem>
              <AccordionItem title="Wildlife (Protection) Act, 1972">
                <p className="mb-2">
                  Provides a framework for the protection of wild animals, birds and plants. It established National Parks, Wildlife Sanctuaries and other protected areas. Projects in and around these protected areas require clearance from the National Board for Wildlife (NBWL). The Standing Committee of NBWL considers proposals for activities in and around protected areas.
                </p>
                <p className="text-xs text-gray-400">Enacted: 9 September 1972 | Amended: 2002, 2006, 2022</p>
              </AccordionItem>
              <AccordionItem title="Coastal Regulation Zone (CRZ) Notification, 2019">
                <p className="mb-2">
                  Replaces the CRZ Notification, 2011. It classifies the coastal zone into CRZ-I (ecologically sensitive), CRZ-II (urban developed areas), CRZ-III (rural areas), and CRZ-IV (water area). The notification specifies permitted and prohibited activities in each zone. Clearances are granted by the MoEFCC or State/UT CZMA based on the project scale.
                </p>
                <p className="text-xs text-gray-400">S.O. 37(E) dated 18th January, 2019</p>
              </AccordionItem>
              <AccordionItem title="National Green Tribunal Act, 2010">
                <p className="mb-2">
                  Establishes the National Green Tribunal (NGT) for effective and expeditious disposal of cases relating to environmental protection, conservation of forests, and enforcement of environmental legal rights. The NGT handles civil cases pertaining to environmental issues and provides relief and compensation for damages caused to persons and property.
                </p>
                <p className="text-xs text-gray-400">Enacted: 2 June 2010</p>
              </AccordionItem>
            </section>

            {/* ── Stakeholders ────────────────────────────────── */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <SectionHeading id="stakeholders" title="Stakeholders" titleHi="हितधारक" />
              <p className="text-sm text-gray-600 mb-5">
                PARIVESH serves a diverse set of stakeholders across the environmental governance ecosystem of India:
              </p>
              <div className="space-y-3">
                {[
                  {
                    category: "Central Level Authorities",
                    color: "#1A5C1A",
                    bodies: [
                      { name: "Ministry of Environment, Forest and Climate Change (MoEFCC)", role: "Nodal Ministry — grants EC for Category A projects, FC at central level, WL clearances" },
                      { name: "Expert Appraisal Committees (EAC)", role: "Sector-specific committees that appraise Category A EC proposals" },
                      { name: "National Board for Wildlife (NBWL)", role: "Apex body for Wildlife clearances — Standing Committee reviews proposals" },
                      { name: "Forest Advisory Committee (FAC)", role: "Advises MoEFCC on diversion of forest land for non-forest purposes" },
                    ]
                  },
                  {
                    category: "State Level Authorities",
                    color: "#003087",
                    bodies: [
                      { name: "State Environment Impact Assessment Authority (SEIAA)", role: "Grants EC for Category B projects at State level" },
                      { name: "State Expert Appraisal Committee (SEAC)", role: "Appraises Category B proposals and makes recommendations to SEIAA" },
                      { name: "State/UT Coastal Zone Management Authority (CZMA)", role: "Processes CRZ clearance proposals at State level" },
                      { name: "Divisional Forest Officer (DFO) / Regional Offices", role: "Site inspection, report preparation for Forest clearance proposals" },
                    ]
                  },
                  {
                    category: "Project Proponents & Others",
                    color: "#FF6B00",
                    bodies: [
                      { name: "Project Proponents / User Agencies", role: "Submit applications, upload documents, track status, respond to queries" },
                      { name: "EIA Consultants (NABET Accredited)", role: "Prepare EIA/EMP reports on behalf of project proponents" },
                      { name: "Public / Affected Communities", role: "Participate in public consultation process for Category A and B1 projects" },
                      { name: "National Informatics Centre (NIC)", role: "Technical partner — development and maintenance of PARIVESH portal" },
                    ]
                  }
                ].map((group, i) => (
                  <div key={i} className="border rounded-lg overflow-hidden" style={{ borderColor: group.color + "33" }}>
                    <div className="px-4 py-2 text-white text-sm" style={{ backgroundColor: group.color }}>
                      {group.category}
                    </div>
                    <div className="divide-y divide-gray-100">
                      {group.bodies.map((body, j) => (
                        <div key={j} className="px-4 py-3 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                          <span className="text-sm text-gray-800 sm:w-2/5 flex-shrink-0">{body.name}</span>
                          <span className="text-xs text-gray-500">{body.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Process Flow ────────────────────────────────── */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <SectionHeading id="process-flow" title="Clearance Process Flow" titleHi="मंजूरी प्रक्रिया प्रवाह" />
              <p className="text-sm text-gray-600 mb-5">
                The standard Environmental Clearance process under the EIA Notification, 2006 follows four stages:
              </p>
              <div className="space-y-0">
                {[
                  { step: "Stage 1", title: "Screening", titleHi: "स्क्रीनिंग", desc: "Applicable only for Category B projects. The SEAC screens the proposal to determine whether it requires detailed EIA study (Category B1) or can be appraised on the basis of Form 1/1A (Category B2). Category A projects are automatically subjected to full EIA.", color: "#1A5C1A" },
                  { step: "Stage 2", title: "Scoping", titleHi: "स्कोपिंग", desc: "The EAC/SEAC determines the Terms of Reference (ToR) for the EIA study within 60 days. The ToR specifies the scope of EIA including environmental aspects, baseline data requirements, assessment methodology, and mitigation measures to be studied.", color: "#2E7D32" },
                  { step: "Stage 3", title: "Public Consultation", titleHi: "सार्वजनिक परामर्श", desc: "For Category A and B1 projects, public consultation includes a public hearing at the site and submission of written responses from concerned persons. The State Pollution Control Board (SPCB) conducts the public hearing within 45 days.", color: "#003087" },
                  { step: "Stage 4", title: "Appraisal", titleHi: "मूल्यांकन", desc: "The EAC/SEAC appraises the EIA report, public consultation outcomes, and supporting documents. The committee may recommend grant of EC with specific conditions, request additional information, or recommend rejection. The final decision is communicated within 45 days of appraisal.", color: "#FF6B00" }
                ].map((stage, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4"
                  >
                    {/* Step indicator */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs shadow"
                        style={{ backgroundColor: stage.color }}
                      >
                        {i + 1}
                      </div>
                      {i < 3 && <div className="w-0.5 h-full min-h-8 bg-gray-200" />}
                    </div>
                    {/* Content */}
                    <div className="pb-5 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400 uppercase tracking-wider">{stage.step}</span>
                        <h4 className="text-sm text-gray-800">{stage.title}</h4>
                        <span className="text-xs text-gray-400" style={{ fontFamily: "Noto Sans Devanagari, sans-serif" }}>{stage.titleHi}</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{stage.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Post-clearance */}
              <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm text-gray-800 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#1A5C1A]" />
                  Post-Clearance Compliance Monitoring
                  <span className="text-xs text-gray-400" style={{ fontFamily: "Noto Sans Devanagari, sans-serif" }}>मंजूरी के बाद अनुपालन निगरानी</span>
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  After the grant of Environmental Clearance, the project proponent is required to submit half-yearly compliance reports. The Regional Office of MoEFCC conducts periodic inspections. Non-compliance may lead to show-cause notices, suspension, or revocation of clearance. PARIVESH 3.0 enables online submission and monitoring of these compliance reports.
                </p>
              </div>
            </section>

            {/* ── Key Features ────────────────────────────────── */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <SectionHeading id="key-features" title="Key Features of PARIVESH 3.0" titleHi="परिवेश 3.0 की प्रमुख विशेषताएं" />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: <Layers className="w-5 h-5" />, title: "Single Window System", desc: "Unified portal for EC, FC, WL and CRZ clearances under one login" },
                  { icon: <Zap className="w-5 h-5" />, title: "AI Auto-Gist", desc: "AI-powered extraction and summarization of key application data" },
                  { icon: <Users className="w-5 h-5" />, title: "Role-Based Dashboards", desc: "Customized views for Proponents, EAC, SEAC, SEIAA, RO, MoEFCC" },
                  { icon: <MapPin className="w-5 h-5" />, title: "GIS Integration", desc: "Spatial analysis with FSI, SOI and revenue maps for site verification" },
                  { icon: <Globe className="w-5 h-5" />, title: "Bilingual Support", desc: "Complete Hindi and English interface across all modules" },
                  { icon: <Shield className="w-5 h-5" />, title: "Digital Signatures", desc: "eSign integration for authenticated and tamper-proof clearance letters" },
                  { icon: <Calendar className="w-5 h-5" />, title: "Meeting Management", desc: "EAC/SEAC meeting scheduling, agenda management and MoM recording" },
                  { icon: <BarChart3 className="w-5 h-5" />, title: "Analytics Dashboard", desc: "Real-time statistics, trend analysis and performance monitoring" },
                  { icon: <Database className="w-5 h-5" />, title: "Document Repository", desc: "Secure cloud storage with versioning for all project documents" },
                  { icon: <Banknote className="w-5 h-5" />, title: "Online Payments", desc: "Integrated payment gateway for processing fees and NPV deposits" },
                  { icon: <Network className="w-5 h-5" />, title: "System Integration", desc: "Connected with DigiLocker, Aadhaar, NSWS and State portals" },
                  { icon: <GraduationCap className="w-5 h-5" />, title: "Knowledge Base", desc: "Built-in user manuals, video tutorials and context-sensitive help" },
                ].map((feat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-green-50 hover:border-[#1A5C1A]/30 transition-colors group"
                  >
                    <div className="text-[#1A5C1A] mt-0.5 group-hover:text-[#003087] transition-colors">{feat.icon}</div>
                    <div>
                      <h4 className="text-sm text-gray-800">{feat.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{feat.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* ── Statistics ──────────────────────────────────── */}
            <section className="bg-gradient-to-r from-[#1A5C1A] to-[#003087] rounded-lg shadow-sm p-6 text-white">
              <div id="statistics" className="scroll-mt-24 mb-6">
                <h2 className="text-2xl border-b-2 border-[#FF6B00] pb-2 inline-block" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                  Portal Statistics
                </h2>
                <p className="text-xs text-green-200 mt-1" style={{ fontFamily: "Noto Sans Devanagari, sans-serif" }}>
                  पोर्टल आँकड़े
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: "Total Proposals Received", labelHi: "कुल प्रस्ताव प्राप्त", value: 172450, suffix: "+" },
                  { label: "Clearances Granted", labelHi: "मंजूरी प्रदान", value: 124583, suffix: "+" },
                  { label: "Registered Users", labelHi: "पंजीकृत उपयोगकर्ता", value: 58930, suffix: "+" },
                  { label: "States/UTs Covered", labelHi: "राज्य/केंद्र शासित प्रदेश", value: 36, suffix: "" },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-3xl mb-1" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                    </div>
                    <p className="text-green-100 text-xs">{stat.label}</p>
                    <p className="text-green-300/50 text-xs mt-0.5" style={{ fontFamily: "Noto Sans Devanagari, sans-serif" }}>{stat.labelHi}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-white/20">
                {[
                  { label: "EC Proposals Processed", value: 78452, suffix: "+" },
                  { label: "FC Proposals Processed", value: 52341, suffix: "+" },
                  { label: "WL Proposals Processed", value: 18920, suffix: "+" },
                  { label: "CRZ Proposals Processed", value: 22737, suffix: "+" },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl mb-1" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                    </div>
                    <p className="text-green-200/80 text-xs">{stat.label}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Contact & Helpdesk ──────────────────────────── */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <SectionHeading id="contact" title="Contact & Helpdesk" titleHi="संपर्क और हेल्पडेस्क" />

              <div className="grid md:grid-cols-2 gap-5 mb-5">
                <div className="border border-gray-200 rounded-lg p-5">
                  <h4 className="text-sm text-[#003087] mb-3 flex items-center gap-2">
                    <Landmark className="w-4 h-4" />
                    Ministry of Environment, Forest and Climate Change
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400 mt-0.5" />
                      <span>Indira Paryavaran Bhawan, Jorbagh Road, Aliganj, New Delhi – 110003</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>011-2436 0721 / 011-2436 0678</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>secy-moef@gov.in</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a href="#" className="text-[#003087] hover:underline">moef.gov.in</a>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-5">
                  <h4 className="text-sm text-[#1A5C1A] mb-3 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    PARIVESH Helpdesk
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 flex-shrink-0 text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-[#1A5C1A]">Toll Free: 1800-11-2345</span>
                        <p className="text-xs text-gray-400">Monday to Friday, 9:30 AM to 5:30 PM</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>parivesh-moefcc@gov.in</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>parivesh.nic@gmail.com <span className="text-xs text-gray-400">(Technical Support)</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a href="#" className="text-[#003087] hover:underline">parivesh.nic.in</a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#FFF8F0] rounded-lg p-4 border border-orange-200">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#FF6B00] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm text-[#FF6B00] mb-1">Important Notice / महत्वपूर्ण सूचना</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      For any grievance or complaint regarding delay in processing of proposals, project proponents may approach the Centralized Public Grievance Redress and Monitoring System (CPGRAMS) at <a href="#" className="text-[#003087] hover:underline">pgportal.gov.in</a>. Technical issues related to the PARIVESH portal may be reported to the NIC helpdesk at the email addresses provided above.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ── CTA Bar ─────────────────────────────────────── */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <h3 className="text-lg text-[#1A5C1A] mb-2" style={{ fontFamily: "Rajdhani, sans-serif" }}>
                Begin Your Clearance Journey
              </h3>
              <p className="text-xs text-gray-400 mb-1" style={{ fontFamily: "Noto Sans Devanagari, sans-serif" }}>
                अपनी मंजूरी यात्रा शुरू करें
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Select your role and access the portal to submit, track, or review environmental clearance proposals.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={() => navigate("/login")}
                  className="bg-[#1A5C1A] text-white px-6 py-2.5 rounded-lg hover:bg-[#145014] transition-colors text-sm flex items-center gap-2"
                >
                  Login / Register
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="bg-[#003087] text-white px-6 py-2.5 rounded-lg hover:bg-[#002060] transition-colors text-sm flex items-center gap-2"
                >
                  Back to Home
                </button>
              </div>
            </div>

          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

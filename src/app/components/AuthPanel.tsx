import { useState, useEffect } from "react";
import { X, Eye, EyeOff, RefreshCw, ChevronDown, LogIn, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { loginUser, persistAuthSession, registerUser } from "../services/auth";

/* ─────────────────────────────────────────
   Constants
───────────────────────────────────────── */
const BG_IMAGE =
  "https://images.unsplash.com/photo-1759855021430-d6e2121b6928?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGZvcmVzdCUyMHZhbGxleSUyMG1pc3R5JTIwSW5kaWElMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzczNDExODYzfDA&ixlib=rb-4.1.0&q=80&w=1080";

const CAPTCHA_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CAPTCHA_COLORS = ["#c0392b", "#1A5C1A", "#003087", "#e67e22", "#8e44ad", "#16a085"];

function genCaptcha(len = 6) {
  return Array.from({ length: len }, () => CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)]).join("");
}

const ROLES = [
  "Project Proponent",
  "Scrutiny Team Member",
  "MoM Team Member",
  "State Government Official",
  "Central Government Official",
  "Consultant / EIA Coordinator",
  "Public / Citizen",
];

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi",
  "Jammu & Kashmir","Ladakh","Puducherry",
];

type Mode = "login" | "register";

/* ─────────────────────────────────────────
   Styled Captcha Display
───────────────────────────────────────── */
function CaptchaBox({ text }: { text: string }) {
  return (
    <div
      className="flex items-center justify-center gap-0.5 rounded select-none flex-shrink-0"
      style={{
        background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)",
        padding: "6px 14px",
        minWidth: 116,
        height: 44,
        border: "1px solid #333",
      }}
    >
      {text.split("").map((ch, i) => (
        <span
          key={i}
          style={{
            color: CAPTCHA_COLORS[i % CAPTCHA_COLORS.length],
            fontFamily: "monospace",
            fontSize: 20,
            fontWeight: 700,
            transform: `rotate(${(i % 2 === 0 ? 1 : -1) * (5 + (i * 3) % 10)}deg) translateY(${i % 2 === 0 ? -1 : 2}px)`,
            display: "inline-block",
            letterSpacing: 1,
            textShadow: "0 1px 3px rgba(0,0,0,0.7)",
          }}
        >
          {ch}
        </span>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   Reusable Field components
───────────────────────────────────────── */
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block mb-1" style={{ fontSize: 12.5, color: "#444", fontWeight: 500 }}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#1A5C1A] focus:border-transparent transition-shadow placeholder:text-gray-300";

function SelectField({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls + " appearance-none pr-8 cursor-pointer"}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}

/* ─────────────────────────────────────────
   Left Hero Panel (shared)
───────────────────────────────────────── */
function HeroPanel() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[#061a06]">
      {/* BG image */}
      <img src={BG_IMAGE} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A5C1A]/70 via-transparent to-[#003087]/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

      {/* Decorative mandala ring (SVG) */}
      <motion.div
        className="absolute opacity-10"
        style={{ width: 420, height: 420 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 420 420" className="w-full h-full" fill="none">
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i / 24) * Math.PI * 2;
            const r1 = 180, r2 = 205;
            return (
              <line
                key={i}
                x1={210 + r1 * Math.cos(a)} y1={210 + r1 * Math.sin(a)}
                x2={210 + r2 * Math.cos(a)} y2={210 + r2 * Math.sin(a)}
                stroke="white" strokeWidth={i % 3 === 0 ? 2 : 1}
              />
            );
          })}
          <circle cx="210" cy="210" r="180" stroke="white" strokeWidth="1" />
          <circle cx="210" cy="210" r="155" stroke="white" strokeWidth="0.5" strokeDasharray="4 6" />
          <circle cx="210" cy="210" r="130" stroke="white" strokeWidth="1" />
        </svg>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 text-center px-12 max-w-sm">
        {/* Emblem placeholder */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 border border-white/30 flex items-center justify-center">
          <span className="text-3xl">🌿</span>
        </div>

        <p className="text-white/60 mb-1" style={{ fontSize: 11, letterSpacing: 2 }}>
          GOVERNMENT OF INDIA
        </p>
        <h1 style={{ fontSize: 38, fontWeight: 900, color: "#4ADE80", letterSpacing: 3 }} className="mb-1">
          PARIVESH
        </h1>
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-px flex-1 bg-white/20" />
          <span className="text-white/50 text-xs">3.0</span>
          <div className="h-px flex-1 bg-white/20" />
        </div>

        <p className="mb-5" style={{ fontSize: 12, lineHeight: 2, color: "rgba(255,255,255,0.8)" }}>
          <b style={{ color: "#4ADE80" }}>P</b>ro-Active and&nbsp;
          <b style={{ color: "#4ADE80" }}>R</b>esponsive facilitation by&nbsp;
          <b style={{ color: "#4ADE80" }}>I</b>nteractive,&nbsp;
          <b style={{ color: "#FB923C" }}>V</b>irtuous&nbsp;
          <b style={{ color: "#FB923C" }}>E</b>nvironmental&nbsp;
          <b style={{ color: "#FB923C" }}>S</b>ingle-window&nbsp;
          <b style={{ color: "#FB923C" }}>H</b>ub
        </p>

        <p className="text-white/40" style={{ fontSize: 11 }}>
          Ministry of Environment, Forest &amp; Climate Change
        </p>
      </div>

      {/* Bottom strip */}
      <div className="absolute bottom-0 left-0 right-0 py-2.5 px-4 text-center bg-black/40 backdrop-blur-sm border-t border-white/10">
        <p className="text-white/40" style={{ fontSize: 10 }}>
          Designed, Developed &amp; Hosted by NIC, MeitY · Government of India
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Login Form
───────────────────────────────────────── */
function LoginForm({ onClose, onSwitch }: { onClose: () => void; onSwitch: () => void }) {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [captcha, setCaptcha] = useState(genCaptcha);
  const [captchaIn, setCaptchaIn] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshCaptcha = () => { setCaptcha(genCaptcha()); setCaptchaIn(""); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!loginId.trim()) return setError("Please enter your Login ID.");
    if (!password)       return setError("Please enter your password.");
    if (captchaIn.toUpperCase() !== captcha) {
      setError("Captcha does not match. Please try again.");
      refreshCaptcha();
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await loginUser({ loginId: loginId.trim(), password });
      persistAuthSession(result);
      onClose();
      navigate(result.redirectTo || "/proponent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      refreshCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-8 pt-8 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-[#1A5C1A] flex items-center justify-center">
            <LogIn className="w-3.5 h-3.5 text-white" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1A1A1A" }}>Log In</h2>
        </div>
        <p style={{ fontSize: 12, color: "#888" }}>Sign in to your PARIVESH account</p>
      </div>

      {/* Form body */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-md px-3 py-2.5 mb-5 text-xs">
            <span className="mt-0.5 flex-shrink-0">⚠</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Login ID */}
          <Field label="Login ID" required>
            <input
              autoFocus
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className={inputCls}
              placeholder="Enter your login ID"
            />
          </Field>

          {/* Password */}
          <Field label="Password" required>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls + " pr-10"}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex justify-end mt-1">
              <button type="button" className="text-xs text-[#003087] hover:underline font-medium">
                Forgot Password?
              </button>
            </div>
          </Field>

          {/* Captcha */}
          <Field label="Enter the characters shown below" required>
            <div className="flex items-center gap-2">
              <CaptchaBox text={captcha} />
              <button
                type="button"
                onClick={refreshCaptcha}
                title="Refresh captcha"
                className="flex-shrink-0 w-10 h-10 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#1A5C1A] transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={captchaIn}
                onChange={(e) => setCaptchaIn(e.target.value)}
                placeholder="Type captcha here"
                className={inputCls}
                maxLength={6}
              />
            </div>
          </Field>

          {/* Attention */}
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-xs text-red-800 leading-relaxed">
              <span className="font-bold text-red-600 uppercase tracking-wide">⚠ Attention: </span>
              This portal is for authorised users only. Unauthorised access is a punishable offence under
              the IT Act, 2000. All activities are monitored and recorded.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-md text-white font-semibold tracking-widest uppercase text-sm transition-all
                       bg-[#1A5C1A] hover:bg-[#145014] active:scale-[0.98] shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "PLEASE WAIT..." : "LOGIN"}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="px-8 py-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
        <p className="text-center text-xs text-gray-500">
          New to PARIVESH?{" "}
          <button onClick={onSwitch} className="text-[#1A5C1A] font-semibold hover:underline">
            Register here
          </button>
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Registration Form
───────────────────────────────────────── */
function RegistrationForm({ onClose, onSwitch }: { onClose: () => void; onSwitch: () => void }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "", loginId: "", email: "", mobile: "",
    organization: "", role: "", state: "", password: "", confirmPwd: "",
  });
  const [demoOtp, setDemoOtp] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [captcha, setCaptcha] = useState(genCaptcha);
  const [captchaIn, setCaptchaIn] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const refreshCaptcha = () => { setCaptcha(genCaptcha()); setCaptchaIn(""); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.fullName.trim())  return setError("Full Name is required.");
    if (!form.loginId.trim())   return setError("Login ID is required.");
    if (!form.email.includes("@")) return setError("Enter a valid email address.");
    if (form.mobile.length < 10) return setError("Enter a valid 10-digit mobile number.");
    if (!form.role)              return setError("Please select your role.");
    if (!form.state)             return setError("Please select your state.");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirmPwd) return setError("Passwords do not match.");
    if (!/^\d{4}$/.test(demoOtp)) return setError("Enter demo OTP as any 4-digit number.");
    if (captchaIn.toUpperCase() !== captcha) {
      setError("Captcha does not match.");
      refreshCaptcha();
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await registerUser({
        fullName: form.fullName.trim(),
        loginId: form.loginId.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        organization: form.organization.trim(),
        role: form.role,
        state: form.state,
        password: form.password,
      });
      persistAuthSession(result);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      refreshCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10 px-10 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5 border-4 border-[#1A5C1A]/20"
        >
          <svg viewBox="0 0 24 24" className="w-10 h-10 text-[#1A5C1A]" fill="none">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
        <h3 className="mb-2" style={{ fontSize: 20, fontWeight: 700, color: "#1A5C1A" }}>
          Registration Successful!
        </h3>
        <p className="text-sm text-gray-500 mb-7 max-w-xs">
          Your account has been created successfully. You can now log in with your credentials.
        </p>
        <button
          onClick={onSwitch}
          className="bg-[#1A5C1A] text-white px-10 py-2.5 rounded-md text-sm font-semibold hover:bg-[#145014] transition-colors"
        >
          Proceed to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-8 pt-7 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-[#1A5C1A] flex items-center justify-center">
            <UserPlus className="w-3.5 h-3.5 text-white" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1A1A1A" }}>New Registration</h2>
        </div>
        <p style={{ fontSize: 12, color: "#888" }}>Create your PARIVESH account</p>
      </div>

      {/* Form body */}
      <div className="flex-1 overflow-y-auto px-8 py-5">
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-md px-3 py-2.5 mb-4 text-xs">
            <span className="mt-0.5 flex-shrink-0">⚠</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full Name" required>
              <input value={form.fullName} onChange={set("fullName")} className={inputCls} placeholder="As per Aadhaar" />
            </Field>
            <Field label="Login ID" required>
              <input value={form.loginId} onChange={set("loginId")} className={inputCls} placeholder="Choose a unique ID" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Email Address" required>
              <input type="email" value={form.email} onChange={set("email")} className={inputCls} placeholder="user@domain.com" />
            </Field>
            <Field label="Mobile Number" required>
              <input type="tel" maxLength={10} value={form.mobile} onChange={set("mobile")} className={inputCls} placeholder="10-digit number" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Role / User Type" required>
              <SelectField value={form.role} onChange={(v) => setForm(f => ({ ...f, role: v }))}
                options={ROLES} placeholder="Select role" />
            </Field>
            <Field label="State / UT" required>
              <SelectField value={form.state} onChange={(v) => setForm(f => ({ ...f, state: v }))}
                options={STATES} placeholder="Select state" />
            </Field>
          </div>

          <Field label="Organisation / Department">
            <input value={form.organization} onChange={set("organization")} className={inputCls} placeholder="Optional" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Password" required>
              <div className="relative">
                <input type={showPwd ? "text" : "password"} value={form.password} onChange={set("password")}
                  className={inputCls + " pr-10"} placeholder="Min. 8 characters" />
                <button type="button" tabIndex={-1} onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>
            <Field label="Confirm Password" required>
              <div className="relative">
                <input type={showConfirm ? "text" : "password"} value={form.confirmPwd} onChange={set("confirmPwd")}
                  className={inputCls + " pr-10"} placeholder="Re-enter password" />
                <button type="button" tabIndex={-1} onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>
          </div>

          {/* Captcha */}
          <Field label="Enter the characters shown below" required>
            <div className="flex items-center gap-2">
              <CaptchaBox text={captcha} />
              <button type="button" onClick={refreshCaptcha}
                className="flex-shrink-0 w-10 h-10 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#1A5C1A] transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
              <input value={captchaIn} onChange={(e) => setCaptchaIn(e.target.value)}
                placeholder="Type captcha" className={inputCls} maxLength={6} />
            </div>
          </Field>

          <Field label="Demo OTP (any 4 digits)" required>
            <input
              value={demoOtp}
              onChange={(e) => setDemoOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="Enter 4-digit OTP"
              className={inputCls}
              inputMode="numeric"
              maxLength={4}
            />
          </Field>

          {/* Attention */}
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-xs text-red-800 leading-relaxed">
              <span className="font-bold text-red-600 uppercase tracking-wide">⚠ Attention: </span>
              Registration is for authorised users only. Misuse of this portal is a punishable
              offence under the IT Act, 2000.
            </p>
          </div>

          <button type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-md text-white font-semibold tracking-widest uppercase text-sm
                       bg-[#1A5C1A] hover:bg-[#145014] active:scale-[0.98] transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
            {isSubmitting ? "PLEASE WAIT..." : "REGISTER"}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="px-8 py-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
        <p className="text-center text-xs text-gray-500">
          Already registered?{" "}
          <button onClick={onSwitch} className="text-[#1A5C1A] font-semibold hover:underline">
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main Auth Modal
───────────────────────────────────────── */
interface AuthPanelProps {
  mode: Mode;
  onClose: () => void;
  onSwitchMode: (m: Mode) => void;
}

export function AuthPanel({ mode, onClose, onSwitchMode }: AuthPanelProps) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="auth-backdrop"
        className="fixed inset-0 z-[990] bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Dialog */}
      <motion.div
        key="auth-dialog"
        className="fixed inset-0 z-[991] flex items-center justify-center p-4 pointer-events-none"
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      >
        <div
          className="pointer-events-auto w-full flex overflow-hidden rounded-2xl shadow-2xl bg-white"
          style={{ maxWidth: 900, height: "min(680px, 94vh)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left hero (hidden on mobile) */}
          <div className="hidden md:block w-[42%] flex-shrink-0 relative">
            <HeroPanel />
          </div>

          {/* Right form panel */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* Tab bar */}
            <div className="flex flex-shrink-0 bg-gray-50 border-b border-gray-200">
              {(["login", "register"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => onSwitchMode(m)}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-all relative ${
                    mode === m
                      ? "text-[#1A5C1A] bg-white"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {m === "login" ? "Login" : "Registration"}
                  {mode === m && (
                    <motion.div
                      layoutId="auth-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1A5C1A] rounded-t"
                    />
                  )}
                </button>
              ))}

              {/* Close */}
              <button
                onClick={onClose}
                className="px-4 text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                className="flex-1 overflow-hidden flex flex-col"
              >
                {mode === "login"
                  ? <LoginForm onClose={onClose} onSwitch={() => onSwitchMode("register")} />
                  : <RegistrationForm onClose={onClose} onSwitch={() => onSwitchMode("login")} />
                }
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────
   Nav Trigger Buttons
───────────────────────────────────────── */
export function AuthButtons() {
  const [open, setOpen] = useState<Mode | null>(null);

  return (
    <>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setOpen(open === "login" ? null : "login")}
          className="flex items-center gap-1 px-3 py-1 rounded text-white font-semibold
                     transition-all hover:brightness-110 active:scale-95"
          style={{ fontSize: 12, background: "#1A5C1A", border: "1.5px solid rgba(255,255,255,0.25)" }}
        >
          <LogIn className="w-2.5 h-2.5" />
          Login
          <ChevronDown className="w-2.5 h-2.5 opacity-70" />
        </button>

        <button
          onClick={() => setOpen(open === "register" ? null : "register")}
          className="flex items-center gap-1 px-3 py-1 rounded text-[#1A5C1A] font-semibold
                     bg-white transition-all hover:bg-green-50 active:scale-95"
          style={{ fontSize: 12, border: "1.5px solid #1A5C1A" }}
        >
          <UserPlus className="w-2.5 h-2.5" />
          Registration
          <ChevronDown className="w-2.5 h-2.5 opacity-70" />
        </button>
      </div>

      {open && (
        <AuthPanel
          mode={open}
          onClose={() => setOpen(null)}
          onSwitchMode={(m) => setOpen(m)}
        />
      )}
    </>
  );
}
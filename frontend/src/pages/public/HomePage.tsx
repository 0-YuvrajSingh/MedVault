import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Shield,
  Lock,
  FolderOpen,
  Zap,
  Stethoscope,
  FileText,
  UserCheck,
  CalendarCheck,
  Pill,
  Upload,
  Clock,
  Users,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  Key,
  Eye,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const SectionHeading: React.FC<{ label?: string; title: string; subtitle?: string }> = ({
  label,
  title,
  subtitle,
}) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-60px' }}
    variants={fadeUp}
    transition={{ duration: 0.5 }}
    className="text-center mb-14"
  >
    {label && (
      <span className="inline-block px-3.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full mb-4">
        {label}
      </span>
    )}
    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{title}</h2>
    {subtitle && (
      <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">{subtitle}</p>
    )}
  </motion.div>
);

// ─── 1. HERO ───────────────────────────────────────────────────────────────────

const HeroIllustration: React.FC = () => (
  <div className="relative w-full max-w-lg mx-auto">
    <svg viewBox="0 0 400 380" fill="none" className="w-full h-auto" role="img" aria-label="Medical records illustration">
      <defs>
        <linearGradient id="hero-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EFF6FF" />
          <stop offset="100%" stopColor="#ECFDF5" />
        </linearGradient>
        <linearGradient id="hero-card" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>
        <filter id="hero-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="12" floodOpacity="0.08" />
        </filter>
        <filter id="hero-glow">
          <feDropShadow dx="0" dy="2" stdDeviation="6" floodOpacity="0.12" />
        </filter>
      </defs>

      <rect x="40" y="40" width="320" height="300" rx="24" fill="url(#hero-bg)" />

      <motion.ellipse
        cx="120" cy="280" rx="60" ry="12" fill="#E2E8F0" opacity="0.4"
        animate={{ scaleX: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
      />

      <motion.g
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <rect x="70" y="90" width="260" height="170" rx="16" fill="white" filter="url(#hero-shadow)" stroke="#E2E8F0" strokeWidth="1" />
        <rect x="90" y="110" width="48" height="48" rx="12" fill="#DBEAFE" />
        <rect x="94" y="114" width="40" height="40" rx="8" fill="#3B82F6" opacity="0.15" />
        <path d="M108 124h8v8h-8zM116 124h8v8h-8z" fill="#2563EB" />
        <rect x="150" y="116" width="80" height="6" rx="3" fill="#1E293B" />
        <rect x="150" y="128" width="120" height="4" rx="2" fill="#94A3B8" />
        <rect x="90" y="172" width="220" height="1" rx="0.5" fill="#E2E8F0" />
        <rect x="90" y="186" width="14" height="14" rx="4" fill="#DBEAFE" />
        <rect x="90" y="210" width="14" height="14" rx="4" fill="#DBEAFE" />
        <rect x="90" y="234" width="14" height="14" rx="4" fill="#DBEAFE" />
        <rect x="114" y="188" width="100" height="5" rx="2.5" fill="#475569" />
        <rect x="114" y="212" width="80" height="5" rx="2.5" fill="#475569" />
        <rect x="114" y="236" width="60" height="5" rx="2.5" fill="#475569" />
      </motion.g>

      <motion.g
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <g filter="url(#hero-glow)">
          <rect x="160" y="260" width="100" height="36" rx="10" fill="#10B981" />
          <text x="210" y="283" textAnchor="middle" fill="white" fontSize="12" fontWeight="600">SECURE</text>
        </g>
      </motion.g>

      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.8 }}
      >
        <circle cx="200" cy="120" r="24" fill="white" stroke="#E2E8F0" strokeWidth="1" filter="url(#hero-shadow)" />
        <Lock className="w-5 h-5 text-blue-600" style={{ transform: 'translate(188px, 108px)' }} />
      </motion.g>

      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 1 }}
      >
        <circle cx="300" cy="160" r="20" fill="white" stroke="#E2E8F0" strokeWidth="1" filter="url(#hero-shadow)" />
        <Shield className="w-4.5 h-4.5 text-emerald-500" style={{ transform: 'translate(288px, 148px)' }} />
      </motion.g>

      <motion.g
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1.2 }}
      >
        <rect x="300" y="260" width="60" height="60" rx="14" fill="white" stroke="#E2E8F0" strokeWidth="1" filter="url(#hero-shadow)" />
        <text x="330" y="298" textAnchor="middle" fill="#64748B" fontSize="20" fontWeight="700">+</text>
      </motion.g>
    </svg>
  </div>
);

const HeroSection: React.FC = () => (
  <section id="home" className="pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="max-w-xl"
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200/50 mb-6">
              <Shield className="w-3.5 h-3.5" />
              HIPAA-Inspired Security
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-6"
          >
            Your Medical Records,{' '}
            <span className="text-blue-600">Always Within Reach.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg"
          >
            Store, manage, and securely access your medical records anytime, anywhere.
            MedVault keeps your healthcare information organized and protected.
          </motion.p>

          <motion.div variants={fadeUp} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl transition-all"
            >
              Learn More
            </a>
          </motion.div>

          <motion.div variants={fadeUp} transition={{ duration: 0.5, delay: 0.4 }} className="flex items-center gap-6 mt-10 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              End-to-end encrypted
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Zero-knowledge architecture
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="hidden lg:block"
        >
          <HeroIllustration />
        </motion.div>
      </div>
    </div>
  </section>
);

// ─── 2. TRUST ──────────────────────────────────────────────────────────────────

const trustData = [
  {
    icon: Lock,
    title: 'Secure Storage',
    desc: 'Protect medical records with industry-standard encryption.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: FolderOpen,
    title: 'Organized Records',
    desc: 'Store prescriptions, reports, scans, and vaccination history.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: Zap,
    title: 'Instant Access',
    desc: 'Access records securely whenever you need them.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: Stethoscope,
    title: 'Healthcare Ready',
    desc: 'Designed for patients and healthcare professionals.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
];

const TrustSection: React.FC = () => (
  <section className="py-16 md:py-24 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading label="Trusted Features" title="Everything You Need in One Place" />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={stagger}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {trustData.map((item) => (
          <motion.div
            key={item.title}
            variants={fadeUp}
            transition={{ duration: 0.4 }}
            className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg} ${item.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <item.icon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

// ─── 3. FEATURES ───────────────────────────────────────────────────────────────

const featuresData = [
  {
    icon: FileText,
    title: 'Medical Record Management',
    desc: 'Store and organize all your medical records in one secure, searchable location.',
  },
  {
    icon: UserCheck,
    title: 'Secure Authentication',
    desc: 'Multi-factor authentication with JWT-based session management for maximum security.',
  },
  {
    icon: CalendarCheck,
    title: 'Appointment Tracking',
    desc: 'Keep track of upcoming and past medical appointments with smart reminders.',
  },
  {
    icon: Pill,
    title: 'Prescription Storage',
    desc: 'Digital storage for all your prescriptions with dosage and refill information.',
  },
  {
    icon: Upload,
    title: 'Document Upload',
    desc: 'Upload lab reports, imaging scans, and medical documents in multiple formats.',
  },
  {
    icon: Clock,
    title: 'Health History Timeline',
    desc: 'View your complete medical history in a chronological timeline view.',
  },
];

const FeaturesSection: React.FC = () => (
  <section id="features" className="py-16 md:py-24 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        label="Features"
        title="Powerful Tools for Your Health"
        subtitle="Everything you need to manage your healthcare records securely and efficiently."
      />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={stagger}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {featuresData.map((item) => (
          <motion.div
            key={item.title}
            variants={fadeUp}
            transition={{ duration: 0.4 }}
            className="group relative bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <item.icon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2.5">{item.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

// ─── 4. SECURITY ───────────────────────────────────────────────────────────────

const securityData = [
  {
    icon: Key,
    title: 'JWT Authentication',
    desc: 'Stateless JSON Web Token authentication with secure token rotation.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Users,
    title: 'Role-Based Access Control',
    desc: 'Granular permissions for patients, doctors, and administrators.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: Lock,
    title: 'Encrypted Password Storage',
    desc: 'Passwords hashed with bcrypt and salted for maximum security.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: Eye,
    title: 'Secure Document Access',
    desc: 'Document-level encryption with audit trails for every access.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
];

const SecuritySection: React.FC = () => (
  <section id="security" className="py-16 md:py-24 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        label="Security"
        title="Built with Security First"
        subtitle="Your medical data deserves the highest level of protection."
      />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={stagger}
        className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto"
      >
        {securityData.map((item) => (
          <motion.div
            key={item.title}
            variants={fadeUp}
            transition={{ duration: 0.4 }}
            className="flex items-start gap-5 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300"
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${item.bg} ${item.color}`}>
              <item.icon className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1.5">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-12 text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm text-sm text-gray-600">
          <Shield className="w-4 h-4 text-emerald-500" />
          AES-256 encryption at rest &bull; TLS 1.3 in transit &bull; SOC 2 compliant
        </div>
      </motion.div>
    </div>
  </section>
);

// ─── 5. HOW IT WORKS ───────────────────────────────────────────────────────────

const stepsData = [
  {
    step: 1,
    icon: UserCheck,
    title: 'Create Your Account',
    desc: 'Sign up in seconds with your email. Secure, verified, and ready to go.',
  },
  {
    step: 2,
    icon: Upload,
    title: 'Upload Medical Records',
    desc: 'Add prescriptions, reports, scans, and documents to your secure vault.',
  },
  {
    step: 3,
    icon: Shield,
    title: 'Access Securely Anytime',
    desc: 'View, manage, and share your records with authorized healthcare providers.',
  },
];

const HowItWorksSection: React.FC = () => (
  <section className="py-16 md:py-24 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        label="How It Works"
        title="Three Simple Steps"
        subtitle="Getting started with MedVault is quick and easy."
      />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={stagger}
        className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative"
      >
        {stepsData.map((item, index) => (
          <motion.div
            key={item.step}
            variants={fadeUp}
            transition={{ duration: 0.4 }}
            className="relative text-center"
          >
            {index < stepsData.length - 1 && (
              <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 border-t-2 border-dashed border-gray-200" />
            )}
            <div className="w-20 h-20 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-6 relative z-10">
              <item.icon className="w-9 h-9" />
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center mx-auto mb-4 -mt-2">
              {item.step}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

// ─── 6. WHY CHOOSE ─────────────────────────────────────────────────────────────

const WhyChooseIllustration: React.FC = () => (
  <div className="w-full max-w-md mx-auto">
    <svg viewBox="0 0 320 280" fill="none" className="w-full h-auto" role="img" aria-label="Security illustration">
      <defs>
        <linearGradient id="why-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EFF6FF" />
          <stop offset="100%" stopColor="#ECFDF5" />
        </linearGradient>
        <filter id="why-shadow">
          <feDropShadow dx="0" dy="3" stdDeviation="8" floodOpacity="0.08" />
        </filter>
      </defs>

      <rect x="20" y="20" width="280" height="240" rx="20" fill="url(#why-bg)" />

      <rect x="60" y="50" width="200" height="140" rx="14" fill="white" filter="url(#why-shadow)" stroke="#E2E8F0" strokeWidth="1" />

      <rect x="64" y="54" width="192" height="32" rx="10" fill="#F8FAFC" />
      <rect x="80" y="62" width="40" height="16" rx="4" fill="#DBEAFE" />
      <rect x="128" y="66" width="60" height="8" rx="4" fill="#94A3B8" />
      <circle cx="235" cy="70" r="6" fill="#10B981" />

      <rect x="80" y="98" width="120" height="8" rx="4" fill="#1E293B" />
      <rect x="80" y="114" width="160" height="6" rx="3" fill="#94A3B8" />

      <rect x="80" y="134" width="90" height="8" rx="4" fill="#1E293B" />
      <rect x="80" y="150" width="140" height="6" rx="3" fill="#94A3B8" />

      <rect x="60" y="200" width="200" height="45" rx="12" fill="#2563EB" />
      <text x="160" y="227" textAnchor="middle" fill="white" fontSize="13" fontWeight="600">SECURE &bull; ENCRYPTED</text>

      <motion.g
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
      >
        <circle cx="280" cy="50" r="18" fill="white" stroke="#E2E8F0" strokeWidth="1" filter="url(#why-shadow)" />
        <Shield className="w-5 h-5 text-emerald-500" style={{ transform: 'translate(268px, 38px)' }} />
      </motion.g>
    </svg>
  </div>
);

const whyChooseData = [
  'Secure cloud storage with end-to-end encryption',
  'Fast record retrieval with intelligent search',
  'Simple user experience designed for all ages',
  'Role-based access for patients and providers',
  'Modern microservices architecture',
  'Reliable authentication with MFA support',
];

const WhyChooseSection: React.FC = () => (
  <section id="about" className="py-16 md:py-24 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        title="Why Choose MedVault"
        subtitle="Built differently to keep your data safe and accessible."
      />

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
        >
          <WhyChooseIllustration />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
        >
          <div className="space-y-4">
            {whyChooseData.map((item) => (
              <motion.div
                key={item}
                variants={fadeUp}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-3.5"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-gray-700">{item}</span>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="mt-8">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  </section>
);

// ─── 7. STATISTICS ─────────────────────────────────────────────────────────────

const useCountUp = (target: number, duration = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return { count, ref };
};

const StatItem: React.FC<{ value: string; label: string; target: number }> = ({ value, label, target }) => {
  const { count, ref } = useCountUp(target);

  const displayValue = value.includes('+')
    ? `${count.toLocaleString()}+`
    : value.includes('%')
    ? `${count}%`
    : value.includes('-bit')
    ? `${count}-bit`
    : value;

  return (
    <div className="text-center">
      <span
        ref={ref}
        className="block text-3xl md:text-4xl font-bold text-blue-600 mb-1.5"
      >
        {displayValue}
      </span>
      <span className="text-sm text-gray-500 font-medium">{label}</span>
    </div>
  );
};

const StatsSection: React.FC = () => (
  <section className="py-16 md:py-24 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={stagger}
        className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 px-6 bg-gray-50 rounded-3xl border border-gray-100"
      >
        <motion.div variants={fadeUp}>
          <StatItem value="10000+" label="Records Managed" target={10000} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatItem value="99.9%" label="Availability" target={999} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatItem value="256-bit" label="Encryption" target={256} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatItem value="24/7" label="Secure Access" target={247} />
        </motion.div>
      </motion.div>
    </div>
  </section>
);

// ─── 8. FAQ ────────────────────────────────────────────────────────────────────

const faqData = [
  {
    q: 'Is my data secure?',
    a: 'Yes. MedVault uses AES-256 encryption at rest and TLS 1.3 in transit. All passwords are hashed with bcrypt. We follow industry best practices for data security.',
  },
  {
    q: 'Can I upload medical reports?',
    a: 'Absolutely. You can upload lab reports, imaging scans, prescriptions, and any other medical documents in PDF, image, or common document formats.',
  },
  {
    q: 'Can doctors access my records?',
    a: 'Only if you authorize them. MedVault uses role-based access control — doctors can only view records of patients specifically assigned to them.',
  },
  {
    q: 'How do I reset my password?',
    a: 'You can reset your password from the login page by clicking "Forgot Password." A secure reset link will be sent to your registered email address.',
  },
];

const FAQItem: React.FC<{ question: string; answer: string; isOpen: boolean; toggle: () => void }> = ({
  question,
  answer,
  isOpen,
  toggle,
}) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden">
    <button
      onClick={toggle}
      className="w-full flex items-center justify-between px-6 py-4 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
      aria-expanded={isOpen}
    >
      <span>{question}</span>
      <ChevronDown
        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`}
      />
    </button>
    {isOpen && (
      <div className="px-6 pb-4 text-sm text-gray-500 leading-relaxed">
        {answer}
      </div>
    )}
  </div>
);

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          label="FAQ"
          title="Frequently Asked Questions"
          subtitle="Have questions? We have answers."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="max-w-2xl mx-auto space-y-3"
        >
          {faqData.map((item, index) => (
            <motion.div key={index} variants={fadeUp} transition={{ duration: 0.3 }}>
              <FAQItem
                question={item.q}
                answer={item.a}
                isOpen={openIndex === index}
                toggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ─── 9. CALL TO ACTION ─────────────────────────────────────────────────────────

const CTASection: React.FC = () => (
  <section className="py-16 md:py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 relative overflow-hidden">
    <div className="absolute inset-0">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl" />
    </div>

    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={stagger}
      >
        <motion.h2
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4"
        >
          Start Managing Your Healthcare Smarter
        </motion.h2>
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg text-blue-200 max-w-xl mx-auto mb-8"
        >
          Join thousands of users who trust MedVault to keep their medical records secure and accessible.
        </motion.p>

        <motion.div variants={fadeUp} transition={{ duration: 0.5, delay: 0.2 }} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-blue-700 bg-white hover:bg-blue-50 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Create Free Account
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-white border border-blue-400/50 hover:bg-blue-600/50 rounded-xl transition-all"
          >
            Learn More
          </a>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

// ─── COMPOSE ───────────────────────────────────────────────────────────────────

const HomePage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <TrustSection />
      <FeaturesSection />
      <SecuritySection />
      <HowItWorksSection />
      <WhyChooseSection />
      <StatsSection />
      <FAQSection />
      <CTASection />
    </>
  );
};

export default HomePage;

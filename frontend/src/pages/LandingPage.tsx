import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar, Shield, Activity, Users, ArrowRight,
  Heart, UserPlus, CheckCircle, Star, Zap, Lock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Feature  { icon: React.ComponentType<{ className?: string }>; title: string; desc: string; color: string; bg: string }
interface RoleCard { icon: React.ComponentType<{ className?: string }>; role: string; desc: string; gradient: string }
interface StepItem { step: string; title: string; desc: string }

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '10k+', label: 'Active Users'     },
  { value: '500+', label: 'Verified Doctors' },
  { value: '1M+',  label: 'Appointments'     },
  { value: '99%',  label: 'Satisfaction'     },
];

const FEATURES: Feature[] = [
  { icon: Calendar, title: 'Smart Scheduling',    desc: 'Book appointments instantly with real-time slot availability. No phone calls, no waiting.',       color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-950/30'    },
  { icon: Shield,   title: 'Bank-grade Security', desc: 'Your medical history is end-to-end encrypted. Access it anywhere — only you control it.',        color: 'text-emerald-600',bg: 'bg-emerald-50 dark:bg-emerald-950/30'},
  { icon: Zap,      title: 'Instant Records',     desc: 'Lab reports, prescriptions, and notes organised automatically and searchable in seconds.',        color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30'  },
  { icon: Users,    title: 'Unified Platform',    desc: 'Patients, doctors, and admins in one ecosystem. Seamless handoffs and no duplicate data.',        color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30'  },
  { icon: Activity, title: 'Health Insights',     desc: 'Track metrics over time. Spot patterns early with AI-assisted health summaries.',                color: 'text-pink-600',   bg: 'bg-pink-50 dark:bg-pink-950/30'      },
  { icon: Lock,     title: 'Access Control',      desc: 'Share specific records with specific doctors. Revoke access at any time with one tap.',           color: 'text-teal-600',   bg: 'bg-teal-50 dark:bg-teal-950/30'      },
];

const ROLES: RoleCard[] = [
  { icon: Heart,    role: 'Patients', desc: 'Book appointments, view records, share documents and stay connected with your care team.',   gradient: 'from-emerald-500 to-teal-500'  },
  { icon: UserPlus, role: 'Doctors',  desc: 'Manage your schedule, access shared patient history, write notes and grow your practice.',  gradient: 'from-violet-500 to-purple-600' },
  { icon: Shield,   role: 'Admins',   desc: 'Oversee users, verify doctor credentials, review documents and generate platform reports.', gradient: 'from-orange-500 to-red-500'    },
];

const HOW_IT_WORKS: StepItem[] = [
  { step: '01', title: 'Create your account',   desc: 'Sign up as a patient or doctor in under 2 minutes. No credit card required.'     },
  { step: '02', title: 'Complete your profile', desc: 'Add your health history, preferences, or professional credentials.'               },
  { step: '03', title: 'Book or accept visits', desc: 'Patients book, doctors confirm — everything synced in real time.'                  },
];

// ─── Animation helpers ────────────────────────────────────────────────────────

const fadeUp  = (delay = 0) => ({ initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, delay } });
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const child   = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

// ─── Component ────────────────────────────────────────────────────────────────
// NOTE: No inline <nav> here — the public Navbar from App.tsx handles navigation
// with Home/Features/Testimonials smooth-scroll links.

const LandingPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 overflow-x-hidden">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      {/* id="hero" matches Navbar's scroll target */}
      <section id="hero" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* BG blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gradient-to-bl from-violet-500/10 to-transparent rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/4" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {/* Tagline badge — matches original brand style */}
              <span className="inline-flex items-center gap-1.5 py-1 px-4 rounded-full bg-admin-100 dark:bg-admin-900/30 text-admin-600 dark:text-admin-400 text-sm font-semibold mb-6 border border-admin-200 dark:border-admin-800">
                ✨ The Future of Healthcare Management
              </span>

              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight text-neutral-900 dark:text-white">
                Healthcare Simplified.{' '}
                <br />
                <span className="bg-gradient-to-r from-admin-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Life Amplified.
                </span>
              </h1>

              <p className="text-xl text-neutral-500 dark:text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                Experience the most advanced medical appointment scheduling and record management platform. Secure, intuitive, and designed for everyone.
              </p>

              {!isAuthenticated() ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link to="/register"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg">
                    Get Started Now <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/login"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl font-semibold text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                    Sign In
                  </Link>
                </div>
              ) : (
                <Link to={`/${user?.role?.toLowerCase()}/dashboard`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }}
              className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-neutral-200 dark:border-neutral-800 pt-10"
            >
              {STATS.map(s => (
                <div key={s.label}>
                  <p className="text-3xl font-bold text-neutral-900 dark:text-white mb-0.5">{s.value}</p>
                  <p className="text-sm text-neutral-500 uppercase tracking-wider font-medium">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      {/* id="features" matches Navbar scroll target */}
      <section id="features" className="py-24 bg-neutral-50 dark:bg-neutral-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
              Why Choose MedVault?
            </h2>
            <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto">
              We bring together patients, doctors, and administrators in one seamless ecosystem.
            </p>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} variants={child}
                  className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-5`}>
                    <Icon className={`w-6 h-6 ${f.color}`} />
                  </div>
                  <h3 className="font-bold text-neutral-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Roles ───────────────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
              Tailored for Every Role
            </h2>
            <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto">
              Whether you're a patient, doctor, or admin — MedVault adapts to you.
            </p>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-3 gap-5">
            {ROLES.map(r => {
              const Icon = r.icon;
              return (
                <motion.div key={r.role} variants={child}
                  className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-7 hover:shadow-lg transition-shadow group">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${r.gradient} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-md`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">{r.role}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{r.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section className="py-24 bg-neutral-50 dark:bg-neutral-900/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
              Up and running in minutes
            </h2>
          </motion.div>
          <div className="space-y-4">
            {HOW_IT_WORKS.map((s, i) => (
              <motion.div key={s.step} {...fadeUp(i * 0.1)}
                className="flex items-start gap-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 hover:shadow-md transition-shadow">
                <span className="text-4xl font-black text-neutral-100 dark:text-neutral-800 flex-shrink-0 leading-none">{s.step}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-neutral-900 dark:text-white mb-1">{s.title}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{s.desc}</p>
                </div>
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials placeholder (id for Navbar scroll) ──────────────────── */}
      {/* id="testimonials" matches Navbar scroll target */}
      <section id="testimonials" className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              Trusted by thousands
            </h2>
            <p className="text-neutral-500 max-w-xl mx-auto">
              Patients and doctors across India rely on MedVault every day.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: 'Priya S.', role: 'Patient', text: 'Booking appointments used to take days. Now it takes 30 seconds. MedVault changed how I manage my health.' },
              { name: 'Dr. Arjun M.', role: 'Cardiologist', text: 'Having all patient records in one place, with proper access controls, has made my practice far more efficient.' },
              { name: 'Rahul K.', role: 'Patient', text: 'I can share specific records with specific doctors. That level of control over my own data is incredible.' },
            ].map((t, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)}
                className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map(s => <Star key={s} size={14} className="fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-neutral-400">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-neutral-50 dark:bg-neutral-900/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp()}
            className="relative rounded-3xl overflow-hidden bg-neutral-900 dark:bg-neutral-800 px-8 py-16 sm:px-16 sm:py-20 text-center">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-b from-admin-500/20 to-transparent blur-3xl" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Healthcare Experience?
              </h2>
              <p className="text-neutral-400 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of users who trust MedVault for their medical management needs.
              </p>
              {!isAuthenticated() && (
                <Link to="/register"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-neutral-900 rounded-xl font-semibold text-sm hover:bg-neutral-100 transition-colors shadow-xl">
                  Create Free Account <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Lock, FileText, Stethoscope, UserCheck, CalendarCheck, Pill, Activity, Clock, Users, ArrowRight, Key, Eye, CheckCircle, ChevronDown
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const SectionHeading: React.FC<{ label?: string; title: string; subtitle?: string }> = ({ label, title, subtitle }) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-60px' }}
    variants={fadeUp}
    transition={{ duration: 0.5 }}
    className="text-center mb-12"
  >
    {label && (
      <span className="inline-block px-3 py-1 text-xs font-semibold text-primary-600 bg-primary-50 rounded-full mb-4">
        {label}
      </span>
    )}
    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">{title}</h2>
    {subtitle && <p className="mt-3 text-lg text-slate-500 max-w-2xl mx-auto">{subtitle}</p>}
  </motion.div>
);

const HeroSection: React.FC = () => (
  <section className="pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-xl">
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-primary-700 bg-primary-50 rounded-full border border-primary-100 mb-6">
              <Shield className="w-3.5 h-3.5" />
              HIPAA-Inspired Security
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6"
          >
            Your Medical Records,{' '}
            <span className="text-primary-600">Always Within Reach.</span>
          </motion.h1>
          <motion.p variants={fadeUp} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-slate-500 leading-relaxed mb-8 max-w-lg"
          >
            Store, manage, and securely access your medical records anytime, anywhere.
            MedVault keeps your healthcare information organized and protected.
          </motion.p>
          <motion.div variants={fadeUp} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col sm:flex-row gap-4">
            <Link to="/register">
              <Button size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                Get Started
              </Button>
            </Link>
            <a href="#features">
              <Button variant="secondary" size="lg">Learn More</Button>
            </a>
          </motion.div>
          <motion.div variants={fadeUp} transition={{ duration: 0.5, delay: 0.4 }} className="flex items-center gap-6 mt-10 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-green-500" />
              End-to-end encrypted
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Role-based access control
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="hidden lg:flex items-center justify-center"
        >
          <div className="relative w-96 h-96">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-blue-50 rounded-3xl" />
            <div className="absolute top-8 left-8 right-8 bottom-8 bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <div className="h-3 w-24 bg-slate-200 rounded" />
                  <div className="h-2 w-16 bg-slate-100 rounded mt-1" />
                </div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <div className="h-3 w-24 bg-slate-200 rounded mb-1" />
                      <div className="h-2 w-32 bg-slate-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="absolute -top-3 -right-3 w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <Lock className="w-6 h-6 text-white" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

const TrustSection: React.FC = () => {
  const trustData = [
    { icon: Lock, title: 'Secure Storage', desc: 'Protect medical records with industry-standard encryption.', color: 'text-primary-600', bg: 'bg-primary-50' },
    { icon: FileText, title: 'Organized Records', desc: 'Store prescriptions, reports, scans, and vaccination history.', color: 'text-green-600', bg: 'bg-green-50' },
    { icon: Activity, title: 'Instant Access', desc: 'Access records securely whenever you need them.', color: 'text-amber-600', bg: 'bg-amber-50' },
    { icon: Stethoscope, title: 'Healthcare Ready', desc: 'Designed for patients and healthcare professionals.', color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <section className="py-16 md:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading label="Trusted Features" title="Everything You Need in One Place" />
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {trustData.map((item) => (
            <motion.div key={item.title} variants={fadeUp} transition={{ duration: 0.4 }}
              className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.bg} ${item.color} mb-4`}>
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1.5">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const FeaturesSection: React.FC = () => {
  const features = [
    { icon: FileText, title: 'Medical Record Management', desc: 'Store and organize all your medical records in one secure, searchable location.' },
    { icon: UserCheck, title: 'Secure Authentication', desc: 'JWT-based session management with role-based access for maximum security.' },
    { icon: CalendarCheck, title: 'Care Timeline', desc: 'Review clinical records and care activity as it is added to your secure portal.' },
    { icon: Pill, title: 'Prescription Storage', desc: 'Digital storage for all your prescriptions with dosage and refill information.' },
    { icon: FileText, title: 'Clinical Records', desc: 'Doctors securely create treatment records that patients can review in their portal.' },
    { icon: Clock, title: 'Health History Timeline', desc: 'View your complete medical history in a chronological timeline view.' },
  ];

  return (
    <section id="features" className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading label="Features" title="Powerful Tools for Your Health" subtitle="Everything you need to manage your healthcare records securely and efficiently." />
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((item) => (
            <motion.div key={item.title} variants={fadeUp} transition={{ duration: 0.4 }}
              className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1.5">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const SecuritySection: React.FC = () => {
  const securityData = [
    { icon: Key, title: 'JWT Authentication', desc: 'Stateless JSON Web Token authentication with secure token rotation.', color: 'text-primary-600', bg: 'bg-primary-50' },
    { icon: Users, title: 'Role-Based Access Control', desc: 'Granular permissions for patients, doctors, and administrators.', color: 'text-green-600', bg: 'bg-green-50' },
    { icon: Lock, title: 'Encrypted Storage', desc: 'Passwords hashed with bcrypt, data encrypted with AES-256 at rest.', color: 'text-amber-600', bg: 'bg-amber-50' },
    { icon: Eye, title: 'Audit Trail', desc: 'Every access is logged in an immutable audit trail for accountability.', color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <section id="security" className="py-16 md:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading label="Security" title="Built with Security First" subtitle="Your medical data deserves the highest level of protection." />
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {securityData.map((item) => (
            <motion.div key={item.title} variants={fadeUp} transition={{ duration: 0.4 }}
              className="flex items-start gap-4 bg-white rounded-xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.bg} ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const HowItWorksSection: React.FC = () => {
  const steps = [
    { step: 1, icon: UserCheck, title: 'Create Your Account', desc: 'Sign up in seconds with your email. Secure, verified, and ready to go.' },
    { step: 2, icon: FileText, title: 'Receive Medical Records', desc: 'Your assigned doctor adds treatment records to your secure portal.' },
    { step: 3, icon: Shield, title: 'Access Securely Anytime', desc: 'View, manage, and share your records with authorized healthcare providers.' },
  ];

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading label="How It Works" title="Three Simple Steps" subtitle="Getting started with MedVault is quick and easy." />
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((item, index) => (
            <motion.div key={item.step} variants={fadeUp} transition={{ duration: 0.4 }} className="relative text-center">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 border-t-2 border-dashed border-slate-200" />
              )}
              <div className="w-16 h-16 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-4 relative z-10">
                <item.icon className="w-7 h-7" />
              </div>
              <div className="w-7 h-7 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center mx-auto mb-3 -mt-2">
                {item.step}
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1.5">{item.title}</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const CtaSection: React.FC = () => (
  <section className="py-16 md:py-20 bg-primary-600 relative overflow-hidden">
    <div className="absolute inset-0">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
    </div>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger}>
        <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
          Start Managing Your Healthcare Smarter
        </motion.h2>
        <motion.p variants={fadeUp} transition={{ duration: 0.5, delay: 0.1 }} className="text-lg text-primary-100 max-w-xl mx-auto mb-8">
          Join thousands of users who trust MedVault to keep their medical records secure and accessible.
        </motion.p>
        <motion.div variants={fadeUp} transition={{ duration: 0.5, delay: 0.2 }} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register">
            <Button variant="secondary" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
              Create Free Account
            </Button>
          </Link>
          <a href="#features">
            <Button variant="ghost" size="lg" className="text-white border border-primary-400 hover:bg-primary-500">
              Learn More
            </Button>
          </a>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = [
    { q: 'Is my data secure?', a: 'Yes. MedVault uses AES-256 encryption at rest and TLS 1.3 in transit. All passwords are hashed with bcrypt. We follow industry best practices for data security.' },
    { q: 'How are my medical records added?', a: 'Your assigned doctor securely creates clinical records, which then appear in your patient portal.' },
    { q: 'Can doctors access my records?', a: 'Only if you authorize them. MedVault uses role-based access control — doctors can only view records of patients specifically assigned to them.' },
    { q: 'How do I change my password?', a: 'After signing in, open Settings and use the Security section to change your password.' },
  ];

  return (
    <section id="faq" className="py-16 md:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading label="FAQ" title="Frequently Asked Questions" subtitle="Have questions? We have answers." />
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger} className="max-w-2xl mx-auto space-y-3">
          {faqs.map((item, index) => (
            <motion.div key={index} variants={fadeUp} transition={{ duration: 0.3 }} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-slate-900 hover:bg-slate-50 transition-colors"
                aria-expanded={openIndex === index}
              >
                <span>{item.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === index && (
                <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">
                  {item.a}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const HomePage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <TrustSection />
      <FeaturesSection />
      <SecuritySection />
      <HowItWorksSection />
      <CtaSection />
      <FaqSection />
    </>
  );
};

export default HomePage;

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';
import { Card } from '@/components/ui';

interface Section { id: string; title: string; content: string }

const SECTIONS: Section[] = [
  { id: 'information-collection', title: '1. Information We Collect', content: `We collect information you provide directly to us, including:\n\n• Personal Information: Name, email address, phone number, date of birth, and address\n• Medical Information: Health records, appointment history, prescriptions, and medical conditions\n• Account Information: Username, password, and security preferences\n• Usage Information: How you interact with our Platform, IP address, browser type, and device information` },
  { id: 'information-use', title: '2. How We Use Your Information', content: `We use the information we collect to:\n\n• Provide, maintain, and improve our services\n• Schedule and manage medical appointments\n• Store and manage your health records securely\n• Communicate with you about appointments and services\n• Comply with legal obligations and regulatory requirements\n• Prevent fraud and enhance security` },
  { id: 'data-security', title: '3. Data Security', content: `We implement industry-standard security measures to protect your information:\n\n• End-to-end encryption for data transmission\n• Secure, encrypted storage of all health records\n• Regular security audits and vulnerability assessments\n• Multi-factor authentication options\n• Access controls and user permission management\n\nDespite our efforts, no security system is impenetrable.` },
  { id: 'hipaa-compliance', title: '4. HIPAA Compliance', content: `MedVault is committed to complying with HIPAA. We maintain strict privacy and security standards to protect your Protected Health Information (PHI):\n\n• Business Associate Agreements with all healthcare providers\n• Minimum necessary disclosure of PHI\n• Patient rights to access, amend, and restrict disclosures\n• Breach notification procedures\n• Comprehensive audit trails of PHI access` },
  { id: 'third-party', title: '5. Third-Party Services', content: `We may share your information with third-party service providers who assist us in operating the Platform:\n\n• Healthcare providers for appointment scheduling\n• Cloud storage providers for secure data hosting\n• Analytics providers to improve our services\n\nAll third parties are bound by confidentiality agreements and must comply with HIPAA.` },
  { id: 'your-rights', title: '6. Your Rights', content: `You have the right to:\n\n• Access your personal and medical information\n• Request corrections to inaccurate information\n• Request deletion of your data (subject to legal requirements)\n• Opt-out of certain data processing activities\n• Receive a copy of your health records\n\nContact our Privacy Officer at privacy@medvault.com.` },
  { id: 'cookies', title: '7. Cookies and Tracking', content: `We use cookies and similar tracking technologies to:\n\n• Remember your preferences and settings\n• Analyze usage patterns and improve our services\n• Provide personalized content and recommendations\n• Monitor and prevent fraudulent activity\n\nYou can control cookie preferences through your browser settings.` },
  { id: 'children', title: "8. Children's Privacy", content: `Our Platform is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information about a child, please contact us immediately.` },
  { id: 'changes', title: '9. Changes to This Policy', content: `We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy and updating the "Last Updated" date. Your continued use of the Platform constitutes acceptance.` },
  { id: 'contact', title: '10. Contact Us', content: `For questions about this Privacy Policy:\n\nEmail: privacy@medvault.com\nHIPAA inquiries: hipaa@medvault.com` },
];

const PrivacyPolicy: React.FC = () => (
  <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-8 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <div className="w-14 h-14 mx-auto mb-5 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-neutral-500">Last updated: November 24, 2025</p>
      </motion.div>

      {/* Intro */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card variant="premium" className="p-7 mb-8 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20">
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
            At MedVault, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. We are committed to protecting your health information in compliance with HIPAA and other applicable privacy laws.
          </p>
        </Card>
      </motion.div>

      {/* TOC */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card variant="premium" className="p-6 mb-8">
          <h2 className="font-bold text-neutral-900 dark:text-white mb-3">Table of Contents</h2>
          <nav className="space-y-1.5">
            {SECTIONS.map(s => (
              <a key={s.id} href={`#${s.id}`} className="block text-sm text-blue-600 dark:text-blue-400 hover:underline">{s.title}</a>
            ))}
          </nav>
        </Card>
      </motion.div>

      {/* Sections */}
      <div className="space-y-5">
        {SECTIONS.map((s, i) => (
          <motion.div key={s.id} id={s.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.04 }}>
            <Card variant="premium" className="p-7 scroll-mt-24">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">{s.title}</h2>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line text-sm">{s.content}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Footer CTA */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-10 text-center">
        <Card variant="premium" className="p-7 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full mb-4 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" /> HIPAA Compliant
          </span>
          <h3 className="font-bold text-neutral-900 dark:text-white mb-2">Your Privacy Matters</h3>
          <p className="text-sm text-neutral-500 mb-5">
            Questions? Contact our Privacy Officer at{' '}
            <a href="mailto:privacy@medvault.com" className="text-blue-600 hover:underline">privacy@medvault.com</a>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/terms" className="px-5 py-2.5 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-xl text-sm font-semibold hover:shadow-md transition-shadow">View Terms</Link>
            <Link to="/register" className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-xl text-sm font-semibold hover:shadow-md transition-shadow">Get Started</Link>
          </div>
        </Card>
      </motion.div>
    </div>
  </div>
);

export default PrivacyPolicy;

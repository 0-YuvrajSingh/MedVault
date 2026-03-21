import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';
import { Card } from '@/components/ui';

interface Section { id: string; title: string; content: string }

const SECTIONS: Section[] = [
  { id: 'acceptance',         title: '1. Acceptance of Terms',        content: `By accessing and using MedVault ("the Platform"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these Terms of Service, please do not use the Platform.` },
  { id: 'services',           title: '2. Use of Services',            content: `MedVault provides a platform for medical appointment scheduling and health record management. You agree to use the Platform only for lawful purposes and in accordance with these Terms. You are prohibited from transmitting any unlawful, harassing, defamatory, or objectionable material.` },
  { id: 'accounts',           title: '3. User Accounts',              content: `To access certain features, you must register for an account. You agree to provide accurate, current, and complete information during registration and to keep it updated. You are responsible for safeguarding your password and for all activities under your account.` },
  { id: 'medical-disclaimer', title: '4. Medical Disclaimer',         content: `MedVault is a platform for scheduling and record management only. It does not provide medical advice, diagnosis, or treatment. Always seek the advice of your physician with any medical questions. Never disregard professional medical advice because of something you read on the Platform.` },
  { id: 'privacy',            title: '5. Privacy and Data Protection',content: `Your privacy is governed by our Privacy Policy, incorporated into these Terms by reference. We comply with HIPAA regulations and maintain strict security measures to protect your health information.` },
  { id: 'liability',          title: '6. Limitation of Liability',    content: `MedVault and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Platform. Our total liability shall not exceed the amount paid by you, if any, during the twelve months prior to the claim.` },
  { id: 'termination',        title: '7. Termination',                content: `We reserve the right to terminate or suspend your account at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.` },
  { id: 'changes',            title: '8. Changes to Terms',           content: `We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the new Terms. Your continued use of the Platform after such modifications constitutes acceptance.` },
  { id: 'contact',            title: '9. Contact Information',        content: `For questions about these Terms:\n\nEmail: legal@medvault.com` },
];

const Terms: React.FC = () => (
  <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-8 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <div className="w-14 h-14 mx-auto mb-5 bg-gradient-to-br from-orange-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
          <FileText className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-neutral-500">Last updated: November 24, 2025</p>
      </motion.div>

      {/* TOC */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
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
          <motion.div key={s.id} id={s.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.04 }}>
            <Card variant="premium" className="p-7 scroll-mt-24">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">{s.title}</h2>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line text-sm">{s.content}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Footer CTA */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-10 text-center">
        <Card variant="premium" className="p-7 bg-gradient-to-br from-orange-50 to-purple-50 dark:from-orange-900/20 dark:to-purple-900/20">
          <h3 className="font-bold text-neutral-900 dark:text-white mb-2">Questions about our Terms?</h3>
          <p className="text-sm text-neutral-500 mb-5">
            Contact our legal team at{' '}
            <a href="mailto:legal@medvault.com" className="text-blue-600 hover:underline">legal@medvault.com</a>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/privacy" className="px-5 py-2.5 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-xl text-sm font-semibold hover:shadow-md transition-shadow">View Privacy Policy</Link>
            <Link to="/register" className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-md transition-shadow">Get Started</Link>
          </div>
        </Card>
      </motion.div>
    </div>
  </div>
);

export default Terms;

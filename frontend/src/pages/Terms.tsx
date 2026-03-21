// @ts-nocheck
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';
import { Card } from '../components/ui';

const Terms = () => {
  const sections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      content: `By accessing and using MedVault ("the Platform"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these Terms of Service, please do not use the Platform.`
    },
    {
      id: 'services',
      title: '2. Use of Services',
      content: `MedVault provides a platform for medical appointment scheduling and health record management. You agree to use the Platform only for lawful purposes and in accordance with these Terms. You are prohibited from using the Platform to transmit any unlawful, harassing, defamatory, or otherwise objectionable material.`
    },
    {
      id: 'accounts',
      title: '3. User Accounts',
      content: `To access certain features of the Platform, you must register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate. You are responsible for safeguarding your password and for all activities under your account.`
    },
    {
      id: 'medical-disclaimer',
      title: '4. Medical Disclaimer',
      content: `MedVault is a platform for scheduling and record management only. The Platform does not provide medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read on the Platform.`
    },
    {
      id: 'privacy',
      title: '5. Privacy and Data Protection',
      content: `Your privacy is important to us. Our use of your personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. We comply with HIPAA regulations and maintain strict security measures to protect your health information.`
    },
    {
      id: 'liability',
      title: '6. Limitation of Liability',
      content: `MedVault and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Platform. Our total liability shall not exceed the amount paid by you, if any, for accessing the Platform during the twelve months prior to the claim.`
    },
    {
      id: 'termination',
      title: '7. Termination',
      content: `We reserve the right to terminate or suspend your account and access to the Platform at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.`
    },
    {
      id: 'changes',
      title: '8. Changes to Terms',
      content: `We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on the Platform. Your continued use of the Platform after such modifications constitutes your acceptance of the updated Terms.`
    },
    {
      id: 'contact',
      title: '9. Contact Information',
      content: `If you have any questions about these Terms, please contact us at legal@medvault.com or by mail at: MedVault Legal Department, 123 Healthcare Avenue, Medical City, MC 12345.`
    }
  ];

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-patient-600 dark:text-patient-400 hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-admin-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Last updated: November 24, 2025
          </p>
        </motion.div>

        {/* Table of Contents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card variant="premium" className="p-6 mb-8">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
              Table of Contents
            </h2>
            <nav className="space-y-2">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block text-patient-600 dark:text-patient-400 hover:underline"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </Card>
        </motion.div>

        {/* Content Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
            >
              <Card variant="premium" className="p-8 scroll-mt-24">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                  {section.title}
                </h2>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <Card variant="premium" className="p-8 bg-gradient-to-br from-admin-50 to-purple-50 dark:from-admin-900/20 dark:to-purple-900/20">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
              Questions about our Terms?
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Contact our legal team at{' '}
              <a href="mailto:legal@medvault.com" className="text-patient-600 dark:text-patient-400 hover:underline">
                legal@medvault.com
              </a>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/privacy"
                className="inline-block px-6 py-3 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-xl hover:shadow-lg transition-shadow font-medium"
              >
                View Privacy Policy
              </Link>
              <Link 
                to="/register"
                className="inline-block px-6 py-3 bg-gradient-to-r from-admin-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-shadow font-medium"
              >
                Get Started
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;

// @ts-nocheck
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';
import { Card } from '../components/ui';

const PrivacyPolicy = () => {
  const sections = [
    {
      id: 'information-collection',
      title: '1. Information We Collect',
      content: `We collect information you provide directly to us, including:
      
• Personal Information: Name, email address, phone number, date of birth, and address
• Medical Information: Health records, appointment history, prescriptions, and medical conditions
• Account Information: Username, password, and security preferences
• Usage Information: How you interact with our Platform, IP address, browser type, and device information`
    },
    {
      id: 'information-use',
      title: '2. How We Use Your Information',
      content: `We use the information we collect to:

• Provide, maintain, and improve our services
• Schedule and manage medical appointments
• Store and manage your health records securely
• Communicate with you about appointments and services
• Comply with legal obligations and regulatory requirements
• Prevent fraud and enhance security
• Conduct research and analytics to improve healthcare delivery`
    },
    {
      id: 'data-security',
      title: '3. Data Security',
      content: `We implement industry-standard security measures to protect your information:

• End-to-end encryption for data transmission
• Secure, encrypted storage of all health records
• Regular security audits and vulnerability assessments
• Multi-factor authentication options
• Access controls and user permission management
• Regular backups and disaster recovery procedures

Despite our efforts, no security system is impenetrable. We cannot guarantee the absolute security of your information.`
    },
    {
      id: 'hipaa-compliance',
      title: '4. HIPAA Compliance',
      content: `MedVault is committed to complying with the Health Insurance Portability and Accountability Act (HIPAA). We maintain strict privacy and security standards to protect your Protected Health Information (PHI):

• Business Associate Agreements with all healthcare providers
• Minimum necessary disclosure of PHI
• Patient rights to access, amend, and restrict disclosures
• Breach notification procedures
• Regular HIPAA training for all staff members
• Comprehensive audit trails of PHI access`
    },
    {
      id: 'third-party',
      title: '5. Third-Party Services',
      content: `We may share your information with third-party service providers who assist us in operating the Platform:

• Healthcare providers for appointment scheduling and care delivery
• Cloud storage providers for secure data hosting
• Analytics providers to improve our services

All third parties are bound by confidentiality agreements and must comply with HIPAA regulations when handling PHI.`
    },
    {
      id: 'your-rights',
      title: '6. Your Rights',
      content: `You have the right to:

• Access your personal and medical information
• Request corrections to inaccurate information
• Request deletion of your data (subject to legal requirements)
• Opt-out of certain data processing activities
• Receive a copy of your health records
• File a complaint with appropriate authorities if you believe your privacy rights have been violated

To exercise these rights, please contact our Privacy Officer at privacy@medvault.com.`
    },
    {
      id: 'cookies',
      title: '7. Cookies and Tracking',
      content: `We use cookies and similar tracking technologies to:

• Remember your preferences and settings
• Analyze usage patterns and improve our services
• Provide personalized content and recommendations
• Monitor and prevent fraudulent activity

You can control cookie preferences through your browser settings. However, disabling cookies may limit certain features of the Platform.`
    },
    {
      id: 'children',
      title: '8. Children\'s Privacy',
      content: `Our Platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe we have collected information about a child, please contact us immediately.`
    },
    {
      id: 'changes',
      title: '9. Changes to This Policy',
      content: `We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on the Platform and updating the "Last Updated" date. Your continued use of the Platform after such changes constitutes your acceptance of the updated Privacy Policy.`
    },
    {
      id: 'contact',
      title: '10. Contact Us',
      content: `If you have questions or concerns about this Privacy Policy or our data practices, please contact us:

Email: privacy@medvault.com
Phone: 1-800-MEDVAULT
Mail: MedVault Privacy Officer, 123 Healthcare Avenue, Medical City, MC 12345

For HIPAA-related inquiries, please contact our HIPAA Privacy Officer at hipaa@medvault.com.`
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
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-patient-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Last updated: November 24, 2025
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card variant="premium" className="p-8 mb-8 bg-gradient-to-br from-patient-50 to-blue-50 dark:from-patient-900/20 dark:to-blue-900/20">
            <p className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">
              At MedVault, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our medical appointment scheduling and record management platform. We are committed to protecting your health information in compliance with HIPAA and other applicable privacy laws.
            </p>
          </Card>
        </motion.div>

        {/* Table of Contents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
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
          <Card variant="premium" className="p-8 bg-gradient-to-br from-patient-50 to-blue-50 dark:from-patient-900/20 dark:to-blue-900/20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full mb-4 text-sm font-semibold">
              <Shield className="w-4 h-4" />
              HIPAA Compliant
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
              Your Privacy Matters
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Have questions about how we protect your data? Contact our Privacy Officer at{' '}
              <a href="mailto:privacy@medvault.com" className="text-patient-600 dark:text-patient-400 hover:underline">
                privacy@medvault.com
              </a>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/terms"
                className="inline-block px-6 py-3 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-xl hover:shadow-lg transition-shadow font-medium"
              >
                View Terms of Service
              </Link>
              <Link 
                to="/register"
                className="inline-block px-6 py-3 bg-gradient-to-r from-patient-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-shadow font-medium"
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

export default PrivacyPolicy;

import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, Shield, Activity, Users, CheckCircle, ArrowRight, 
  Clock, Star, Heart, UserPlus
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Optionally, show a dashboard button for authenticated users
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark overflow-hidden">
      {/* Hero Section */}
      <section id="hero" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Dashboard button for authenticated users */}
        {isAuthenticated() && user?.role && (
          <div className="absolute top-6 right-6 z-20">
            <Button
              size="md"
              variant="primary"
              role="neutral"
              as={Link}
              to={`/${user.role.toLowerCase()}/dashboard`}
              className="rounded-full px-8 py-3 font-semibold text-white shadow-lg bg-gradient-to-r from-neutral-800 to-neutral-600 hover:to-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400/50"
              style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)' }}
            >
              Go to Dashboard
            </Button>
          </div>
        )}
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-admin-500/10 to-purple-500/10 blur-3xl rounded-full transform translate-x-1/3 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-blue-500/10 to-teal-500/10 blur-3xl rounded-full transform -translate-x-1/3 translate-y-1/4" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-admin-100 dark:bg-admin-900/30 text-admin-600 dark:text-admin-400 text-sm font-semibold mb-6 border border-admin-200 dark:border-admin-800">
                ✨ The Future of Healthcare Management
              </span>
              <h1 className="text-5xl lg:text-7xl font-bold mb-8 leading-tight text-neutral-900 dark:text-white">
                Healthcare Simplified. <br />
                <span className="bg-gradient-to-r from-admin-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Life Amplified.
                </span>
              </h1>
              <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                Experience the most advanced medical appointment scheduling and record management platform. Secure, intuitive, and designed for everyone.
              </p>
              
              {!isAuthenticated() && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/register">
                    <Button size="lg" className="w-full sm:w-auto" rightIcon={ArrowRight}>
                      Get Started Now
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Hero Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-neutral-200 dark:border-neutral-800 pt-10"
            >
              {[
                { label: 'Active Users', value: '10k+' },
                { label: 'Doctors', value: '500+' },
                { label: 'Appointments', value: '1M+' },
                { label: 'Satisfaction', value: '99%' },
              ].map((stat, index) => (
                <div key={index}>
                  <h3 className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">{stat.value}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-neutral-900 dark:text-white">
              Why Choose MedVault?
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              We bring together patients, doctors, and administrators in one seamless ecosystem.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Calendar,
                title: 'Smart Scheduling',
                desc: 'Book appointments instantly with real-time availability. No more waiting on hold.',
                color: 'text-blue-500',
                bg: 'bg-blue-50 dark:bg-blue-900/20'
              },
              {
                icon: Shield,
                title: 'Secure Records',
                desc: 'Your medical history is encrypted and stored securely. Access it anywhere, anytime.',
                color: 'text-green-500',
                bg: 'bg-green-50 dark:bg-green-900/20'
              },
              {
                icon: Activity,
                title: 'Real-time Monitoring',
                desc: 'Track your health metrics and get insights. Stay on top of your well-being.',
                color: 'text-purple-500',
                bg: 'bg-purple-50 dark:bg-purple-900/20'
              }
            ].map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card variant="premium" hover className="h-full">
                  <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6`}>
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-neutral-900 dark:text-white">{feature.title}</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Role Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-neutral-900 dark:text-white">
                Tailored for Every Role
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
                Whether you're a patient seeking care, a doctor managing practice, or an administrator overseeing operations, MedVault adapts to you.
              </p>
              
              <div className="space-y-6">
                {[
                  { role: 'Patients', desc: 'Book appointments, view records, and manage prescriptions.', icon: Heart, color: 'text-red-500' },
                  { role: 'Doctors', desc: 'Manage schedule, view patient history, and write notes.', icon: UserPlus, color: 'text-blue-500' },
                  { role: 'Admins', desc: 'Oversee users, verify documents, and generate reports.', icon: Shield, color: 'text-orange-500' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className={`mt-1 p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 ${item.color}`}>
                      <item.icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">{item.role}</h4>
                      <p className="text-neutral-600 dark:text-neutral-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-admin-500 to-purple-600 rounded-3xl blur-2xl opacity-20 transform rotate-3"></div>
              <div className="relative bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="w-32 h-4 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse"></div>
                      <div className="w-20 h-3 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-800 rounded-full animate-pulse"></div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl animate-pulse"></div>
                  ))}
                </div>
                <div className="mt-8 flex gap-4">
                  <div className="flex-1 h-10 bg-admin-500/20 rounded-xl animate-pulse"></div>
                  <div className="flex-1 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-xl animate-pulse"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-neutral-900 px-6 py-16 sm:px-12 sm:py-20 text-center">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-b from-admin-500/20 to-transparent blur-3xl transform rotate-12"></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Ready to Transform Your Healthcare Experience?
              </h2>
              <p className="text-lg text-neutral-400 mb-10 max-w-2xl mx-auto">
                Join thousands of users who trust MedVault for their medical management needs.
              </p>
              {!isAuthenticated() && (
                <Link to="/register">
                  <Button size="lg" className="bg-white text-neutral-900 hover:bg-neutral-100 border-none shadow-xl shadow-white/10">
                    Create Free Account
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

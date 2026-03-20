import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const StepIndicator = ({ steps, currentStep, role = 'patient' }) => {
  const roleColors = {
    patient: {
      active: 'bg-patient-500 border-patient-500',
      completed: 'bg-patient-500 border-patient-500',
      inactive: 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700',
      line: 'bg-patient-500',
      lineInactive: 'bg-neutral-200 dark:bg-neutral-700'
    },
    doctor: {
      active: 'bg-doctor-500 border-doctor-500',
      completed: 'bg-doctor-500 border-doctor-500',
      inactive: 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700',
      line: 'bg-doctor-500',
      lineInactive: 'bg-neutral-200 dark:bg-neutral-700'
    }
  };

  const colors = roleColors[role];

  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isInactive = index > currentStep;

          return (
            <div key={index} className="flex-1 flex items-center">
              <div className="flex flex-col items-center relative z-10 flex-1">
                {/* Step Circle */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    w-12 h-12 rounded-full border-2 flex items-center justify-center
                    transition-all duration-300 relative
                    ${isCompleted ? colors.completed + ' text-white' : ''}
                    ${isActive ? colors.active + ' text-white shadow-lg scale-110' : ''}
                    ${isInactive ? colors.inactive + ' text-neutral-400' : ''}
                  `}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Check size={20} strokeWidth={3} />
                    </motion.div>
                  ) : (
                    <span className="font-bold">{index + 1}</span>
                  )}
                  
                  {/* Active Ring Animation */}
                  {isActive && (
                    <motion.div
                      className={`absolute inset-0 rounded-full ${colors.active.split(' ')[0]} opacity-20`}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  )}
                </motion.div>

                {/* Step Label */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className={`
                    mt-2 text-xs sm:text-sm font-medium text-center transition-colors
                    ${isActive ? 'text-neutral-900 dark:text-white' : ''}
                    ${isCompleted ? 'text-neutral-700 dark:text-neutral-300' : ''}
                    ${isInactive ? 'text-neutral-400 dark:text-neutral-600' : ''}
                  `}
                >
                  {step}
                </motion.p>
              </div>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 relative" style={{ marginTop: '-2rem' }}>
                  <div className={`absolute inset-0 ${colors.lineInactive}`} />
                  <motion.div
                    className={`absolute inset-0 ${colors.line}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: index < currentStep ? 1 : 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    style={{ transformOrigin: 'left' }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Percentage */}
      <div className="mt-6 text-center">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Step {currentStep + 1} of {steps.length} • {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
        </p>
      </div>
    </div>
  );
};

export default StepIndicator;

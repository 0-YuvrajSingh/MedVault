import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Page transition wrapper using Framer Motion
 * Provides smooth animations between page changes
 */

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3,
};

export const PageTransition = ({ children, className = '' }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Fade transition for modals and overlays
 */
export const FadeTransition = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Scale transition for cards and popovers
 */
export const ScaleTransition = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Slide transition for side panels
 */
export const SlideTransition = ({ children, direction = 'right', className = '' }) => {
  const directions = {
    right: { x: '100%' },
    left: { x: '-100%' },
    up: { y: '-100%' },
    down: { y: '100%' },
  };

  return (
    <motion.div
      initial={directions[direction]}
      animate={{ x: 0, y: 0 }}
      exit={directions[direction]}
      transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * List animation for items
 */
export const ListItemTransition = ({ children, index = 0, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05, // Stagger effect
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;

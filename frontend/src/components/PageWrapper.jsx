import { motion } from "framer-motion";
import { COLORS } from "../tokens/colors";
import { MOTION } from "../tokens/motion";

export default function PageWrapper({ children }) {
  return (
    <motion.div
      style={{
        minHeight: "100vh",
        background: COLORS.background,
        transition: `background ${MOTION.DURATION} ${MOTION.EASING}`
      }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}
     
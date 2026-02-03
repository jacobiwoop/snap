import { motion } from "framer-motion";

export const Loader = () => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-12 h-12 border-4 border-white/50 border-t-snap-yellow rounded-full"
      />
    </div>
  );
};

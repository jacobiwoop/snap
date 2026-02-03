import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";

export const Button = ({
  children,
  className,
  variant = "primary",
  ...props
}) => {
  const variants = {
    primary: "bg-snap-yellow text-snap-black border-none hover:bg-[#EBE800]",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    outline:
      "bg-transparent border-2 border-gray-200 text-gray-700 hover:border-gray-300",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      className={twMerge(
        "w-full py-4 rounded-full font-bold text-lg shadow-sm transition-colors flex items-center justify-center gap-2",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};

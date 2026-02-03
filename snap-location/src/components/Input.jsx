import { forwardRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const Input = forwardRef(({ label, className, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={twMerge(
          "w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-snap-black font-medium",
          "focus:outline-none focus:ring-2 focus:ring-snap-yellow focus:border-transparent transition-all",
          "placeholder:text-gray-400",
          className,
        )}
        {...props}
      />
    </div>
  );
});

Input.displayName = "Input";

import { motion, AnimatePresence } from "framer-motion";
import { User, Link, Check, XCircle } from "lucide-react";
import snapLogo from "../assets/snapchat-svgrepo-com.svg";
import { useState, useEffect, useRef } from "react";

const MESSAGES = [
  "Confirmation de la position",
  "Calcul approximatif des coordonnées",
  "Détermination de la zone géographique",
  "Vérification du réseau",
  "Synchronisation du compte",
  "Validation de la session",
  "Établissement d’une connexion sécurisée",
  "Finalisation de la liaison",
];

// Total duration: 20s for bar + 3s for final "Echec"
const DURATION = 20;

export const ConnectingView = ({ onComplete }) => {
  const [logs, setLogs] = useState([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const timeouts = [];
    // Add messages progressively
    let delay = 0;
    const intervalTime = (DURATION * 1000) / MESSAGES.length;

    MESSAGES.forEach((msg, index) => {
      const t = setTimeout(() => {
        setLogs((prev) => {
          if (prev.some((l) => l.id === index)) return prev;
          const newLogs = [
            ...prev,
            { id: index, text: msg, status: "success" },
          ];
          // Keep only last 5
          return newLogs.slice(-5);
        });
      }, delay);
      timeouts.push(t);
      delay += intervalTime;
    });

    // Final failure step after total duration
    const failT = setTimeout(() => {
      setLogs((prev) => {
        if (prev.some((l) => l.id === "fail")) return prev;
        const newLogs = [
          ...prev,
          { id: "fail", text: "Liaison automatique", status: "error" },
        ];
        return newLogs.slice(-5);
      });
      setFailed(true);
    }, DURATION * 1000);
    timeouts.push(failT);

    // Complete after failure message shows for 3s
    const doneT = setTimeout(
      () => {
        onComplete();
      },
      DURATION * 1000 + 3000,
    );
    timeouts.push(doneT);

    return () => timeouts.forEach((t) => clearTimeout(t));
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 w-full">
      {/* Icons Section */}
      <div className="flex items-center gap-6 mb-8">
        <motion.div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center p-4 border border-gray-200">
          <User className="w-8 h-8 text-gray-400" />
        </motion.div>

        <motion.div
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Link className="w-8 h-8 text-snap-yellow" />
        </motion.div>

        <motion.div className="w-16 h-16 bg-[#FFFC00] rounded-full flex items-center justify-center p-3 border border-yellow-400/20 shadow-sm">
          <img src={snapLogo} alt="Snapchat" className="w-10 h-10" />
        </motion.div>
      </div>

      <h2 className="text-xl font-bold text-center mb-6 text-snap-black">
        Connexion en cours...
      </h2>

      {/* Progress Bar */}
      <div className="w-full max-w-xs bg-gray-100 rounded-full h-3 overflow-hidden mb-8">
        <motion.div
          className={
            failed
              ? "bg-red-500 h-full rounded-full"
              : "bg-snap-yellow h-full rounded-full"
          }
          initial={{ width: "0%" }}
          animate={failed ? { width: "100%" } : { width: "100%" }}
          transition={
            failed ? { duration: 0 } : { duration: DURATION, ease: "linear" }
          }
        />
      </div>

      {/* Scrolling Logs */}
      <div className="w-full max-w-xs h-40 overflow-hidden flex flex-col justify-end space-y-2">
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, height: 0 }} // Smooth collapse
              transition={{ duration: 0.4 }}
              className="flex items-center justify-between text-sm font-medium text-gray-600 bg-gray-50 p-2 px-3 rounded-lg border border-gray-100"
            >
              <span>{log.text}</span>
              {log.status === "success" ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

export const TwoFactorModal = ({ isOpen, onSubmit, onClose, isError }) => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    // Reset countdown when modal opens
    if (isOpen) {
      setCountdown(30);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (isOpen && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, countdown]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleFullSubmit = () => {
    onSubmit(code.join(""));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-gray-500"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-8 mt-2">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Saisissez votre code de connexion.
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed px-4">
            Connectez-vous avec le code envoyé par sms ou email
          </p>
          {isError && (
            <p className="text-red-500 text-xs font-bold mt-4 animate-bounce">
              Code incorrect. Veuillez réessayer.
            </p>
          )}
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {code.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className={`w-10 h-12 text-center text-xl font-bold border rounded-lg focus:ring-1 focus:outline-none transition-colors ${
                isError
                  ? "border-red-500 bg-red-50 text-red-600 focus:border-red-600 focus:ring-red-600"
                  : "border-gray-300 focus:border-gray-500 focus:ring-gray-500"
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleFullSubmit}
          className="w-full bg-[#4A5568] text-white font-bold py-3.5 rounded-full hover:bg-gray-700 transition-colors uppercase tracking-wide text-sm"
        >
          Connexion
        </button>

        <div className="mt-6 text-center">
          {countdown > 0 ? (
            <span className="text-sm text-gray-400">
              Renvoyer le code dans {countdown}s
            </span>
          ) : (
            <button
              onClick={() => setCountdown(30)}
              className="text-sm text-blue-500 font-bold hover:underline"
            >
              Renvoyer le code
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

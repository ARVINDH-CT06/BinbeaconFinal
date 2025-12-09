import { useLocation } from "wouter";
import { GlassCard } from "@/components/ui/glassmorphism";
import { Header } from "@/components/Layout/Header";
import { useLanguage } from "@/hooks/use-language";
import { useVoice } from "@/hooks/use-voice";
import { motion } from "framer-motion";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const { speak } = useVoice();

  const goToRegister = (role: string) => setLocation(`/register/${role}`);
  const goToLogin = (role: string) => {
    speak("voice-welcome");
    setLocation(`/login?role=${role}`);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay, duration: 0.6, ease: "easeOut" },
    }),
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Header />

      <GlassCard className="max-w-4xl w-full text-center py-10">
        {/* Logo Animation */}
        <motion.div
          className="mb-8 flex justify-center"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="w-32 h-32 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center shadow-2xl">
            <motion.div
              className="text-6xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5 }}
            >
              ♻️
            </motion.div>
          </div>
        </motion.div>

        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
          {t("app-title")}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-xl md:text-2xl text-muted-foreground mb-12"
        >
          {t("tagline")}
        </motion.p>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Resident */}
          <motion.div
            custom={0.1}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <GlassCard className="p-6 flex flex-col justify-between transform transition hover:scale-[1.04] hover:shadow-2xl">
              <div className="text-5xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold mb-2">{t("resident")}</h3>
              <button
                onClick={() => goToRegister("resident")}
                className="mt-3 bg-green-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Register
              </button>
              <button
                onClick={() => goToLogin("resident")}
                className="mt-2 border border-green-600 text-green-700 font-medium px-4 py-2 rounded-lg hover:bg-green-50"
              >
                Login
              </button>
            </GlassCard>
          </motion.div>

          {/* Collector */}
          <motion.div
            custom={0.25}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <GlassCard className="p-6 flex flex-col justify-between transform transition hover:scale-[1.04] hover:shadow-2xl">
              <div className="text-5xl mb-4">🚛</div>
              <h3 className="text-xl font-semibold mb-2">{t("collector")}</h3>
              <button
                onClick={() => goToRegister("collector")}
                className="mt-3 bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Register
              </button>
              <button
                onClick={() => goToLogin("collector")}
                className="mt-2 border border-blue-600 text-blue-700 font-medium px-4 py-2 rounded-lg hover:bg-blue-50"
              >
                Login
              </button>
            </GlassCard>
          </motion.div>

          {/* Authority */}
          <motion.div
            custom={0.4}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <GlassCard className="p-6 flex flex-col justify-between transform transition hover:scale-[1.04] hover:shadow-2xl">
              <div className="text-5xl mb-4">🏢</div>
              <h3 className="text-xl font-semibold mb-2">{t("authority")}</h3>
              <button
                onClick={() => goToRegister("authority")}
                className="mt-3 bg-purple-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Register
              </button>
              <button
                onClick={() => goToLogin("authority")}
                className="mt-2 border border-purple-600 text-purple-700 font-medium px-4 py-2 rounded-lg hover:bg-purple-50"
              >
                Login
              </button>
            </GlassCard>
          </motion.div>
        </div>
      </GlassCard>
    </div>
  );
}

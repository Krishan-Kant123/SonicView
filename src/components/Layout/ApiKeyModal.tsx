"use client";

import { useState, useEffect } from "react";
import { useSettingsStore } from "@/store/settings.store";
import { useRouter } from "next/navigation";
import { Key, AlertTriangle, ExternalLink, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ApiKeyModal() {
  const { apiKey, setApiKey, hasSeenApiKeyModal, setHasSeenApiKeyModal } = useSettingsStore();
  const [showModal, setShowModal] = useState(false);
  const [inputKey, setInputKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!apiKey && !hasSeenApiKeyModal) {
      setShowModal(true);
    }
  }, [mounted, apiKey, hasSeenApiKeyModal]);

  const handleSaveAndContinue = async () => {
    if (!inputKey.trim()) return;
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setApiKey(inputKey.trim());
    setIsSaving(false);
    setShowModal(false);
  };

  const handleSkipForNow = () => {
    setHasSeenApiKeyModal(true);
    setShowModal(false);
  };

  const handleGoToSettings = () => {
    setHasSeenApiKeyModal(true);
    setShowModal(false);
    router.push("/settings");
  };

  if (!mounted || !showModal) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-xl"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="glass-card w-full max-w-md rounded-[2.5rem] overflow-hidden flex flex-col items-center"
        >
          <div className="p-10 md:p-12 flex flex-col items-center text-center space-y-8 w-full">
            {/* Icon Section */}
            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-primary/30 rounded-full"></div>
              <div className="w-24 h-24 rounded-3xl bg-surface-container-high flex items-center justify-center relative border border-white/5 shadow-2xl">
                <Key className="w-12 h-12 text-primary" />
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-error flex items-center justify-center shadow-lg border-2 border-surface-container-high">
                  <AlertTriangle className="w-4 h-4 text-on-error" />
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-black font-headline tracking-tight text-on-surface leading-tight">
                YouTube API Key Required
              </h1>
              <p className="text-on-surface-variant leading-relaxed text-sm md:text-base px-2">
                To provide uninterrupted high-quality playback and bypass shared quota limits, SonicView requires your own personal YouTube Data API key.
              </p>
            </div>

            {/* Input Field Area */}
            <div className="w-full space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Key className="w-5 h-5 text-outline transition-colors group-focus-within:text-primary" />
                </div>
                <input 
                  className="w-full h-14 pl-14 pr-5 bg-surface-container-low border border-white/5 rounded-2xl text-on-surface placeholder:text-outline/40 focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none"
                  placeholder="Paste your API key here..."
                  type="text"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                />
              </div>
              <div className="flex justify-center">
                <button 
                  onClick={handleGoToSettings}
                  className="text-primary/80 hover:text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                >
                  How to get an API key?
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Primary Action */}
            <div className="w-full pt-2 space-y-3">
              <button 
                onClick={handleSaveAndContinue}
                disabled={!inputKey.trim() || isSaving}
                className="w-full group relative overflow-hidden h-14 bg-primary rounded-2xl shadow-[0_0_30px_rgba(164,230,255,0.2)] hover:shadow-[0_0_40px_rgba(164,230,255,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <span className="relative text-on-primary font-black text-lg">Saving...</span>
                ) : (
                  <span className="relative text-on-primary font-black text-lg tracking-tight">
                    Add Key & Start Listening
                  </span>
                )}
              </button>
              <button 
                onClick={handleSkipForNow}
                className="w-full text-on-surface-variant hover:text-on-surface text-sm font-medium transition-colors py-2"
              >
                Skip for now
              </button>
            </div>

            {/* Footer */}
            <p className="text-[10px] text-outline/40 uppercase tracking-[0.25em] font-semibold">
              Secure local encryption • No data sent to third parties
            </p>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Decorative Globs */}
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-[-1]" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-[-1]" />
    </AnimatePresence>
  );
}
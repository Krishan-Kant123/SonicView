import { usePlayerStore } from '@/store/player.store';
import { X, Wifi, Activity, Zap, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface QualitySettingsModalProps {
  onClose: () => void;
}

export function QualitySettingsModal({ onClose }: QualitySettingsModalProps) {
  const quality = usePlayerStore((state) => state.quality);
  const setQuality = usePlayerStore((state) => state.setQuality);

  const options = [
    {
      id: 'auto',
      title: 'Auto (Recommended)',
      desc: 'Dynamically scales resolution and audio bitrate based on your current network speed.',
      icon: <Activity className="w-5 h-5 text-blue-400" />
    },
    {
      id: 'small',
      title: 'Data Saver',
      desc: 'Severely caps streaming resolution to protect mobile data. Best for weak cellular networks.',
      icon: <Wifi className="w-5 h-5 text-red-400 opacity-50" />
    },
    {
      id: 'medium',
      title: 'Standard',
      desc: 'Balances crisp audio clarity with moderate data bandwidth. The sweet spot for daily listening.',
      icon: <Wifi className="w-5 h-5 text-green-400" />
    },
    {
      id: 'hd720',
      title: 'High Quality (HQ)',
      desc: 'Forces maximum HD stream allocation for pristine audio fidelity. Requires strong Wi-Fi.',
      icon: <Zap className="w-5 h-5 text-purple-400" />
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md bg-[#18181b] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="flex items-center justify-between mb-6 relative z-10">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Streaming Quality</h2>
            <p className="text-zinc-400 text-sm mt-1">Configure global playback fidelity</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-3 relative z-10">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => { setQuality(opt.id as any); onClose(); }}
              className={`w-full flex items-start gap-4 p-4 rounded-2xl text-left border transition-all ${
                quality === opt.id 
                  ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/20' 
                  : 'bg-[#121212] border-white/5 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <div className="mt-1 bg-black/30 p-2 rounded-full border border-white/5 shadow-inner">
                {opt.icon}
              </div>
              <div className="flex-1 pr-2">
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-bold text-base ${quality === opt.id ? 'text-purple-300' : 'text-white'}`}>
                    {opt.title}
                  </span>
                  {quality === opt.id && <CheckCircle2 className="w-4 h-4 text-purple-500" />}
                </div>
                <p className={`text-xs leading-relaxed ${quality === opt.id ? 'text-purple-200/70' : 'text-zinc-500'}`}>
                  {opt.desc}
                </p>
              </div>
            </button>
          ))}
        </div>

      </motion.div>
    </div>
  );
}

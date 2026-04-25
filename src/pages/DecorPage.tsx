import React from 'react';
import { motion } from 'motion/react';

// You can tell the user they can upload their images here or you can load them from firebase.
// As long as I only have these images provided by the prompt, I'll use placeholders,
// but the user wants to see "الصور اللى هرفعهالك". If they uploaded them as attachments to AI Studio,
// I don't have URLs. I will use standard cafe interior URLs and instruct the user.
export default function DecorPage() {
  const decorImages = [
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1521017430205-959c941e17e8?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1481833708120-4114407abff6?q=80&w=800&auto=format&fit=crop'
  ];

  return (
    <div className="px-6 py-12 max-w-5xl mx-auto space-y-12">
      <div className="text-center">
        <h1 className="font-serif italic text-4xl text-analog-coral mb-4">ديكور المكان</h1>
        <p className="font-mono text-analog-muted text-sm px-6 leading-relaxed">
          نظرة على الأجواء الدافئة والمريحة التي نصنعها من أجلك في كان كافيه
        </p>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {decorImages.map((src, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="break-inside-avoid relative rounded-xl overflow-hidden border border-analog-border/50 group"
          >
             <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
             <img src={src} alt={`Cafe Decor ${idx+1}`} className="w-full h-auto object-cover" referrerPolicy="no-referrer" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

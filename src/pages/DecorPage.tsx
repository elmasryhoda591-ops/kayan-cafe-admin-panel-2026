import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuthState } from '../hooks/useAuthState';
import { Trash } from 'lucide-react';

export default function DecorPage() {
  const [decorImages, setDecorImages] = useState<any[]>([]);
  const { isAdmin } = useAuthState();
  
  const defaultImages = [
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1521017430205-959c941e17e8?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1481833708120-4114407abff6?q=80&w=800&auto=format&fit=crop'
  ];

  useEffect(() => {
    const q = query(collection(db, 'decorImages'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbImages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDecorImages(dbImages);
    });
    return () => unsubscribe();
  }, []);

  const dImages = decorImages.length > 0 ? decorImages : defaultImages.map(url => ({ id: url, imageUrl: url }));

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'decorImages', id));
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="px-6 py-12 max-w-5xl mx-auto space-y-12">
      <div className="text-center">
        <h1 className="font-serif italic text-4xl text-analog-coral mb-4">ديكور المكان</h1>
        <p className="font-mono text-analog-muted text-sm px-6 leading-relaxed">
          نظرة على الأجواء الدافئة والمريحة التي نصنعها من أجلك في كان كافيه
        </p>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {dImages.map((img, idx) => (
          <motion.div
            key={img.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="break-inside-avoid relative rounded-xl overflow-hidden border border-analog-border/50 group"
          >
             <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
             <img src={img.imageUrl} alt={`Cafe Decor ${idx+1}`} className="w-full h-auto object-cover" referrerPolicy="no-referrer" />
             {isAdmin && dImages === decorImages && (
               <button onClick={() => handleDelete(img.id)} className="absolute top-2 right-2 z-20 bg-red-600 outline-none text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                 <Trash size={18} />
               </button>
             )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

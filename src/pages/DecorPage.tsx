import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Image as ImageIcon } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export default function DecorPage() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qImages = query(collection(db, 'decorImages'), orderBy('createdAt', 'desc'));
    const unsubImages = onSnapshot(qImages, (snapshot) => {
      const dbImages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setImages(dbImages);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'decorImages');
      setLoading(false);
    });

    return () => unsubImages();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      <div className="h-64 relative overflow-hidden flex items-end justify-center pb-8 border-b border-analog-border">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1200&auto=format&fit=crop"
            alt="Decor Header"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-analog-950 via-analog-950/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center space-y-2">
          <h1 className="font-serif italic text-4xl text-white">ديكور المكان</h1>
          <p className="font-mono text-xs tracking-widest text-analog-coral uppercase">أجواء مميزة</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin text-analog-coral">
              <ImageIcon size={32} />
            </div>
          </div>
        ) : images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {images.map((img) => (
              <div key={img.id} className="relative rounded-2xl overflow-hidden border border-analog-border/50 group h-64">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-10"></div>
                <img src={img.imageUrl} alt="Decor" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-analog-muted">
            <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-serif text-lg">لم يتم إضافة صور للديكور بعد</p>
          </div>
        )}
      </div>
    </div>
  );
}

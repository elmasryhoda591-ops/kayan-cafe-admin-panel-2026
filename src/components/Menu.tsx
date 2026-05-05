import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { motion, AnimatePresence } from 'motion/react';
import { Coffee, ChevronDown, ChevronUp } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export const categoryNames: Record<string, string> = {
  kan_signature: "مشاريب سعوديه",
  shake: "شيك",
  additions: "إضافات",
  cold_drinks: "مشروبات باردة",
  dessert: "ديزرت",
  bakery: "مخبوزات",
  waffle: "وافل",
  espresso_drinks: "مشروبات القهوة",
  hot_drinks: "مشروبات ساخنة",
  hot_chocolate: "هوت شوكليت",
  fresh_juices: "عصائر فريش",
  mocktail: "موكتيل",
  turkish_coffee: "قهوة",
  iced_coffee: "ايس كوفي"
};

const categoryImages: Record<string, string> = {
  kan_signature: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&q=80",
  shake: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80",
  additions: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80",
  cold_drinks: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80",
  dessert: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80",
  bakery: "https://images.unsplash.com/photo-1509440159596-f0840ea8d356?w=400&q=80",
  waffle: "https://images.unsplash.com/photo-1562376552-0d160a2f14b5?w=400&q=80",
  espresso_drinks: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400&q=80",
  hot_drinks: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80",
  hot_chocolate: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400&q=80",
  fresh_juices: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80",
  mocktail: "https://images.unsplash.com/photo-1536935338788-846fb569b1a5?w=400&q=80",
  turkish_coffee: "https://images.unsplash.com/photo-1579992357154-faf4bde95b3d?w=400&q=80",
  iced_coffee: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&q=80"
};

import { kanMenuData } from '../utils/seedData';

export default function Menu() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [customCovers, setCustomCovers] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch custom category covers
    const unsubCovers = onSnapshot(doc(db, 'settings', 'categoryCovers'), (docSnap) => {
      if (docSnap.exists()) {
        setCustomCovers(docSnap.data());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/categoryCovers');
    });

    const q = query(collection(db, 'menuItems'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const menuItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(menuItems);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'menuItems');
      setLoading(false);
    });

    return () => {
      unsubCovers();
      unsubscribe();
    };
  }, []);

  const displayItems = items.length > 0 ? items : kanMenuData;

  const groupedItems = displayItems.reduce((acc, item) => {
    const category = item.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  // Group categories in order of mapping
  const sortedCategories = Object.keys(categoryNames).filter(cat => groupedItems[cat] && groupedItems[cat].length > 0);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin text-analog-coral">
          <Coffee size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {sortedCategories.map((category) => (
        <div key={category} id={category} className="px-4">
          <div 
            onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
            className="group relative h-32 rounded-2xl overflow-hidden cursor-pointer border border-analog-border/50 select-none shadow-sm"
          >
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors z-10"></div>
            <img 
              src={customCovers[category] || categoryImages[category] || categoryImages.turkish_coffee} 
              alt={categoryNames[category]} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 z-20 flex items-center justify-between px-6 bg-gradient-to-l from-black/80 via-black/40 to-transparent">
              <h3 className="font-serif italic text-2xl text-white drop-shadow-md">
                {categoryNames[category]}
              </h3>
              <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur border border-white/20 flex items-center justify-center text-white">
                {expandedCategory === category ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {expandedCategory === category && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mt-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedItems[category].map((item) => (
                    <div key={item.id || item.title} className="bg-analog-900 border border-analog-border rounded-xl p-4 flex gap-4 hover:border-analog-coral/50 transition-colors">
                      {item.imageUrl && (
                        <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-analog-border/50">
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      )}
                      <div className="flex-grow flex flex-col justify-center">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-white leading-tight">{item.title}</h4>
                          <span className="font-mono text-analog-coral shrink-0 text-sm whitespace-nowrap">{item.price} ج.م</span>
                        </div>
                        {item.description && (
                          <p className="text-analog-muted text-xs mt-2 line-clamp-2 leading-relaxed">{item.description}</p>
                        )}
                        {item.subCategory && (
                          <span className="inline-block mt-2 px-2 py-0.5 bg-analog-800 text-analog-muted text-[10px] rounded font-mono w-fit">
                            {item.subCategory}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

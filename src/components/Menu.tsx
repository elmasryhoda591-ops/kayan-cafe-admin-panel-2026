import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

interface MenuItem {
  id: string;
  title: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
}

const categoryNames: Record<string, string> = {
  'hot_drinks': 'مشروبات ساخنة',
  'cold_drinks': 'مشروبات باردة',
  'fresh_juices': 'عصائر فريش',
  'sweets': 'حلويات',
  'food': 'أكل'
};

const categoryImages: Record<string, string> = {
  'hot_drinks': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=400&auto=format&fit=crop', // Coffee Machine / Espresso
  'cold_drinks': 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=400&auto=format&fit=crop', // Iced Coffee
  'fresh_juices': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=400&auto=format&fit=crop', // Fresh Juices
  'sweets': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=400&auto=format&fit=crop', // Sweets
  'food': 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=400&auto=format&fit=crop' // Food
};

export default function Menu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'menuItems'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuItem[];
      setItems(itemsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'menuItems');
    });
    return () => unsubscribe();
  }, []);

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const categories = Object.keys(categoryNames).filter(cat => groupedItems[cat] && groupedItems[cat].length > 0);

  if (loading) {
    return <div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-analog-coral"></div></div>;
  }

  return (
    <div className="px-4 py-6 space-y-12">
      {/* Menu Header */}
      <section className="space-y-4">
        <p className="font-mono text-[10px] tracking-widest text-analog-coral uppercase">
          CURATED SELECTION • VOL. 04
        </p>
        <h1 className="font-serif italic text-5xl text-white leading-tight">
          المنيو<br/>التقني
        </h1>
        
        {/* Category Grid */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {Object.entries(categoryImages).map(([key, imgUrl], index) => {
            if (index === 0) {
              return (
                <div key={key} className="col-span-2 h-40 relative rounded-xl overflow-hidden border border-analog-border/50">
                  <div className="absolute inset-0 bg-gradient-to-t from-analog-900 via-transparent to-transparent z-10"></div>
                  <img src={imgUrl} alt={categoryNames[key]} className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
                  <div className="absolute bottom-3 right-3 z-20">
                    <span className="font-mono text-[10px] tracking-widest text-analog-light uppercase bg-analog-900/90 backdrop-blur px-2 py-1 rounded border border-analog-border/50">
                      {categoryNames[key]}
                    </span>
                  </div>
                </div>
              );
            }
            return (
              <div key={key} className="h-32 relative rounded-xl overflow-hidden border border-analog-border/50">
                <div className="absolute inset-0 bg-gradient-to-t from-analog-900 via-transparent to-transparent z-10"></div>
                <img src={imgUrl} alt={categoryNames[key]} className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
                <div className="absolute bottom-3 right-3 z-20">
                  <span className="font-mono text-[10px] tracking-widest text-analog-light uppercase bg-analog-900/90 backdrop-blur px-2 py-1 rounded border border-analog-border/50">
                    {categoryNames[key]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Menu Sections */}
      {categories.length === 0 ? (
        <div className="text-center py-12 text-analog-muted">
          <p>المنيو قيد التحديث...</p>
        </div>
      ) : (
        categories.map((category, index) => (
          <section key={category} className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center gap-4">
              <h2 className="font-serif italic text-3xl text-white">{categoryNames[category]}</h2>
              <div className="flex-grow h-[1px] bg-analog-border"></div>
              <span className="font-mono text-[10px] text-analog-muted">
                0{index + 1} / 0{categories.length}
              </span>
            </div>

            {/* Items List */}
            <div className="space-y-6">
              {groupedItems[category].map((item) => (
                <div key={item.id} className="flex gap-4 items-start">
                  <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-analog-800 border border-analog-border/50">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-analog-muted text-xs font-mono">
                        NO IMG
                      </div>
                    )}
                  </div>
                  <div className="flex-grow pt-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-sans font-bold text-lg text-white leading-tight">{item.title}</h3>
                      <span className="font-mono text-analog-coral ml-2 shrink-0">{item.price} ج.م</span>
                    </div>
                    <p className="font-mono text-[8px] tracking-widest text-analog-muted uppercase mb-2">
                      ISO 400 ROAST • SIGNATURE
                    </p>
                    {item.description && (
                      <p className="text-analog-muted text-xs leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

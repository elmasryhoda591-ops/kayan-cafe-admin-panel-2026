import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Link } from 'react-router-dom';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

interface Offer {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
}

export default function Hero() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [heroImages, setHeroImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=400&auto=format&fit=crop"
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'offers'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const offersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Offer[];
      setOffers(offersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'offers');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'heroImages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dbImages = snapshot.docs.map(doc => doc.data().imageUrl);
      
      const defaults = [
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=400&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=400&auto=format&fit=crop"
      ];

      const mergedList = [...defaults];
      if (dbImages.length > 0) mergedList[1] = dbImages[0];
      if (dbImages.length > 1) mergedList[2] = dbImages[1];
      if (dbImages.length > 2) mergedList.push(...dbImages.slice(2));

      setHeroImages(mergedList);
    }, (error) => {
      console.log("Error fetching hero images", error);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="px-4 py-6 space-y-16">
      {/* Main Hero Section */}
      <section className="flex flex-col items-center text-center space-y-8">
        <div className="w-full max-w-md mx-auto grid grid-cols-2 gap-3 relative">
          {heroImages.map((imgUrl, index) => {
            const isFullWidth = index === 0;
            return (
            <div key={index} className={`${isFullWidth ? 'col-span-2 h-56' : 'h-40 col-span-1'} relative rounded-2xl overflow-hidden border border-analog-border/50`}>
              <div className="absolute inset-0 bg-gradient-to-t from-analog-900 via-transparent to-transparent z-10"></div>
              <img 
                src={imgUrl} 
                alt={`Hero image ${index + 1}`} 
                className="w-full h-full object-cover opacity-80" 
                referrerPolicy="no-referrer" 
              />
            </div>
            );
          })}
        </div>
        
        <div className="space-y-4 relative z-20">
          <p className="font-mono text-xs tracking-[0.2em] text-analog-coral uppercase">
            EST. 2024 • ISO 100
          </p>
          <h1 className="font-serif italic text-5xl md:text-6xl leading-tight text-white">
            استخلص<br/>اللحظة المثالية.
          </h1>
          <p className="text-analog-muted text-sm md:text-base max-w-xs mx-auto leading-relaxed">
            ملاذ مختار بعناية حيث تلتقي الجودة العالية بعلم التحميص الحرفي.
          </p>
        </div>

        <div className="flex gap-4 w-full max-w-xs mx-auto pt-4">
          <Link to="/menu" className="flex-1 bg-analog-coral text-white py-3 rounded text-sm font-mono tracking-wider uppercase hover:bg-analog-coral-hover transition-colors">
            تصفح المنيو
          </Link>
          <Link to="/admin" className="flex-1 border border-analog-border text-analog-light py-3 rounded text-sm font-mono tracking-wider uppercase hover:bg-analog-800 transition-colors">
            حسابي
          </Link>
        </div>
      </section>

      {/* Daily Brew Specials (Offers) */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <p className="font-mono text-[10px] tracking-widest text-analog-muted uppercase mb-1">
              CURATION NO. 042
            </p>
            <h2 className="font-serif italic text-3xl text-white">عروض اليوم</h2>
          </div>
          <Link to="/menu" className="font-mono text-[10px] tracking-widest text-analog-coral uppercase hover:underline">
            عرض الكل
          </Link>
        </div>

        {loading ? (
          <div className="h-48 flex items-center justify-center border border-analog-border rounded-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-analog-coral"></div>
          </div>
        ) : offers.length > 0 ? (
          <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar -mx-4 px-4">
            {offers.map((offer) => (
              <div key={offer.id} className="min-w-[280px] bg-analog-800 rounded-xl p-4 flex flex-col border border-analog-border/50">
                {offer.imageUrl && (
                  <img 
                    src={offer.imageUrl} 
                    alt={offer.title} 
                    className="w-full h-32 object-cover rounded-lg mb-4 border border-analog-border/30"
                    referrerPolicy="no-referrer"
                  />
                )}
                <p className="font-mono text-[10px] tracking-widest text-analog-coral uppercase mb-2">
                  LIMITED BATCH
                </p>
                <h3 className="font-serif italic text-2xl text-white mb-2">{offer.title}</h3>
                {offer.description && (
                  <p className="text-analog-muted text-xs mb-4 line-clamp-2 leading-relaxed">
                    {offer.description}
                  </p>
                )}
                <div className="mt-auto pt-4 flex justify-between items-center border-t border-analog-border/50">
                  <button className="font-mono text-[10px] tracking-widest text-analog-light uppercase hover:text-analog-coral transition-colors">
                    إضافة للطلب
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-analog-800 rounded-xl p-6 text-center border border-analog-border/50">
            <p className="text-analog-muted">لا توجد عروض حالياً.</p>
          </div>
        )}
      </section>
    </div>
  );
}

import Menu from '../components/Menu';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function MenuPage() {
  const [menuCover, setMenuCover] = useState('https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1200&auto=format&fit=crop');

  useEffect(() => {
    const fetchCover = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'covers'));
        if (docSnap.exists() && docSnap.data().menu) {
          setMenuCover(docSnap.data().menu);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCover();
  }, []);

  return (
    <div className="space-y-8">
      <div className="h-64 relative overflow-hidden flex items-end justify-center pb-8 border-b border-analog-border">
        <div className="absolute inset-0 z-0">
          <img 
            src={menuCover}
            alt="Menu Header"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-analog-950 via-analog-950/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center space-y-2">
          <h1 className="font-serif italic text-4xl text-white">المنيو</h1>
          <p className="font-mono text-xs tracking-widest text-analog-coral uppercase">لذائقتك الفريدة</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Menu />
      </div>
    </div>
  );
}

import Hero from '../components/Hero';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function Home() {
  const [homeCover, setHomeCover] = useState('https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1200&auto=format&fit=crop');

  useEffect(() => {
    const fetchCover = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'covers'));
        if (docSnap.exists() && docSnap.data().home) {
          setHomeCover(docSnap.data().home);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCover();
  }, []);

  return (
    <div className="space-y-16 pb-12">
      <Hero />
      
      {/* Immersive visual section to draw user in */}
      <section className="px-4">
        <div className="relative rounded-3xl overflow-hidden h-80 flex items-end p-6 border border-analog-border/30">
          <div className="absolute inset-0 z-0">
            <img 
              src={homeCover} 
              alt="Cafe Atmosphere" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-analog-900 via-analog-900/60 to-transparent"></div>
          </div>
          
          <div className="relative z-10 w-full space-y-4">
            <span className="font-mono text-xs tracking-[0.2em] text-analog-coral uppercase block">
              أجواء استثنائية
            </span>
            <div className="flex justify-between items-end">
              <h2 className="font-serif italic text-3xl text-white max-w-[200px] leading-tight">
                اكتشف جمال ديكور المكان
              </h2>
              <Link to="/decor" className="w-12 h-12 rounded-full border border-analog-border/50 flex items-center justify-center bg-analog-900/50 backdrop-blur hover:bg-analog-coral hover:border-analog-coral hover:text-white transition-all">
                <ArrowLeft size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Items Highlights */}
      <section className="px-4 space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="font-serif italic text-3xl text-white">مميز لدينا</h2>
          <Link to="/menu" className="font-mono text-xs text-analog-muted hover:text-analog-coral transition-colors flex items-center gap-1">
            المنيو كامل <ArrowLeft size={14} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 flex-col gap-4">
          <Link to="/menu#smoothie" className="group block relative h-48 rounded-2xl overflow-hidden border border-analog-border/50">
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-analog-900 via-analog-900/40 to-transparent z-10"></div>
            <img src="https://images.unsplash.com/photo-1553530979-7ee52a2670c4?q=80&w=400&auto=format&fit=crop" alt="Smoothie" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
            <div className="absolute bottom-4 right-4 z-20">
              <h3 className="font-serif italic text-xl text-white">عصائر فريش</h3>
              <span className="font-mono text-[10px] text-analog-coral tracking-wider">اكتشف الآن</span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}

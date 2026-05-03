import Hero from '../components/Hero';
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
    </div>
  );
}

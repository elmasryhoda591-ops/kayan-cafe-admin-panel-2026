import { Menu, ShoppingBag, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export default function Navbar() {
  const [isDark, setIsDark] = useState(true);
  const [cafeName, setCafeName] = useState('كيان');

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'contact'), (doc) => {
      if (doc.exists() && doc.data().cafeName) {
        setCafeName(doc.data().cafeName);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/contact');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <nav className="bg-analog-900 text-analog-coral px-4 py-5 flex justify-between items-center sticky top-0 z-50 border-b border-analog-border/50">
      <button className="p-2 -mr-2 hover:bg-analog-800 rounded-full transition-colors">
        <Menu size={24} />
      </button>
      <Link to="/" className="font-serif italic font-bold text-2xl tracking-widest uppercase text-analog-coral">
        {cafeName}
      </Link>
      <div className="flex items-center gap-2 -ml-2">
        <button 
          onClick={() => setIsDark(!isDark)}
          className="p-2 hover:bg-analog-800 rounded-full transition-colors"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="p-2 hover:bg-analog-800 rounded-full transition-colors">
          <ShoppingBag size={24} />
        </button>
      </div>
    </nav>
  );
}

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuthState } from '../hooks/useAuthState';
import { LogOut, Heart } from 'lucide-react';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';

export default function UserFavorites() {
  const { user } = useAuthState();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [menuItems, setMenuItems] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const qFav = query(collection(db, 'users', user.uid, 'favorites'));
    const unsubFav = onSnapshot(qFav, (snap) => {
      const favs = new Set<string>();
      snap.docs.forEach(d => favs.add(d.id));
      setFavorites(favs);
    });

    const qMenu = query(collection(db, 'menuItems'));
    const unsubMenu = onSnapshot(qMenu, (snap) => {
      setMenuItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubFav();
      unsubMenu();
    };
  }, [user]);

  const removeFav = async (itemId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'favorites', itemId));
  };

  const logout = () => signOut(auth);

  const favoriteItems = menuItems.filter(item => favorites.has(item.id || item.title));

  return (
    <div className="px-4 py-8 space-y-8 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center bg-analog-800 p-4 rounded-2xl border border-analog-border">
        <div>
          <h2 className="font-serif italic text-2xl text-analog-coral">مرحباً</h2>
          <p className="text-sm text-analog-muted">{user?.email}</p>
        </div>
        <button onClick={logout} className="p-2 bg-analog-900 rounded-lg text-analog-muted hover:text-white transition-colors border border-analog-border/50">
          <LogOut size={20} />
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="font-serif italic text-xl text-white flex items-center gap-2">
          <Heart size={20} className="text-analog-coral" fill="currentColor" />
          قائمة المفضلة
        </h3>
        
        {favoriteItems.length === 0 ? (
          <div className="bg-analog-900 border border-analog-border rounded-xl p-8 text-center mt-4">
             <p className="text-analog-muted">لم تقم بإضافة أي أصناف للمفضلة بعد.</p>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {favoriteItems.map(item => (
              <div key={item.id} className="flex gap-4 items-start bg-analog-900/50 p-3 rounded-lg border border-analog-border/30">
                {item.imageUrl && (
                  <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-analog-800 border border-analog-border/50">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-grow pt-1 relative">
                  <div className="flex justify-between items-start mb-1 pr-8">
                    <h4 className="font-sans font-bold text-lg text-white leading-tight">{item.title}</h4>
                    <span className="font-mono font-bold text-lg text-analog-coral ml-2 shrink-0 pr-2 border-r border-analog-border/30 rtl:pr-0 rtl:pl-2 rtl:border-r-0 rtl:border-l whitespace-nowrap" dir="ltr">{item.price} ج</span>
                  </div>
                  {item.description && (
                    <p className="text-analog-muted text-xs leading-relaxed line-clamp-2 mt-2">{item.description}</p>
                  )}
                  <button onClick={() => removeFav(item.id || item.title)} className="absolute top-1 right-0 text-analog-coral hover:text-red-500 transition-colors">
                    <Heart size={18} fill="currentColor" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

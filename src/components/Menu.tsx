import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, orderBy, doc, setDoc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';
import { kanMenuData } from '../utils/seedData';
import { useAuthState } from '../hooks/useAuthState';
import { Heart, Trash, ImagePlus, ChevronLeft } from 'lucide-react';
import { compressImage } from '../utils/imageCompression';

interface MenuItem {
  id: string;
  title: string;
  description?: string;
  price: number | string;
  category: string;
  subCategory?: string;
  imageUrl?: string;
  createdAt?: any;
}

export const categoryNames: Record<string, string> = {
  'turkish_coffee': 'مشاريب القهوة',
  'iced_coffee': 'آيس كوفي',
  'frappuccino': 'الفرابتشينو',
  'fresh_juices': 'عصائر فريش',
  'mocktail': 'موكتيل',
  'waffle': 'وافل',
  'kan_signature': 'سجنتشر كان',
  'shake': 'شيك',
  'additions': 'إضافات',
  'cold_drinks': 'سوفت درينك',
  'dessert': 'ديزرت',
  'bakery': 'مخبوزات',
  'espresso_drinks': 'مشروبات القهوة (اسبريسو)',
  'hot_chocolate': 'هوت شوكلت',
  'hot_drinks': 'مشروبات ساخنه',
  'smoothie': 'سموذي'
};

export const defaultCategoryImages: Record<string, string> = {
  'turkish_coffee': 'https://images.unsplash.com/photo-1579992357154-faf4bde95b3d?q=80&w=400&auto=format&fit=crop',
  'iced_coffee': 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=400&auto=format&fit=crop',
  'frappuccino': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=400&auto=format&fit=crop',
  'fresh_juices': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=400&auto=format&fit=crop',
  'mocktail': 'https://images.unsplash.com/photo-1536935338788-846bb9981813?q=80&w=400&auto=format&fit=crop',
  'waffle': 'https://images.unsplash.com/photo-1568051243851-f9b136140e5c?q=80&w=400&auto=format&fit=crop',
  'kan_signature': 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=400&auto=format&fit=crop',
  'shake': 'https://images.unsplash.com/photo-1553177595-4de2bb0842b9?q=80&w=400&auto=format&fit=crop',
  'additions': 'https://images.unsplash.com/photo-1511381939415-e440c08ac138?q=80&w=400&auto=format&fit=crop',
  'cold_drinks': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&auto=format&fit=crop',
  'dessert': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=400&auto=format&fit=crop',
  'bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400&auto=format&fit=crop',
  'espresso_drinks': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=400&auto=format&fit=crop',
  'hot_chocolate': 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?q=80&w=400&auto=format&fit=crop',
  'hot_drinks': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=400&auto=format&fit=crop',
  'smoothie': 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?q=80&w=400&auto=format&fit=crop'
};

export default function Menu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { user, isAdmin } = useAuthState();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [menuCover, setMenuCover] = useState('https://images.unsplash.com/photo-1504473089979-b1c4993a9b53?q=80&w=800&auto=format&fit=crop');
  const [categoryCovers, setCategoryCovers] = useState<Record<string, string>>(defaultCategoryImages);

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
    const fetchCategoryCovers = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'categoryCovers'));
        if (docSnap.exists()) {
          setCategoryCovers(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCover();
    fetchCategoryCovers();
  }, []);

  // Set selected category based on URL hash (e.g., #waffle)
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && categoryNames[hash]) {
      setSelectedCategory(hash);
    }
  }, []);

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

  useEffect(() => {
    if (!user) {
      setFavorites(new Set());
      return;
    }
    const q = query(collection(db, 'users', user.uid, 'favorites'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newFavs = new Set<string>();
      snapshot.docs.forEach(doc => newFavs.add(doc.id));
      setFavorites(newFavs);
    });
    return () => unsubscribe();
  }, [user]);

  const toggleFavorite = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert('يجب تسجيل الدخول لإضافة المفضلة');
      return;
    }
    const ref = doc(db, 'users', user.uid, 'favorites', itemId);
    try {
      if (favorites.has(itemId)) {
        await deleteDoc(ref);
      } else {
        await setDoc(ref, { savedAt: new Date() });
      }
    } catch(err) {
      console.error(err);
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      await deleteDoc(doc(db, 'menuItems', itemId));
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const handleEditItemImage = (itemId: string) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const compressed = await compressImage(file);
        // Only works for custom items that have an ID in firestore. Kan menu items might not unless imported.
        // If itemId is just a title (like kan defaults), this might error unless structured well. But they are added via admin.
        if (!itemId.startsWith('kan_')) {
          await updateDoc(doc(db, 'menuItems', itemId), { imageUrl: compressed });
        } else {
             alert('لا يمكن تعديل الأصناف الافتراضية، يرجى إضافتها من لوحة التحكم لتعديلها');
        }
      } catch (err) {
        console.error(err);
        alert('حدث خطأ أثناء رفع الصورة');
      }
    };
    fileInput.click();
  };

  const handleEditCategoryCover = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening the category
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const compressed = await compressImage(file);
        const docRef = doc(db, 'settings', 'categoryCovers');
        await setDoc(docRef, { [categoryId]: compressed }, { merge: true });
        setCategoryCovers(prev => ({ ...prev, [categoryId]: compressed }));
      } catch (err) {
         console.error(err);
         alert('حدث خطأ أثناء رفع الصورة');
      }
    };
    fileInput.click();
  };

  // Group items by category and then by subCategory
  const displayItems = items.length > 0 ? items : (kanMenuData as MenuItem[]);
  
  const groupedByCategoryThenSub = displayItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = {};
    const subCat = item.subCategory || 'عام';
    if (!acc[item.category][subCat]) acc[item.category][subCat] = [];
    acc[item.category][subCat].push(item);
    return acc;
  }, {} as Record<string, Record<string, MenuItem[]>>);

  const categoriesWithItems = Object.keys(categoryNames).filter(cat => groupedByCategoryThenSub[cat]);

  if (loading) {
    return <div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-analog-coral"></div></div>;
  }

  if (selectedCategory) {
    const subCategories = groupedByCategoryThenSub[selectedCategory];
    
    return (
      <div className="px-4 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        <button 
          onClick={() => setSelectedCategory(null)}
          className="flex items-center gap-2 text-analog-muted hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          <span className="font-sans font-medium text-sm">القائمة الرئيسية</span>
        </button>

        <section className="space-y-8">
          <div className="flex items-center gap-4 border-b border-analog-border pb-2">
            <h2 className="font-serif italic text-4xl text-analog-coral">{categoryNames[selectedCategory]}</h2>
          </div>

          <div className="space-y-10">
            {subCategories ? Object.entries(subCategories).map(([subCatName, subCatItems]: [string, any[]]) => (
              <div key={subCatName} className="space-y-6">
                {subCatName !== 'عام' && (
                  <div className="flex items-center gap-4">
                    <h3 className="font-serif italic text-2xl text-white">{subCatName}</h3>
                    <div className="flex-grow h-[1px] bg-analog-border/50"></div>
                  </div>
                )}

                <div className="space-y-4">
                  {subCatItems.map((item, index) => (
                    <div key={item.id || `${item.category}-${item.title}-${index}`} className="flex gap-4 items-start bg-analog-900/50 p-3 rounded-lg border border-analog-border/30">
                      {item.imageUrl && (
                        <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-analog-800 border border-analog-border/50">
                          <img 
                            src={item.imageUrl} 
                            alt={item.title} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      <div className="flex-grow pt-1 relative">
                        <div className="flex justify-between items-start mb-1 pr-8">
                          <h4 className="font-sans font-bold text-lg text-white leading-tight">{item.title}</h4>
                          <span className="font-mono font-bold text-lg text-analog-coral ml-2 shrink-0 pr-2 border-r border-analog-border/30 rtl:pr-0 rtl:pl-2 rtl:border-r-0 rtl:border-l whitespace-nowrap" dir="ltr">{item.price} ج</span>
                        </div>
                        {item.description && (
                          <p className="text-analog-muted text-xs leading-relaxed line-clamp-2 mt-2">
                            {item.description}
                          </p>
                        )}
                        <button
                          onClick={(e) => toggleFavorite(item.id || item.title, e)}
                          className="absolute top-1 right-0 text-analog-muted hover:text-analog-coral transition-colors"
                        >
                          <Heart size={18} fill={favorites.has(item.id || item.title) ? 'currentColor' : 'none'} className={favorites.has(item.id || item.title) ? 'text-analog-coral' : ''} />
                        </button>
                        {isAdmin && (
                          <div className="absolute top-8 right-0 flex flex-col gap-2">
                            <button
                              onClick={() => handleEditItemImage(item.id)}
                              className="text-analog-muted hover:text-blue-500 transition-colors bg-analog-900 rounded p-1"
                              title="تعديل الصورة"
                            >
                              <ImagePlus size={18} />
                            </button>
                            <button
                              onClick={async () => {
                                if (index === 0) return;
                                const itemA = subCatItems[index];
                                const itemB = subCatItems[index - 1];
                                if (!itemA.createdAt || !itemB.createdAt) return;
                                try {
                                  await updateDoc(doc(db, 'menuItems', itemA.id), { createdAt: itemB.createdAt });
                                  await updateDoc(doc(db, 'menuItems', itemB.id), { createdAt: itemA.createdAt });
                                } catch(e) {}
                              }}
                              className="text-analog-muted hover:text-white transition-colors bg-analog-900 rounded p-1 disabled:opacity-30"
                              title="نقل لأعلى"
                              disabled={index === 0}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                            </button>
                            <button
                              onClick={async () => {
                                if (index === subCatItems.length - 1) return;
                                const itemA = subCatItems[index];
                                const itemB = subCatItems[index + 1];
                                if (!itemA.createdAt || !itemB.createdAt) return;
                                try {
                                  await updateDoc(doc(db, 'menuItems', itemA.id), { createdAt: itemB.createdAt });
                                  await updateDoc(doc(db, 'menuItems', itemB.id), { createdAt: itemA.createdAt });
                                } catch(e) {}
                              }}
                              className="text-analog-muted hover:text-white transition-colors bg-analog-900 rounded p-1 disabled:opacity-30"
                              title="نقل لأسفل"
                              disabled={index === subCatItems.length - 1}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                            </button>
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="text-analog-muted hover:text-red-500 transition-colors bg-analog-900 rounded p-1"
                              title="حذف الصنف"
                            >
                              <Trash size={18} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )) : <p className="text-analog-muted">لا توجد أصناف في هذا القسم حالياً.</p>}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-12 pb-20">
      {/* Menu Cover */}
      <section className="-mx-4 -mt-6 mb-8 relative h-64 border-b border-analog-border/50">
        <div className="absolute inset-0 bg-gradient-to-t from-analog-950 via-analog-900/60 to-transparent z-10"></div>
        <img 
          src={menuCover}
          alt="Menu Cover" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-6 px-4 right-0 z-20 w-full text-right">
          <p className="font-mono text-[10px] tracking-widest text-analog-coral uppercase mb-2">
            أصناف متنوعة لكل الأذواق
          </p>
          <h1 className="font-serif italic text-5xl text-white leading-tight">
            منيو<br/>كان كافيه
          </h1>
        </div>
      </section>

      {/* Menu Header */}
      <section className="space-y-4">
        
        {/* Category Grid */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {Object.entries(categoryCovers).filter(([k]) => categoryNames[k]).map(([key, imgUrl], index) => {
            const isFullWidth = index === 0;
            return (
              <div
                key={key} 
                onClick={() => setSelectedCategory(key)}
                className={`${isFullWidth ? 'col-span-2 h-40' : 'h-32'} relative rounded-xl overflow-hidden border border-analog-border/50 block text-right w-full group cursor-pointer`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-analog-900 via-transparent to-transparent z-10 group-hover:bg-black/20 transition-colors"></div>
                <img src={imgUrl} alt={categoryNames[key]} className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
                <div className="absolute bottom-3 right-3 z-20">
                  <span className="font-mono text-[10px] tracking-widest text-analog-light uppercase bg-analog-900/90 backdrop-blur px-2 py-1 rounded border border-analog-border/50">
                    {categoryNames[key]}
                  </span>
                </div>
                {isAdmin && (
                  <button 
                    onClick={(e) => handleEditCategoryCover(key, e)}
                    className="absolute top-2 right-2 z-20 bg-analog-900/80 text-blue-400 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-analog-900 hover:text-blue-500"
                    title="تعديل غلاف القسم"
                  >
                    <ImagePlus size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

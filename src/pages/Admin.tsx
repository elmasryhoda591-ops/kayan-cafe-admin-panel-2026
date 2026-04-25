import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserFavorites from '../components/UserFavorites';
import { useAuthState } from '../hooks/useAuthState';
import { loginWithGoogle, logout, db } from '../firebase/config';
import { collection, addDoc, doc, setDoc, getDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { LogIn, LogOut, PlusCircle, Image as ImageIcon, Save, Users, Shield, ShieldAlert, Upload } from 'lucide-react';
import { compressImage } from '../utils/imageCompression';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';
import { seedKanMenu } from '../utils/seedData';
import { categoryNames } from '../components/Menu';

export default function Admin() {
  const { user, isAdmin, loading } = useAuthState();
  const [activeTab, setActiveTab] = useState<'offer' | 'menu' | 'decor' | 'covers' | 'contact' | 'users'>('offer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [usersList, setUsersList] = useState<any[]>([]);
  const defaultContactInfo = {
    phone: '',
    whatsapp: '',
    instagram: 'https://www.instagram.com/kan.coffee.bakery?igsh=MXFtaHpnbjd4cGQwcw==',
    facebook: 'https://www.facebook.com/share/1P3EZgfiqR/',
    address: 'دمنهور دوران الاستاد أمام رف هدوم',
    workingHours: '',
    cafeName: 'كان'
  };

  const [contactInfo, setContactInfo] = useState(defaultContactInfo);
  const [offerImage, setOfferImage] = useState<string | null>(null);
  const [menuImage, setMenuImage] = useState<string | null>(null);
  const [decorImage, setDecorImage] = useState<string | null>(null);
  
  const [homeCoverImage, setHomeCoverImage] = useState<string | null>(null);
  const [menuCoverImage, setMenuCoverImage] = useState<string | null>(null);
  
  const [targetCategoryCover, setTargetCategoryCover] = useState<string>('waffle');
  const [categoryCoverImage, setCategoryCoverImage] = useState<string | null>(null);

  const [covers, setCovers] = useState({ home: '', menu: '' });
  
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [targetItemImageId, setTargetItemImageId] = useState<string>('');
  const [itemImage, setItemImage] = useState<string | null>(null);

  const handleAddDecor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!decorImage) {
      setMessage({ text: 'يرجى اختيار صورة', type: 'error' });
      return;
    }
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });
    
    try {
      await addDoc(collection(db, 'decorImages'), {
        imageUrl: decorImage,
        createdAt: serverTimestamp()
      });
      setMessage({ text: 'تمت إضافة صورة الديكور بنجاح!', type: 'success' });
      form.reset();
      setDecorImage(null);
    } catch (error) {
      console.error("Error adding decor image:", error);
      setMessage({ text: 'حدث خطأ أثناء الإضافة', type: 'error' });
      handleFirestoreError(error, OperationType.CREATE, 'decorImages');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isAdmin && activeTab === 'contact') {
      const fetchContactInfo = async () => {
        try {
          const docRef = doc(db, 'settings', 'contact');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setContactInfo({
              ...defaultContactInfo,
              ...data,
              cafeName: data.cafeName || defaultContactInfo.cafeName,
              facebook: data.facebook || defaultContactInfo.facebook,
              instagram: data.instagram || defaultContactInfo.instagram,
              address: data.address || defaultContactInfo.address,
            } as any);
          }
        } catch (error) {
          console.error("Error fetching contact info:", error);
          handleFirestoreError(error, OperationType.GET, 'settings/contact');
        }
      };
      fetchContactInfo();
    }
  }, [isAdmin, activeTab]);

  useEffect(() => {
    if (isAdmin && activeTab === 'covers') {
      const fetchCovers = async () => {
        try {
          const docRef = doc(db, 'settings', 'covers');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
             setCovers({
               home: docSnap.data().home || '',
               menu: docSnap.data().menu || ''
             });
          }
        } catch (err) {
          console.error(err);
        }
      };
      
      const unsub = onSnapshot(collection(db, 'menuItems'), (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMenuItems(items);
        const editableItems = items.filter(item => !item.id.startsWith('kan_'));
        if (editableItems.length > 0 && !targetItemImageId) {
          setTargetItemImageId(editableItems[0].id);
        }
      });
      fetchCovers();
      return () => unsub();
    }
  }, [isAdmin, activeTab]);

  const handleUpdateCovers = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });
    
    try {
      const docRef = doc(db, 'settings', 'covers');
      await setDoc(docRef, {
        home: homeCoverImage || covers.home,
        menu: menuCoverImage || covers.menu
      }, { merge: true });
      setMessage({ text: 'تم تحديث الصور بنجاح!', type: 'success' });
      setHomeCoverImage(null);
      setMenuCoverImage(null);
      setCovers(prev => ({
        home: homeCoverImage || prev.home,
        menu: menuCoverImage || prev.menu
      }));
    } catch (error) {
      console.error(error);
      setMessage({ text: 'حدث خطأ أثناء التحديث', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategoryCover = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!categoryCoverImage) {
      setMessage({ text: 'يرجى اختيار صورة للقسم المختار', type: 'error' });
      return;
    }
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });
    
    try {
      const docRef = doc(db, 'settings', 'categoryCovers');
      await setDoc(docRef, {
        [targetCategoryCover]: categoryCoverImage
      }, { merge: true });
      setMessage({ text: 'تم تحديث غلاف القسم بنجاح!', type: 'success' });
      setCategoryCoverImage(null);
    } catch (error) {
      console.error(error);
      setMessage({ text: 'حدث خطأ أثناء التحديث', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateItemImage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!targetItemImageId) {
      setMessage({ text: 'يرجى اختيار الصنف أولاً (ملاحظة: الأصناف الافتراضية يجب إضافتها للوحة التحكم لتعديلها)', type: 'error' });
      return;
    }
    if (!itemImage) {
      setMessage({ text: 'يرجى اختيار صورة للصنف المختار', type: 'error' });
      return;
    }
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });
    
    try {
      if (targetItemImageId.startsWith('kan_')) {
        setMessage({ text: 'لا يمكن تعديل الأصناف الافتراضية، يرجى إضافتها من لوحة التحكم لتتمكن من تعديلها.', type: 'error' });
        setIsSubmitting(false);
        return;
      }
      const docRef = doc(db, 'menuItems', targetItemImageId);
      await updateDoc(docRef, {
        imageUrl: itemImage
      });
      setMessage({ text: 'تم تحديث صورة الصنف بنجاح!', type: 'success' });
      setItemImage(null);
    } catch (error) {
      console.error(error);
      setMessage({ text: 'حدث خطأ أثناء رفع الصورة', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isAdmin && activeTab === 'users') {
      const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsersList(usersData);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'users');
      });
      return () => unsub();
    }
  }, [isAdmin, activeTab]);

  const handleToggleRole = async (userId: string, currentRole: string, email: string) => {
    if (email === 'elmasryhoda591@gmail.com') {
      setMessage({ text: 'لا يمكن تغيير صلاحيات المدير الأساسي', type: 'error' });
      return;
    }
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setMessage({ text: 'تم تحديث الصلاحيات بنجاح', type: 'success' });
    } catch (error) {
      console.error("Error updating role:", error);
      setMessage({ text: 'حدث خطأ أثناء التحديث', type: 'error' });
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-analog-coral"></div></div>;
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="bg-analog-800 p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-analog-border">
          <h2 className="font-serif italic text-3xl font-bold text-white mb-6">تسجيل الدخول للإدارة</h2>
          <button 
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-analog-coral text-white py-3 px-4 rounded-xl hover:bg-analog-coral-hover transition-colors font-mono tracking-wider"
          >
            <LogIn size={20} />
            تسجيل الدخول بحساب جوجل
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <UserFavorites />;
  }

  const handleAddOffer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });
    
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const videoUrl = formData.get('videoUrl') as string;

    try {
      await addDoc(collection(db, 'offers'), {
        title,
        description: description || null,
        imageUrl: offerImage || null,
        videoUrl: videoUrl || null,
        createdAt: serverTimestamp()
      });
      setMessage({ text: 'تمت إضافة العرض بنجاح!', type: 'success' });
      form.reset();
      setOfferImage(null);
    } catch (error) {
      console.error("Error adding offer:", error);
      setMessage({ text: 'حدث خطأ أثناء الإضافة', type: 'error' });
      handleFirestoreError(error, OperationType.CREATE, 'offers');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMenuItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });
    
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const category = formData.get('category') as string;
    const subCategory = formData.get('subCategory') as string;

    try {
      await addDoc(collection(db, 'menuItems'), {
        title,
        description: description || null,
        price,
        category,
        subCategory: subCategory || null,
        imageUrl: menuImage || null,
        createdAt: serverTimestamp()
      });
      setMessage({ text: 'تمت إضافة الصنف بنجاح!', type: 'success' });
      form.reset();
      setMenuImage(null);
    } catch (error) {
      console.error("Error adding menu item:", error);
      setMessage({ text: 'حدث خطأ أثناء الإضافة', type: 'error' });
      handleFirestoreError(error, OperationType.CREATE, 'menuItems');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });
    
    const formData = new FormData(e.currentTarget);
    const data = {
      phone: formData.get('phone') as string || null,
      whatsapp: formData.get('whatsapp') as string || null,
      instagram: formData.get('instagram') as string || null,
      facebook: formData.get('facebook') as string || null,
      address: formData.get('address') as string || null,
      workingHours: formData.get('workingHours') as string || null,
      cafeName: formData.get('cafeName') as string || null,
    };

    try {
      await setDoc(doc(db, 'settings', 'contact'), data);
      setMessage({ text: 'تم تحديث معلومات التواصل بنجاح!', type: 'success' });
    } catch (error) {
      console.error("Error updating contact info:", error);
      setMessage({ text: 'حدث خطأ أثناء التحديث', type: 'error' });
      handleFirestoreError(error, OperationType.UPDATE, 'settings/contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setImgState: (val: string | null) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const compressedBase64 = await compressImage(file);
      setImgState(compressedBase64);
    } catch (err) {
      console.error("Error compressing image:", err);
      setMessage({ text: 'حدث خطأ أثناء معالجة الصورة', type: 'error' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif italic text-4xl font-bold text-white">لوحة التحكم</h1>
        <button 
          onClick={logout}
          className="flex items-center gap-2 text-analog-coral hover:text-analog-coral-hover px-4 py-2 rounded-lg transition-colors font-mono uppercase tracking-wider text-sm"
        >
          <LogOut size={18} />
          تسجيل الخروج
        </button>
      </div>

      <div className="bg-analog-800 rounded-2xl shadow-sm border border-analog-border overflow-hidden transition-colors duration-300">
        <div className="flex border-b border-analog-border overflow-x-auto hide-scrollbar">
          <button
            onClick={() => { setActiveTab('offer'); setMessage({ text: '', type: '' }); }}
            className={`flex-1 min-w-[120px] py-4 text-center font-mono tracking-wider uppercase text-sm transition-colors ${activeTab === 'offer' ? 'bg-analog-900 text-analog-coral border-b-2 border-analog-coral' : 'text-analog-muted hover:bg-analog-900 hover:text-analog-light'}`}
          >
            إضافة عرض
          </button>
          <button
            onClick={() => { setActiveTab('menu'); setMessage({ text: '', type: '' }); }}
            className={`flex-1 min-w-[120px] py-4 text-center font-mono tracking-wider uppercase text-sm transition-colors ${activeTab === 'menu' ? 'bg-analog-900 text-analog-coral border-b-2 border-analog-coral' : 'text-analog-muted hover:bg-analog-900 hover:text-analog-light'}`}
          >
            إضافة صنف
          </button>
          <button
            onClick={() => { setActiveTab('decor'); setMessage({ text: '', type: '' }); }}
            className={`flex-1 min-w-[120px] py-4 text-center font-mono tracking-wider uppercase text-sm transition-colors ${activeTab === 'decor' ? 'bg-analog-900 text-analog-coral border-b-2 border-analog-coral' : 'text-analog-muted hover:bg-analog-900 hover:text-analog-light'}`}
          >
            صور الديكور
          </button>
          <button
            onClick={() => { setActiveTab('contact'); setMessage({ text: '', type: '' }); }}
            className={`flex-1 min-w-[120px] py-4 text-center font-mono tracking-wider uppercase text-sm transition-colors ${activeTab === 'contact' ? 'bg-analog-900 text-analog-coral border-b-2 border-analog-coral' : 'text-analog-muted hover:bg-analog-900 hover:text-analog-light'}`}
          >
            معلومات التواصل
          </button>
          <button
            onClick={() => { setActiveTab('covers'); setMessage({ text: '', type: '' }); }}
            className={`flex-1 min-w-[120px] py-4 text-center font-mono tracking-wider uppercase text-sm transition-colors ${activeTab === 'covers' ? 'bg-analog-900 text-analog-coral border-b-2 border-analog-coral' : 'text-analog-muted hover:bg-analog-900 hover:text-analog-light'}`}
          >
            صور الأغلفة
          </button>
          <button
            onClick={() => { setActiveTab('users'); setMessage({ text: '', type: '' }); }}
            className={`flex-1 min-w-[120px] py-4 text-center font-mono tracking-wider uppercase text-sm transition-colors ${activeTab === 'users' ? 'bg-analog-900 text-analog-coral border-b-2 border-analog-coral' : 'text-analog-muted hover:bg-analog-900 hover:text-analog-light'}`}
          >
            المديرين
          </button>
        </div>

        <div className="p-6 md:p-8">
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg font-mono text-sm ${message.type === 'success' ? 'bg-green-900/20 text-green-400 border border-green-900/50' : 'bg-red-900/20 text-red-400 border border-red-900/50'}`}>
              {message.text}
            </div>
          )}

          {activeTab === 'offer' && (
            <form onSubmit={handleAddOffer} className="space-y-6">
              <div>
                <label className="block font-mono text-xs tracking-widest text-analog-muted uppercase mb-2">عنوان العرض *</label>
                <input required name="title" type="text" className="w-full px-4 py-3 border border-analog-border rounded-lg focus:ring-1 focus:ring-analog-coral focus:border-analog-coral outline-none bg-analog-900 text-white font-sans" placeholder="مثال: خصم 20% على القهوة" />
              </div>
              <div>
                <label className="block font-mono text-xs tracking-widest text-analog-muted uppercase mb-2">الوصف</label>
                <textarea name="description" rows={3} className="w-full px-4 py-3 border border-analog-border rounded-lg focus:ring-1 focus:ring-analog-coral focus:border-analog-coral outline-none bg-analog-900 text-white font-sans" placeholder="تفاصيل العرض..."></textarea>
              </div>
              <div>
                <label className="block font-mono text-xs tracking-widest text-analog-muted uppercase mb-2">صورة العرض</label>
                <div className="relative">
                  <input 
                    accept="image/*" 
                    onChange={(e) => handleImageUpload(e, setOfferImage)} 
                    type="file" 
                    className="w-full px-4 py-3 border border-analog-border rounded-lg focus:ring-1 focus:ring-analog-coral focus:border-analog-coral outline-none bg-analog-900 text-white font-sans file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-analog-800 file:text-analog-coral hover:file:bg-analog-700" 
                  />
                </div>
                {offerImage && (
                  <div className="mt-4 relative inline-block">
                    <img src={offerImage} alt="Preview" className="h-32 w-auto object-cover rounded-lg border border-analog-border" />
                    <button type="button" onClick={() => setOfferImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">×</button>
                  </div>
                )}
              </div>
              <button disabled={isSubmitting} type="submit" className="w-full flex items-center justify-center gap-2 bg-analog-coral text-white py-4 px-4 rounded-xl hover:bg-analog-coral-hover transition-colors font-mono tracking-wider uppercase disabled:opacity-70 mt-8">
                {isSubmitting ? 'جاري الإضافة...' : <><PlusCircle size={20} /> إضافة العرض</>}
              </button>
            </form>
          )}
          
          {activeTab === 'menu' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center bg-analog-900 border border-analog-border rounded-xl p-4">
                <div>
                  <h3 className="text-white font-bold mb-1">المنيو الافتراضي (كان)</h3>
                  <p className="text-analog-muted text-sm">سيتم مسح المنيو الحالي وإضافة كل أصناف كان كافيه الأساسية.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={async () => {
                      try {
                        const { query, collection, where, getDocs, updateDoc, doc } = await import('firebase/firestore');
                        const q = query(collection(db, 'menuItems'), where('title', '==', 'كولومبي'));
                        const snap = await getDocs(q);
                        for (const item of snap.docs) {
                          await updateDoc(doc(db, 'menuItems', item.id), { price: '95' });
                        }
                        setMessage({ text: 'تم تعديل سعر القهوة الكولومبي بنجاح!', type: 'success' });
                      } catch(e) {
                         setMessage({ text: 'حدث خطأ.', type: 'error' });
                      }
                    }}
                    className="bg-analog-800 text-white px-4 py-2 rounded-lg hover:bg-analog-700 transition-colors shrink-0 text-sm border border-analog-border/50"
                  >
                    تعديل سعر كولومبي لـ 95
                  </button>
                <button 
                  onClick={async () => {
                    if (window.confirm('هل أنت متأكد من رغبتك في مسح المنيو الحالي وإضافة المنيو الافتراضي لكان كافيه؟')) {
                      setIsSubmitting(true);
                      setMessage({ text: 'جاري إضافة المنيو...', type: '' });
                      const success = await seedKanMenu();
                      setIsSubmitting(false);
                      if (success) {
                        setMessage({ text: 'تمت إضافة المنيو بنجاح!', type: 'success' });
                      } else {
                        setMessage({ text: 'حدث خطأ أثناء إضافة المنيو.', type: 'error' });
                      }
                    }
                  }}
                  disabled={isSubmitting}
                  className="bg-analog-800 text-white px-4 py-2 rounded-lg hover:bg-analog-700 transition-colors shrink-0 text-sm border border-analog-border/50 disabled:opacity-50"
                >
                  إضافة منيو كان الافتراضي
                </button>
                </div>
              </div>
              <div className="h-[1px] bg-analog-border/50 w-full" />
              <form onSubmit={handleAddMenuItem} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-mono text-xs tracking-widest text-analog-muted uppercase mb-2">اسم الصنف *</label>
                  <input required name="title" type="text" className="w-full px-4 py-3 border border-analog-border rounded-lg focus:ring-1 focus:ring-analog-coral focus:border-analog-coral outline-none bg-analog-900 text-white font-sans" placeholder="مثال: آيس كراميل ميكاتو" />
                </div>
                <div>
                  <label className="block font-mono text-xs tracking-widest text-analog-muted uppercase mb-2">السعر (ج.م) *</label>
                  <input required name="price" type="text" className="w-full px-4 py-3 border border-analog-border rounded-lg focus:ring-1 focus:ring-analog-coral focus:border-analog-coral outline-none bg-analog-900 text-white font-mono" placeholder="مثال: 50 أو 40 / 35" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-mono text-xs tracking-widest text-analog-muted uppercase mb-2">القسم الأساسي *</label>
                  <select required name="category" className="w-full px-4 py-3 border border-analog-border rounded-lg focus:ring-1 focus:ring-analog-coral focus:border-analog-coral outline-none bg-analog-900 text-white font-sans">
                    <option value="turkish_coffee">مشاريب القهوة</option>
                    <option value="iced_coffee">آيس كوفي</option>
                    <option value="frappuccino">الفرابتشينو</option>
                    <option value="fresh_juices">عصائر فريش</option>
                    <option value="mocktail">موكتيل</option>
                    <option value="waffle">وافل</option>
                    <option value="kan_signature">سجنتشر كان</option>
                    <option value="shake">شيك</option>
                    <option value="additions">إضافات</option>
                    <option value="cold_drinks">سوفت درينك</option>
                    <option value="dessert">ديزرت</option>
                    <option value="bakery">مخبوزات</option>
                    <option value="espresso_drinks">مشروبات القهوة (اسبريسو)</option>
                    <option value="hot_chocolate">هوت شوكلت</option>
                    <option value="hot_drinks">مشروبات ساخنه</option>
                    <option value="smoothie">سموذي</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-xs tracking-widest text-analog-muted uppercase mb-2">القسم الفرعي (اختياري)</label>
                  <input name="subCategory" type="text" className="w-full px-4 py-3 border border-analog-border rounded-lg focus:ring-1 focus:ring-analog-coral focus:border-analog-coral outline-none bg-analog-900 text-white font-sans" placeholder="مثال: مشروبات القهوة، ايس كوفي..." />
                </div>
              </div>
              <div>
                <label className="block font-mono text-xs tracking-widest text-analog-muted uppercase mb-2">الوصف</label>
                <textarea name="description" rows={2} className="w-full px-4 py-3 border border-analog-border rounded-lg focus:ring-1 focus:ring-analog-coral focus:border-analog-coral outline-none bg-analog-900 text-white font-sans" placeholder="مكونات الصنف..."></textarea>
              </div>
              <div>
                <label className="block font-mono text-xs tracking-widest text-analog-muted uppercase mb-2">صورة الصنف</label>
                <div className="relative">
                  <input 
                    accept="image/*" 
                    onChange={(e) => handleImageUpload(e, setMenuImage)} 
                    type="file" 
                    className="w-full px-4 py-3 border border-analog-border rounded-lg focus:ring-1 focus:ring-analog-coral focus:border-analog-coral outline-none bg-analog-900 text-white font-sans file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-analog-800 file:text-analog-coral hover:file:bg-analog-700" 
                  />
                </div>
                {menuImage && (
                  <div className="mt-4 relative inline-block">
                    <img src={menuImage} alt="Preview" className="h-32 w-auto object-cover rounded-lg border border-analog-border" />
                    <button type="button" onClick={() => setMenuImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">×</button>
                  </div>
                )}
              </div>
              <button disabled={isSubmitting} type="submit" className="w-full flex items-center justify-center gap-2 bg-analog-coral text-white py-4 px-4 rounded-xl hover:bg-analog-coral-hover transition-colors font-mono tracking-wider uppercase disabled:opacity-70 mt-8">
                {isSubmitting ? 'جاري الإضافة...' : <><PlusCircle size={20} /> إضافة الصنف</>}
              </button>
            </form>
            </div>
          )}

          {activeTab === 'decor' && (
            <form onSubmit={handleAddDecor} className="space-y-6">
              <div className="bg-analog-900/50 p-4 rounded-lg border border-analog-border mb-6">
                <p className="text-sm text-analog-muted leading-relaxed">
                  يمكنك إضافة صور جديدة لقسم ديكور المكان لتظهر للزوار في صفحة الديكور.
                </p>
              </div>
              <div>
                <label className="block font-mono text-xs tracking-widest text-analog-muted uppercase mb-2">اختر الصورة *</label>
                <div className="relative">
                  <input 
                    accept="image/*" 
                    onChange={(e) => handleImageUpload(e, setDecorImage)} 
                    type="file" 
                    className="w-full px-4 py-3 border border-analog-border rounded-lg focus:ring-1 focus:ring-analog-coral focus:border-analog-coral outline-none bg-analog-900 text-white font-sans file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-analog-800 file:text-analog-coral hover:file:bg-analog-700" 
                  />
                </div>
                {decorImage && (
                  <div className="mt-4 relative inline-block">
                    <img src={decorImage} alt="Preview" className="h-32 w-auto object-cover rounded-lg border border-analog-border" />
                    <button type="button" onClick={() => setDecorImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">×</button>
                  </div>
                )}
              </div>
              <button disabled={isSubmitting} type="submit" className="w-full flex items-center justify-center gap-2 bg-analog-coral text-white py-4 px-4 rounded-xl hover:bg-analog-coral-hover transition-colors font-mono tracking-wider uppercase disabled:opacity-70 mt-8">
                {isSubmitting ? 'جاري الإضافة...' : <><PlusCircle size={20} /> إضافة الصورة</>}
              </button>
            </form>
          )}

          {activeTab === 'contact' && (
            <form onSubmit={handleUpdateContact} className="space-y-6">
              <div>
                <label className="block font-mono text-xs tracking-widest text-analog-muted uppercase mb-2">اسم الكافيه</label>
                <input defaultValue={contactInfo.cafeName} name="cafeName" type="text" className="w-full px-4 py-3 border border-analog-border rounded-lg focus:ring-1 focus:ring-analog-coral focus:border-analog-coral outline-none bg-analog-900 text-white font-sans" placeholder="مثال: كان" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-mono text-xs tracking-widest text-analog-muted uppercase mb-2">رقم الهاتف</label>
                  <input defaultValue={contactInfo.phone} name="phone" type="tel" className="w-full px-4 py-3 border border-analog-border rounded-lg focus:ring-1 focus:ring-analog-coral focus:border-analog-coral outline-none bg-analog-900 text-white font-mono text-left" dir="ltr" placeholder="+20 100 000 0000" />
                </div>
                <div>
                  <label className="block font-mono text-xs tracking-widest text-analog-muted uppercase mb-2">رقم الواتساب</label>
                  <input defaultValue={contactInfo.whatsapp} name="whatsapp" type="tel" className="w-full px-4 py-3 border border-analog-border rounded-lg focus:ring-1 focus:ring-analog-coral focus:border-analog-coral outline-none bg-analog-900 text-white font-mono text-left" dir="ltr" placeholder="+20 100 000 0000" />
                </div>
              </div>
              <div>
                <label className="block font-mono text-xs tracking-widest text-analog-muted uppercase mb-2">رابط انستجرام</label>
                <input defaultValue={contactInfo.instagram} name="instagram" type="url" className="w-full px-4 py-3 border border-analog-border rounded-lg focus:ring-1 focus:ring-analog-coral focus:border-analog-coral outline-none bg-analog-900 text-white font-mono text-left" dir="ltr" placeholder="https://instagram.com/..." />
              </div>
              <div>
                <label className="block font-mono text-xs tracking-widest text-analog-muted uppercase mb-2">رابط فيسبوك</label>
                <input defaultValue={contactInfo.facebook} name="facebook" type="url" className="w-full px-4 py-3 border border-analog-border rounded-lg focus:ring-1 focus:ring-analog-coral focus:border-analog-coral outline-none bg-analog-900 text-white font-mono text-left" dir="ltr" placeholder="https://facebook.com/..." />
              </div>
              <div>
                <label className="block font-mono text-xs tracking-widest text-analog-muted uppercase mb-2">العنوان</label>
                <textarea defaultValue={contactInfo.address} name="address" rows={2} className="w-full px-4 py-3 border border-analog-border rounded-lg focus:ring-1 focus:ring-analog-coral focus:border-analog-coral outline-none bg-analog-900 text-white font-sans" placeholder="عنوان الكافيه..."></textarea>
              </div>
              <div>
                <label className="block font-mono text-xs tracking-widest text-analog-muted uppercase mb-2">أوقات العمل</label>
                <input defaultValue={contactInfo.workingHours} name="workingHours" type="text" className="w-full px-4 py-3 border border-analog-border rounded-lg focus:ring-1 focus:ring-analog-coral focus:border-analog-coral outline-none bg-analog-900 text-white font-sans" placeholder="مثال: يومياً من 9 صباحاً حتى 12 منتصف الليل" />
              </div>
              <button disabled={isSubmitting} type="submit" className="w-full flex items-center justify-center gap-2 bg-analog-coral text-white py-4 px-4 rounded-xl hover:bg-analog-coral-hover transition-colors font-mono tracking-wider uppercase disabled:opacity-70 mt-8">
                {isSubmitting ? 'جاري الحفظ...' : <><Save size={20} /> حفظ التعديلات</>}
              </button>
            </form>
          )}

          {activeTab === 'covers' && (
            <div className="space-y-8">
              <form onSubmit={handleUpdateCovers} className="space-y-6">
                <div className="bg-analog-900/50 p-4 rounded-lg border border-analog-border mb-6">
                  <p className="text-sm text-analog-muted leading-relaxed">
                     يمكنك من هنا تغيير صورة الغلاف للصفحة الرئيسية وصورة غلاف قائمة المنيو.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="bg-analog-800 p-6 rounded-xl border border-analog-border">
                    <label className="block font-serif italic text-lg text-white mb-2">غلاف الصفحة الرئيسية</label>
                    {covers.home && !homeCoverImage && (
                      <img src={covers.home} alt="Home" className="w-full h-32 object-cover rounded-lg mb-4 border border-analog-border" />
                    )}
                    <input 
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(e, setHomeCoverImage)} 
                      type="file" 
                      className="w-full px-4 py-3 border border-analog-border rounded-lg bg-analog-900 text-white font-sans file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-analog-800 file:text-analog-coral" 
                    />
                    {homeCoverImage && (
                      <div className="mt-4 relative inline-block">
                        <img src={homeCoverImage} alt="Preview Home" className="h-32 w-auto object-cover rounded-lg border border-analog-border" />
                        <button type="button" onClick={() => setHomeCoverImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">×</button>
                      </div>
                    )}
                  </div>

                  <div className="bg-analog-800 p-6 rounded-xl border border-analog-border">
                    <label className="block font-serif italic text-lg text-white mb-2">غلاف المنيو</label>
                    {covers.menu && !menuCoverImage && (
                      <img src={covers.menu} alt="Menu" className="w-full h-32 object-cover rounded-lg mb-4 border border-analog-border" />
                    )}
                    <input 
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(e, setMenuCoverImage)} 
                      type="file" 
                      className="w-full px-4 py-3 border border-analog-border rounded-lg bg-analog-900 text-white font-sans file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-analog-800 file:text-analog-coral" 
                    />
                    {menuCoverImage && (
                      <div className="mt-4 relative inline-block">
                        <img src={menuCoverImage} alt="Preview Menu" className="h-32 w-auto object-cover rounded-lg border border-analog-border" />
                        <button type="button" onClick={() => setMenuCoverImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">×</button>
                      </div>
                    )}
                  </div>
                </div>

                <button disabled={isSubmitting} type="submit" className="w-full flex items-center justify-center gap-2 bg-analog-coral text-white py-4 px-4 rounded-xl hover:bg-analog-coral-hover transition-colors font-mono tracking-wider uppercase disabled:opacity-70 mt-8">
                  {isSubmitting ? 'جاري التحديث...' : <><Save size={20} /> تحديث الصور</>}
                </button>
              </form>
              
              <form onSubmit={handleUpdateCategoryCover} className="bg-analog-900/50 p-6 rounded-xl border border-analog-border">
                <h3 className="font-serif italic text-xl text-white mb-4">صور أغلفة أقسام المنيو</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block font-mono text-xs tracking-widest text-analog-muted uppercase mb-2">اختر القسم</label>
                    <select 
                      value={targetCategoryCover}
                      onChange={(e) => setTargetCategoryCover(e.target.value)}
                      className="w-full px-4 py-3 border border-analog-border rounded-lg focus:ring-1 focus:ring-analog-coral focus:border-analog-coral outline-none bg-analog-900 text-white font-sans"
                    >
                      {Object.entries(categoryNames).map(([key, name]) => (
                        <option key={key} value={key}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-xs tracking-widest text-analog-muted uppercase mb-2">اختر الصورة</label>
                    <input 
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(e, setCategoryCoverImage)} 
                      type="file" 
                      className="w-full px-4 py-3 border border-analog-border rounded-lg bg-analog-900 text-white font-sans file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-analog-800 file:text-analog-coral" 
                    />
                    {categoryCoverImage && (
                      <div className="mt-4 relative inline-block">
                        <img src={categoryCoverImage} alt="Preview Category" className="h-32 w-auto object-cover rounded-lg border border-analog-border" />
                        <button type="button" onClick={() => setCategoryCoverImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">×</button>
                      </div>
                    )}
                  </div>
                  <button disabled={isSubmitting} type="submit" className="w-full flex items-center justify-center gap-2 bg-analog-coral text-white py-4 px-4 rounded-xl hover:bg-analog-coral-hover transition-colors font-mono tracking-wider uppercase disabled:opacity-70 mt-4">
                    {isSubmitting ? 'جاري التحديث...' : <><Save size={20} /> تحديث غلاف القسم</>}
                  </button>
                </div>
              </form>

              <form onSubmit={handleUpdateItemImage} className="bg-analog-900/50 p-6 rounded-xl border border-analog-border">
                <h3 className="font-serif italic text-xl text-white mb-4">تعديل صور الأصناف المضافة</h3>
                <p className="text-xs text-analog-muted mb-4 leading-relaxed">
                  ملاحظة: يمكنك فقط تعديل صور الأصناف التي قمت بإضافتها من لوحة التحكم. الأصناف الافتراضية محجوزة.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block font-mono text-xs tracking-widest text-analog-muted uppercase mb-2">اختر الصنف</label>
                    <select 
                      value={targetItemImageId}
                      onChange={(e) => setTargetItemImageId(e.target.value)}
                      className="w-full px-4 py-3 border border-analog-border rounded-lg focus:ring-1 focus:ring-analog-coral focus:border-analog-coral outline-none bg-analog-900 text-white font-sans"
                    >
                      {menuItems.filter(item => !item.id.startsWith('kan_')).length === 0 && (
                        <option value="">لا توجد أصناف مضافة حالياً</option>
                      )}
                      {menuItems.filter(item => !item.id.startsWith('kan_')).map((item) => (
                        <option key={item.id} value={item.id}>{item.title} ({categoryNames[item.category] || item.category})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-xs tracking-widest text-analog-muted uppercase mb-2">اختر الصورة</label>
                    <input 
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(e, setItemImage)} 
                      type="file" 
                      className="w-full px-4 py-3 border border-analog-border rounded-lg bg-analog-900 text-white font-sans file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-analog-800 file:text-analog-coral" 
                    />
                    {itemImage && (
                      <div className="mt-4 relative inline-block">
                        <img src={itemImage} alt="Preview Item" className="h-32 w-auto object-cover rounded-lg border border-analog-border" />
                        <button type="button" onClick={() => setItemImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">×</button>
                      </div>
                    )}
                  </div>
                  <button disabled={isSubmitting} type="submit" className="w-full flex items-center justify-center gap-2 bg-analog-coral text-white py-4 px-4 rounded-xl hover:bg-analog-coral-hover transition-colors font-mono tracking-wider uppercase disabled:opacity-70 mt-4">
                    {isSubmitting ? 'جاري التحديث...' : <><Save size={20} /> تحديث صورة الصنف</>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="bg-analog-900/50 p-4 rounded-lg border border-analog-border mb-6">
                <p className="text-sm text-analog-muted leading-relaxed">
                  من هنا يمكنك إدارة صلاحيات المستخدمين. أي شخص يقوم بتسجيل الدخول سيظهر في هذه القائمة كـ "مستخدم عادي". يمكنك ترقيته إلى "مدير" ليتمكن من إضافة العروض والمنيو وتعديل معلومات التواصل.
                </p>
              </div>
              <div className="space-y-4">
                {usersList.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-4 bg-analog-900 rounded-lg border border-analog-border">
                    <div>
                      <p className="text-white font-sans">{u.email}</p>
                      <p className="text-xs font-mono mt-1 text-analog-muted">
                        {u.role === 'admin' ? 'مدير (Admin)' : 'مستخدم (User)'}
                      </p>
                    </div>
                    {u.email !== 'elmasryhoda591@gmail.com' && (
                      <button
                        onClick={() => handleToggleRole(u.id, u.role, u.email)}
                        className={`px-4 py-2 rounded text-xs font-mono tracking-wider uppercase transition-colors ${u.role === 'admin' ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/50' : 'bg-green-900/20 text-green-400 hover:bg-green-900/40 border border-green-900/50'}`}
                      >
                        {u.role === 'admin' ? 'إزالة الصلاحية' : 'ترقية لمدير'}
                      </button>
                    )}
                    {u.email === 'elmasryhoda591@gmail.com' && (
                      <span className="px-4 py-2 text-xs font-mono text-analog-coral">المدير الأساسي</span>
                    )}
                  </div>
                ))}
                {usersList.length === 0 && (
                  <p className="text-center text-analog-muted py-8">لا يوجد مستخدمين حالياً</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

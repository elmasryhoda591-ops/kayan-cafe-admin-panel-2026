import React, { useState, useEffect } from 'react';
import { useAuthState } from '../hooks/useAuthState';
import { loginWithGoogle, logout, db } from '../firebase/config';
import { collection, addDoc, doc, setDoc, getDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { LogIn, LogOut, PlusCircle, Image as ImageIcon, Save, Users, Shield, ShieldAlert, Upload } from 'lucide-react';
import { compressImage } from '../utils/imageCompression';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';
import { seedKanMenu } from '../utils/seedData';

export default function Admin() {
  const { user, isAdmin, loading } = useAuthState();
  const [activeTab, setActiveTab] = useState<'offer' | 'menu' | 'contact' | 'users'>('offer');
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
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="bg-analog-800 p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-analog-border">
          <h2 className="font-serif italic text-2xl font-bold text-analog-coral mb-4">عذراً، غير مصرح لك بالدخول</h2>
          <p className="text-analog-muted mb-6">هذه الصفحة مخصصة لإدارة الكافيه فقط.</p>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 bg-analog-900 text-analog-light py-3 px-4 rounded-xl hover:bg-analog-700 transition-colors font-mono tracking-wider border border-analog-border"
          >
            <LogOut size={20} />
            تسجيل الخروج
          </button>
        </div>
      </div>
    );
  }

  const handleAddOffer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
      e.currentTarget.reset();
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
      e.currentTarget.reset();
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
            onClick={() => { setActiveTab('contact'); setMessage({ text: '', type: '' }); }}
            className={`flex-1 min-w-[120px] py-4 text-center font-mono tracking-wider uppercase text-sm transition-colors ${activeTab === 'contact' ? 'bg-analog-900 text-analog-coral border-b-2 border-analog-coral' : 'text-analog-muted hover:bg-analog-900 hover:text-analog-light'}`}
          >
            معلومات التواصل
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
                    <option value="cold_drinks">مشروبات باردة</option>
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

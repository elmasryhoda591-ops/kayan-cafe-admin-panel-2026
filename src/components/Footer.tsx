import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Phone, MessageCircle, Instagram, Facebook, MapPin, Clock } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export default function Footer() {
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

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'contact'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setContactInfo({
          ...defaultContactInfo,
          ...data,
          cafeName: data.cafeName || defaultContactInfo.cafeName,
          facebook: data.facebook || defaultContactInfo.facebook,
          instagram: data.instagram || defaultContactInfo.instagram,
          address: data.address || defaultContactInfo.address,
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/contact');
    });
    return () => unsubscribe();
  }, []);

  const hasContactInfo = Object.values(contactInfo).some(val => typeof val === 'string' && val.trim() !== '');

  if (!hasContactInfo) return null;

  return (
    <footer className="bg-analog-900 border-t border-analog-border mt-12 pb-24 pt-12 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-8">
        <h2 className="font-serif italic text-3xl text-white">تواصل معنا</h2>
        
        <div className="flex flex-wrap justify-center gap-6">
          {contactInfo.phone && (
            <a href={`tel:${contactInfo.phone}`} className="flex flex-col items-center gap-2 text-analog-muted hover:text-analog-coral transition-colors">
              <div className="w-12 h-12 rounded-full bg-analog-800 border border-analog-border flex items-center justify-center">
                <Phone size={20} />
              </div>
              <span className="font-mono text-xs tracking-widest uppercase">اتصال</span>
            </a>
          )}
          {contactInfo.whatsapp && (
            <a href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 text-analog-muted hover:text-green-500 transition-colors">
              <div className="w-12 h-12 rounded-full bg-analog-800 border border-analog-border flex items-center justify-center">
                <MessageCircle size={20} />
              </div>
              <span className="font-mono text-xs tracking-widest uppercase">واتساب</span>
            </a>
          )}
          {contactInfo.instagram && (
            <a href={contactInfo.instagram} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 text-analog-muted hover:text-pink-500 transition-colors">
              <div className="w-12 h-12 rounded-full bg-analog-800 border border-analog-border flex items-center justify-center">
                <Instagram size={20} />
              </div>
              <span className="font-mono text-xs tracking-widest uppercase">انستجرام</span>
            </a>
          )}
          {contactInfo.facebook && (
            <a href={contactInfo.facebook} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 text-analog-muted hover:text-blue-500 transition-colors">
              <div className="w-12 h-12 rounded-full bg-analog-800 border border-analog-border flex items-center justify-center">
                <Facebook size={20} />
              </div>
              <span className="font-mono text-xs tracking-widest uppercase">فيسبوك</span>
            </a>
          )}
        </div>

        <div className="flex flex-col items-center gap-4">
          {contactInfo.address && (
            <div className="flex items-center gap-2 text-analog-muted max-w-xs mx-auto">
              <MapPin size={18} className="shrink-0 text-analog-coral" />
              <p className="text-sm leading-relaxed">{contactInfo.address}</p>
            </div>
          )}
          
          {contactInfo.workingHours && (
            <div className="flex items-center gap-2 text-analog-muted max-w-xs mx-auto">
              <Clock size={18} className="shrink-0 text-analog-coral" />
              <p className="text-sm leading-relaxed">{contactInfo.workingHours}</p>
            </div>
          )}
        </div>

        <div className="pt-8 border-t border-analog-border/50 w-full">
          <p className="font-mono text-[10px] tracking-widest text-analog-muted uppercase">
            © {new Date().getFullYear()} {contactInfo.cafeName} Cafe. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

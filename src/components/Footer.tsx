import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Phone, MessageCircle, Instagram, Facebook, MapPin, Clock } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export default function Footer() {
  const defaultContactInfo = {
    phone: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    address: '',
    workingHours: '',
    cafeName: 'محمود'
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
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/contact');
    });
    return () => unsubscribe();
  }, []);

  return (
    <footer className="bg-analog-900 border-t border-analog-border mt-12 pb-24 pt-12 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-8">
        
        <div className="pt-8 border-t border-analog-border/50 w-full">
          <p className="font-mono text-[10px] tracking-widest text-analog-muted uppercase">
            © {new Date().getFullYear()} {contactInfo.cafeName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

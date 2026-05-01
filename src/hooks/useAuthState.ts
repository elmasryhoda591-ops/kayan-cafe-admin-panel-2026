import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const unsubDoc = onSnapshot(userRef, async (docSnap) => {
          if (docSnap.exists()) {
            const isDefaultAdmin = currentUser.email === 'elmasryhoda591@gmail.com' && currentUser.emailVerified;
            setIsAdmin(isDefaultAdmin);
            setLoading(false);
          } else {
            // Create the user document
            try {
              await setDoc(userRef, {
                email: currentUser.email,
                role: 'user',
                createdAt: serverTimestamp()
              });
              setIsAdmin(currentUser.email === 'elmasryhoda591@gmail.com' && currentUser.emailVerified);
            } catch (error) {
              console.error("Error creating user document:", error);
              setIsAdmin(currentUser.email === 'elmasryhoda591@gmail.com' && currentUser.emailVerified);
            }
            setLoading(false);
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
        });
        return () => unsubDoc();
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  return { user, isAdmin, loading };
}

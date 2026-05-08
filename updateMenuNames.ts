import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from './src/firebase/config';

async function updateDb() {
  console.log('Fetching menuItems...', db);
  try {
    const q = await getDocs(collection(db, 'menuItems'));
    console.log(`Found ${q.docs.length} items`);
    for (const d of q.docs) {
      const data = d.data();
      let updated = false;
      const updates: any = {};
      
      if (data.title === 'سموث سيدر') {
        updates.title = 'هوت سيدر';
        updated = true;
      }
      if (data.title === 'برتقال') {
        updates.price = '60';
        updated = true;
      }
      if (data.title === 'قهوة استرويج') {
        updates.title = 'قهوه استرونج';
        updated = true;
      }
      
      if (updated) {
        console.log(`Updating document ${d.id}`, updates);
        await updateDoc(doc(db, 'menuItems', d.id), updates);
      }
    }
    console.log('Update finished.');
  } catch (e) {
    console.error(e);
  }
}

updateDb().then(() => process.exit(0)).catch(() => process.exit(1));

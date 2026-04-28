import { collection, addDoc, serverTimestamp, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const kanMenuData = [
  // مشاريب القهوة (turkish_coffee)
  { title: "قهوة تركي", price: "40 / 35", category: "turkish_coffee" },
  { title: "قهوة استروج", price: "60 / 40", category: "turkish_coffee" },
  { title: "قهوة محوج", price: "50 / 35", category: "turkish_coffee" },
  { title: "قهوة فرنساوي", price: "65", category: "turkish_coffee" },
  { title: "فرنساوي إضافات", price: "70", category: "turkish_coffee" },

  // آيس كوفي (iced_coffee)
  { title: "آيس لاتيه", price: "60", category: "iced_coffee" },
  { title: "آيس دالجونا", price: "70", category: "iced_coffee" },
  { title: "آيس موكا", price: "70", category: "iced_coffee" },
  { title: "آيس بستاشيو لاتيه", price: "85", category: "iced_coffee" },
  { title: "آيس كراميل ميكاتو", price: "70", category: "iced_coffee" },
  { title: "آيس سبانش", price: "80", category: "iced_coffee" },
  { title: "آيس ماتشا", price: "70", category: "iced_coffee" },

  // الفرابتشينو (frappuccino)
  { title: "فرابتشينو كلاسيك", price: "70", category: "frappuccino" },
  { title: "فرابتشينو موكا", price: "75", category: "frappuccino" },
  { title: "فرابتشينو كراميل", price: "70", category: "frappuccino" },
  { title: "فرابتشينو Kan", price: "85", category: "frappuccino" },

  // عصائر فريش (fresh_juices)
  { title: "مانجو", price: "65", category: "fresh_juices" },
  { title: "برتقال", price: "60", category: "fresh_juices" },
  { title: "فراولة", price: "65", category: "fresh_juices" },
  { title: "ليمون نعناع", price: "55", category: "fresh_juices" },
  { title: "موز", price: "65", category: "fresh_juices" },
  { title: "بطيخ", price: "55", category: "fresh_juices" },
  { title: "كيوي", price: "70", category: "fresh_juices" },
  { title: "زبادي بالفراولة", price: "75", category: "fresh_juices" },
  { title: "افوكادو", price: "75", category: "fresh_juices" },
  { title: "بلاك بيري", price: "80", category: "fresh_juices" },
  { title: "دراجون فروت", price: "75", category: "fresh_juices" },
  { title: "ايس كريم بيتزا", price: "70", category: "fresh_juices" },
  { title: "موز حليب", price: "80", category: "fresh_juices" },
  { title: "كيوي حليب", price: "85", category: "fresh_juices" },
  { title: "افوكادوا", price: "85", category: "fresh_juices" },

  // موكتيل (mocktail)
  { title: "بلو بانا", price: "70", category: "mocktail" },
  { title: "جوافة بلو بيري", price: "75", category: "mocktail" },
  { title: "فلوريدا", price: "75", category: "mocktail" },
  { title: "تروبيكال", price: "80", category: "mocktail" },
  { title: "وايت جولد", price: "75", category: "mocktail" },
  { title: "بينا كولادا", price: "70", category: "mocktail" },
  { title: "مانجو بيري", price: "80", category: "mocktail" },
  { title: "مانجو كيوى", price: "85", category: "mocktail" },
  { title: "افريكانوا", price: "85", category: "mocktail" },

  // وافل (waffle)
  { title: "وافل كلاسيك", price: "75", category: "waffle" },
  { title: "وافل فور سيزون", price: "88", category: "waffle" },

  // مشاريب سعوديه (kan_signature)
  { title: "شاي فليفر", price: "35", category: "kan_signature" },
  { title: "شاي مبخر", price: "40", category: "kan_signature" },
  { title: "شاي عدني", price: "55", category: "kan_signature" },
  { title: "شاي كرك", price: "55", category: "kan_signature" },
  { title: "قهوة عربي", price: "50", category: "kan_signature" },

  // شيك (shake)
  { title: "شيك اسبيشيال", description: "تشيز كيك - ريد فيلفت - جلاكسي - براون", price: "110", category: "shake" },
  { title: "شيك فليفر", price: "75", category: "shake" },
  { title: "شيك كلاسيك", price: "65", category: "shake" },

  // إضافات (additions)
  { title: "ايس كريم", price: "15", category: "additions" },
  { title: "عسل", price: "20", category: "additions" },
  { title: "مكسرات", price: "35", category: "additions" },
  { title: "حليب", price: "30", category: "additions" },
  { title: "ويبد كريم", price: "30", category: "additions" },
  { title: "فليفر", price: "30", category: "additions" },
  { title: "توبينج", price: "30", category: "additions" },
  { title: "صوص", price: "20", category: "additions" },

  // مشروبات باردة (cold_drinks)
  { title: "مياه معدنية", price: "10", category: "cold_drinks" },
  { title: "ريد بول", price: "75", category: "cold_drinks" },
  { title: "مياه غازية", price: "35", category: "cold_drinks" },
  { title: "أورنچ ميست", price: "65", category: "cold_drinks" },
  { title: "باشون لايت", price: "75", category: "cold_drinks" },
  { title: "بلاك شاين", price: "65", category: "cold_drinks" },
  { title: "شيري كولا", price: "60", category: "cold_drinks" },
  { title: "موهيتو فليفر", price: "65", category: "cold_drinks" },
  { title: "موهيتو كلاسيك", price: "60", category: "cold_drinks" },

  // ديزرت (dessert)
  { title: "سينابون", price: "65", category: "dessert" },
  { title: "براونيز", price: "65", category: "dessert" },
  { title: "ميني فادچ", price: "90", category: "dessert" },
  { title: "مولتن", price: "95", category: "dessert" },
  { title: "سان سباستيان", price: "75", category: "dessert" },
  { title: "تشيز كيك", price: "70", category: "dessert" },

  // مخبوزات (bakery)
  { title: "ميكس بيف", price: "115", category: "bakery" },
  { title: "ميكس مدخن", price: "100", category: "bakery" },
  { title: "ميكس تشيز", price: "80", category: "bakery" },

  // مشروبات القهوة (اسبريسو) (espresso_drinks)
  { title: "اسبرسو", price: "40 / 55", category: "espresso_drinks" },
  { title: "ميكاتو", price: "45 / 60", category: "espresso_drinks" },
  { title: "ميكاتو كراميل", price: "50 / 65", category: "espresso_drinks" },
  { title: "كورادو", price: "55", category: "espresso_drinks" },
  { title: "لاتيه", price: "60", category: "espresso_drinks" },
  { title: "كابتشينو", price: "65", category: "espresso_drinks" },
  { title: "موكا", price: "70", category: "espresso_drinks" },
  { title: "أمريكانو", price: "45", category: "espresso_drinks" },
  { title: "سبانش لاتيه", price: "75", category: "espresso_drinks" },
  { title: "فلات وايت", price: "80", category: "espresso_drinks" },
  { title: "هاوس بليند", price: "60", category: "espresso_drinks" },
  { title: "قهوة سريعة التحضير", price: "70", category: "espresso_drinks" },
  { title: "ماتشا", price: "70", category: "espresso_drinks" },
  { title: "كولومبي", price: "95", category: "espresso_drinks" },

  // هوت شوكلت (hot_chocolate)
  { title: "هوت شوكلت كلاسيك", price: "60", category: "hot_chocolate" },
  { title: "هوت شوكلت اضافات", price: "65", category: "hot_chocolate" },
  { title: "هوت شوكلت Kan", price: "65", category: "hot_chocolate" },
  { title: "هوت شوكلت مارشملو", price: "85", category: "hot_chocolate" },
  { title: "سحلب كلاسيك", price: "45", category: "hot_chocolate" },

  // مشروبات ساخنه (hot_drinks)
  { title: "هوت سيدر", price: "45", category: "hot_drinks" },
  { title: "أعشاب", price: "30", category: "hot_drinks" },
  { title: "فيتامين C", price: "55", category: "hot_drinks" },
];

export const seedKanMenu = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'menuItems'));
    // Delete existing old items
    const deletePromises = querySnapshot.docs.map(docSnapshot => deleteDoc(doc(db, 'menuItems', docSnapshot.id)));
    await Promise.all(deletePromises);

    // Add new items
    const addPromises = kanMenuData.map(item => 
      addDoc(collection(db, 'menuItems'), {
        ...item,
        createdAt: serverTimestamp()
      })
    );
    await Promise.all(addPromises);
    console.log("Seeding complete");
    return true;
  } catch (error) {
    console.error("Error seeding data:", error);
    return false;
  }
};

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc } from 'firebase/firestore';
import 'dotenv/config';

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearOrders() {
    console.log('🧹 Clearing Order History & Stats...');

    try {
        // Target: stores/default/orders
        const ordersRef = collection(db, 'stores', 'default', 'orders');
        const snapshot = await getDocs(ordersRef);

        if (snapshot.empty) {
            console.log('✅ No orders to delete.');
            process.exit(0);
        }

        console.log(`Found ${snapshot.size} orders. Deleting...`);

        // Delete fake orders one by one (Client SDK limit)
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        console.log('✅ All orders deleted successfully.');
        console.log('📊 Revenue stats should now be reset to 0.');
        console.log('🏪 Store settings and menus are PRESERVED.');

    } catch (e) {
        console.error('Error clearing orders:', e);
    }
    process.exit(0);
}

clearOrders();

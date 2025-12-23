import { initializeApp } from 'firebase/app';
import { getFirestore, doc, deleteDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import 'dotenv/config'; // Load env vars

// Config specifically for this script's environment
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

async function reset() {
    console.log('🔄 Resetting Database for Production...');

    try {
        // 1. Delete the main store document
        // This is the trigger for "Store Setup Wizard"
        await deleteDoc(doc(db, 'stores', 'default'));
        console.log('✅ Deleted stores/default');

        // 2. We can try to delete subcollections if rules allow (Admin might need to do this)
        // Since we are running this likely as a script, we might not be authenticated as Admin.
        // The previous seeding script ran in the browser? 
        // Ah, the user was editing `seed_v2_data.mjs` but running `npm run dev` and clicking a button.
        // There is no easy way to delete EVERYTHING from a node script without Service Account.

        console.log('⚠️  Note: Subcollections (orders, menus) remain. Firestore requires recursive delete.');
        console.log('⚠️  Please manually delete the "stores" collection in Firebase Console if you want a squeaky clean start.');
        console.log('ℹ️  However, deleting "stores/default" is enough to trigger the Setup Wizard.');

    } catch (e) {
        console.error('Error:', e);
    }
    process.exit(0);
}

reset();

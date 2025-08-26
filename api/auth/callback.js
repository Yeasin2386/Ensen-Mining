// প্রয়োজনীয় প্যাকেজগুলো ইম্পোর্ট করা হচ্ছে
const axios = require('axios');
const admin = require('firebase-admin');

// এখানে আপনার Firebase Service Account Key ফাইলটি লোড করতে হবে।
// এটি আপনার প্রজেক্টের রুট ডিরেক্টরিতে রাখতে পারেন অথবা ভেরিয়েবল হিসেবেও রাখতে পারেন।
const serviceAccount = require('../../path/to/your-service-account-file.json');

// Firebase Admin SDK ইনিশিয়ালাইজ করা হচ্ছে
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// সার্ভারলেস ফাংশন হ্যান্ডেলার
module.exports = async (req, res) => {
  // শুধুমাত্র POST রিকোয়েস্ট হ্যান্ডেল করা হচ্ছে
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { code, client_id, redirect_uri } = req.body;

    // Google-এর কাছে Access Token চাওয়ার জন্য রিকোয়েস্ট তৈরি করা হচ্ছে
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri,
      grant_type: 'authorization_code',
    });

    const accessToken = tokenResponse.data.access_token;

    // Access Token ব্যবহার করে ব্যবহারকারীর তথ্য (email, name, picture) নেওয়া হচ্ছে
    const userinfoResponse = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const userData = userinfoResponse.data;

    // Firebase-এর 'users' কালেকশনে ব্যবহারকারীর ডেটা সেভ করা হচ্ছে
    const userRef = db.collection('users').doc(userData.email);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // যদি ব্যবহারকারী নতুন হয়, তবে ডেটাবেজে তার তথ্য সংরক্ষণ করা হচ্ছে
      await userRef.set({
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        balance: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log('New user created:', userData.email);
    } else {
      console.log('User already exists:', userData.email);
    }

    res.status(200).json({ success: true, message: 'User data saved successfully' });
  } catch (error) {
    console.error('Error in authentication process:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Authentication failed' });
  }
};

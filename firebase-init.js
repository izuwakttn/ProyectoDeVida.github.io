    // Import the functions you need from the SDKs you need
    import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
    import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-analytics.js";
    import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";
    import { getFirestore } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";
    // TODO: Add SDKs for Firebase products that you want to use
    // https://firebase.google.com/docs/web/setup#available-libraries

    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
        apiKey: "AIzaSyAs0vdUxwlpdZupNu9pYa6I3rInugLxDMs",
        authDomain: "proyectodevida-da775.firebaseapp.com",
        projectId: "proyectodevida-da775",
        storageBucket: "proyectodevida-da775.appspot.com",
        messagingSenderId: "1044879203982",
        appId: "1:1044879203982:web:d6a3d9eab1e8040780f3df",
        measurementId: "G-T7E82Z9B2P"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);
    const auth = getAuth(app);
    const db = getFirestore(app);

    export {app,auth,db}
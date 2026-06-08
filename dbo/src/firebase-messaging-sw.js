
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAc5BLf_dpjgF7eLduhFoQfj6bPFej3CSY",
  authDomain: "dboul-1173d.firebaseapp.com",
  projectId: "dboul-1173d",
  storageBucket: "dboul-1173d.firebasestorage.app",
  messagingSenderId: "811115728563",
  appId: "1:811115728563:web:ca87d91b9276a387f4eac6",
  measurementId: "G-7CZJ1N0JE0"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

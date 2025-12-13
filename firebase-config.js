// firebase-config.js
console.log('Inicializando Firebase...');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA5KEaKntt9wPYcy60DutrqvIH34piXsXk",
  authDomain: "transporte-f7aea.firebaseapp.com",
  databaseURL: "https://transporte-f7aea-default-rtdb.firebaseio.com",
  projectId: "transporte-f7aea",
  storageBucket: "transporte-f7aea.firebasestorage.app",
  messagingSenderId: "551406731008",
  appId: "1:551406731008:web:90855ffcd9ac0ef1d93de5"
};

// Inicializar Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log('Firebase inicializado com sucesso');
} catch (error) {
  console.error('Erro ao inicializar Firebase:', error);
}

// Referências do Firebase
const auth = firebase.auth();
const db = firebase.firestore();
const messaging = firebase.messaging();

// Configurar notificações
function initFirebaseMessaging() {
  if ('Notification' in window && Notification.permission === 'granted') {
    messaging.getToken({ vapidKey: 'YOUR_VAPID_KEY' }).then((currentToken) => {
      if (currentToken) {
        console.log('Token de notificação:', currentToken);
        // Salvar token no Firestore
        if (auth.currentUser) {
          db.collection('users').doc(auth.currentUser.uid).update({
            notificationToken: currentToken,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
      }
    }).catch((err) => {
      console.log('Erro ao obter token:', err);
    });
  }
}

// Solicitar permissão para notificações
function requestNotificationPermission() {
  if ('Notification' in window) {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Permissão para notificações concedida');
        initFirebaseMessaging();
      }
    });
  }
}

// Função para enviar notificação
function sendNotification(title, body, userId) {
  db.collection('notifications').add({
    title: title,
    body: body,
    userId: userId,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    read: false
  });
}

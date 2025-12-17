// firebase.js - Configuração completa do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Configuração do Firebase (SUA CONFIGURAÇÃO AQUI)
const firebaseConfig = {
  apiKey: "AIzaSyA5KEaKntt9wPYcy60DutrqvIH34piXsXk",
  authDomain: "ac-parceria.firebaseapp.com",
  projectId: "ac-parceria",
  storageBucket: "ac-parceria.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ========== FUNÇÕES DE AUTENTICAÇÃO ==========
async function loginEmailSenha(email, senha) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);
    return userCredential.user;
  } catch (error) {
    throw new Error(getErrorMessage(error.code));
  }
}

function getErrorMessage(errorCode) {
  const messages = {
    'auth/invalid-email': 'E-mail inválido',
    'auth/user-disabled': 'Usuário desativado',
    'auth/user-not-found': 'Usuário não encontrado',
    'auth/wrong-password': 'Senha incorreta',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde'
  };
  return messages[errorCode] || 'Erro ao fazer login';
}

// ========== FUNÇÕES DE COLABORADORES ==========
async function getColaborador(matricula) {
  const docRef = doc(db, 'colaboradores', matricula);
  return await getDoc(docRef);
}

async function getColaboradorByEmail(email) {
  const q = query(collection(db, 'colaboradores'), where("email", "==", email));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0];
  }
  return null;
}

// ========== FUNÇÕES DE ROTAS ==========
async function updateLocalizacao(matricula, dados) {
  const docRef = doc(db, 'rotas_em_andamento', matricula);
  return await setDoc(docRef, { ...dados, ultimaAtualizacao: serverTimestamp() }, { merge: true });
}

async function registrarEmergencia(dados) {
  const docRef = collection(db, 'emergencias');
  return await addDoc(docRef, { ...dados, timestamp: serverTimestamp() });
}

async function registrarFeedback(dados) {
  const docRef = collection(db, 'feedbacks');
  return await addDoc(docRef, { ...dados, timestamp: serverTimestamp() });
}

async function registrarAviso(dados) {
  const docRef = collection(db, 'avisos');
  return await addDoc(docRef, { ...dados, timestamp: serverTimestamp() });
}

// ========== MONITORAMENTO ==========
function monitorarRotas(callback) {
  return onSnapshot(collection(db, 'rotas_em_andamento'), (snapshot) => {
    const rotas = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.ativo !== false && data.latitude && data.longitude) {
        rotas.push({ id: doc.id, ...data });
      }
    });
    callback(rotas);
  });
}

function monitorarEmergencias(callback) {
  return onSnapshot(collection(db, 'emergencias'), (snapshot) => {
    const emergencias = [];
    snapshot.forEach(doc => {
      emergencias.push({ id: doc.id, ...doc.data() });
    });
    callback(emergencias);
  });
}

function monitorarFeedbacks(callback) {
  return onSnapshot(collection(db, 'feedbacks'), (snapshot) => {
    const feedbacks = [];
    snapshot.forEach(doc => {
      feedbacks.push({ id: doc.id, ...doc.data() });
    });
    callback(feedbacks);
  });
}

function monitorarAvisos(callback) {
  const q = query(collection(db, 'avisos'), where("ativo", "==", true));
  return onSnapshot(q, (snapshot) => {
    const avisos = [];
    snapshot.forEach(doc => {
      avisos.push({ id: doc.id, ...doc.data() });
    });
    callback(avisos);
  });
}

// ========== FUNÇÕES ADMIN ==========
async function getFormsControleVeiculos() {
  const q = query(collection(db, 'controle_veiculos'), where("data", ">=", new Date(new Date().setDate(new Date().getDate() - 7))));
  const querySnapshot = await getDocs(q);
  const forms = [];
  querySnapshot.forEach(doc => {
    forms.push({ id: doc.id, ...doc.data() });
  });
  return forms;
}

// Exportar tudo
export { 
  db, 
  auth, 
  doc, 
  getDoc, 
  setDoc,
  updateDoc,
  collection,
  getColaborador,
  getColaboradorByEmail,
  updateLocalizacao,
  registrarEmergencia,
  registrarFeedback,
  registrarAviso,
  monitorarRotas,
  monitorarEmergencias,
  monitorarFeedbacks,
  monitorarAvisos,
  getFormsControleVeiculos,
  loginEmailSenha,
  signOut,
  serverTimestamp
};

/**
 * LinguaStart - Application d'apprentissage des langues russe et arménienne
 * Configuration et fonctionnalités Firebase
 */

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyADzurIZaDjCcz3nCpXzU1alEj1seCI-8M",
  authDomain: "al-langues.firebaseapp.com",
  projectId: "al-langues",
  storageBucket: "al-langues.firebasestorage.app",
  messagingSenderId: "204283067681",
  appId: "1:204283067681:web:d0fbbcf392edd8824e5260",
  measurementId: "G-P70NBJF8BC"
};

// Variables globales pour Firebase
let auth;
let db;
let storage;
let analytics;
let currentUser = null;

/**
 * Initialise Firebase et ses services
 */
function initFirebase() {
  // Vérifier si Firebase est déjà initialisé
  if (firebase.apps.length === 0) {
    // Initialiser Firebase
    firebase.initializeApp(firebaseConfig);
    
    // Initialiser les services
    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();
    analytics = firebase.analytics();
    
    // Configurer la persistance Firestore pour le mode hors ligne
    db.enablePersistence({ synchronizeTabs: true })
      .catch(err => {
        if (err.code === 'failed-precondition') {
          console.warn('La persistance des données ne peut pas être activée car plusieurs onglets sont ouverts');
        } else if (err.code === 'unimplemented') {
          console.warn('Le navigateur ne prend pas en charge la persistance des données');
        }
      });
    
    // Observer l'état d'authentification
    auth.onAuthStateChanged(user => {
      currentUser = user;
      updateUIForAuthState(user);
      if (user) {
        // Charger les données de l'utilisateur
        loadUserData();
      }
    });
    
    console.log('Firebase initialisé avec succès');
  }
}

/**
 * Met à jour l'interface utilisateur en fonction de l'état d'authentification
 * @param {Object} user - L'utilisateur actuellement connecté ou null
 */
function updateUIForAuthState(user) {
  const authButtons = document.querySelectorAll('.auth-buttons');
  const userProfileElements = document.querySelectorAll('.user-profile');
  
  if (user) {
    // Utilisateur connecté
    authButtons.forEach(el => el.style.display = 'none');
    userProfileElements.forEach(el => {
      el.style.display = 'block';
      const userNameElement = el.querySelector('.user-name');
      if (userNameElement) {
        userNameElement.textContent = user.displayName || user.email;
      }
    });
  } else {
    // Utilisateur déconnecté
    authButtons.forEach(el => el.style.display = 'block');
    userProfileElements.forEach(el => el.style.display = 'none');
  }
}

/**
 * Inscrit un nouvel utilisateur avec email et mot de passe
 * @param {string} email - L'email de l'utilisateur
 * @param {string} password - Le mot de passe de l'utilisateur
 * @param {string} displayName - Le nom d'affichage de l'utilisateur
 * @returns {Promise} - Une promesse résolue avec l'utilisateur ou rejetée avec une erreur
 */
async function signUpWithEmailPassword(email, password, displayName) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    // Mettre à jour le profil utilisateur
    await userCredential.user.updateProfile({
      displayName: displayName
    });
    
    // Créer un document utilisateur dans Firestore
    await db.collection('users').doc(userCredential.user.uid).set({
      displayName: displayName,
      email: email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      preferences: {
        language: 'fr',
        learningLanguages: []
      }
    });
    
    return userCredential.user;
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    throw error;
  }
}

/**
 * Connecte un utilisateur avec email et mot de passe
 * @param {string} email - L'email de l'utilisateur
 * @param {string} password - Le mot de passe de l'utilisateur
 * @returns {Promise} - Une promesse résolue avec l'utilisateur ou rejetée avec une erreur
 */
async function signInWithEmailPassword(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    throw error;
  }
}

/**
 * Déconnecte l'utilisateur actuellement connecté
 * @returns {Promise} - Une promesse résolue lorsque l'utilisateur est déconnecté
 */
async function signOut() {
  try {
    await auth.signOut();
    console.log('Utilisateur déconnecté');
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    throw error;
  }
}

/**
 * Charge les données de progression de l'utilisateur depuis Firestore
 */
async function loadUserData() {
  if (!currentUser) return;
  
  try {
    // Charger les données de révision espacée
    const spacedRepetitionDoc = await db.collection('users').doc(currentUser.uid)
      .collection('spacedRepetition').doc('data').get();
    
    if (spacedRepetitionDoc.exists) {
      const data = spacedRepetitionDoc.data();
      // Mettre à jour les données locales
      spacedRepetitionData = data;
      // Déclencher une mise à jour de l'interface
      updateRevisionCards();
    } else {
      // Si le document n'existe pas, utiliser les données locales
      saveUserData();
    }
    
    // Charger les statistiques d'apprentissage
    const statsDoc = await db.collection('users').doc(currentUser.uid)
      .collection('statistics').doc('learning').get();
    
    if (statsDoc.exists) {
      const stats = statsDoc.data();
      // Mettre à jour les statistiques locales
      updateLearningStatistics(stats);
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données utilisateur:', error);
  }
}

/**
 * Sauvegarde les données de progression de l'utilisateur dans Firestore
 */
async function saveUserData() {
  if (!currentUser) return;
  
  try {
    // Sauvegarder les données de révision espacée
    await db.collection('users').doc(currentUser.uid)
      .collection('spacedRepetition').doc('data').set(spacedRepetitionData);
    
    // Sauvegarder les statistiques d'apprentissage
    const stats = getLearningStatistics();
    await db.collection('users').doc(currentUser.uid)
      .collection('statistics').doc('learning').set(stats);
    
    console.log('Données utilisateur sauvegardées avec succès');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des données utilisateur:', error);
  }
}

/**
 * Récupère les statistiques d'apprentissage actuelles
 * @returns {Object} - Les statistiques d'apprentissage
 */
function getLearningStatistics() {
  // Cette fonction doit être implémentée en fonction de la structure de données de l'application
  // Exemple simple:
  return {
    totalCards: spacedRepetitionData.cards.length,
    masteredCards: spacedRepetitionData.cards.filter(card => card.level >= 5).length,
    lastSession: new Date().toISOString(),
    streak: calculateStreak()
  };
}

/**
 * Met à jour les statistiques d'apprentissage dans l'interface
 * @param {Object} stats - Les statistiques d'apprentissage
 */
function updateLearningStatistics(stats) {
  // Cette fonction doit être implémentée en fonction de la structure de l'interface
  const statsContainer = document.querySelector('.learning-statistics');
  if (!statsContainer) return;
  
  statsContainer.innerHTML = `
    <div class="stat-item">
      <span class="stat-value">${stats.totalCards}</span>
      <span class="stat-label">Cartes totales</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">${stats.masteredCards}</span>
      <span class="stat-label">Cartes maîtrisées</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">${stats.streak}</span>
      <span class="stat-label">Jours consécutifs</span>
    </div>
  `;
}

/**
 * Calcule le nombre de jours consécutifs d'apprentissage
 * @returns {number} - Le nombre de jours consécutifs
 */
function calculateStreak() {
  // Implémentation simple du calcul de streak
  // Cette fonction devrait être adaptée en fonction des données disponibles
  return 1; // Placeholder
}

/**
 * Télécharge un fichier audio depuis Firebase Storage
 * @param {string} path - Le chemin du fichier dans Storage
 * @returns {Promise<string>} - Une promesse résolue avec l'URL du fichier
 */
async function getAudioFileUrl(path) {
  try {
    const url = await storage.ref(path).getDownloadURL();
    return url;
  } catch (error) {
    console.error('Erreur lors du téléchargement du fichier audio:', error);
    throw error;
  }
}

// Initialiser Firebase lorsque le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
  // Vérifier si le script Firebase est chargé
  if (typeof firebase !== 'undefined') {
    initFirebase();
  } else {
    console.error('Firebase SDK n\'est pas chargé. Vérifiez les balises script.');
  }
});

// Remplacer les fonctions de stockage local par des fonctions Firebase
// Ces fonctions seront appelées par le code existant

/**
 * Remplace la fonction de chargement des données de révision espacée
 * pour utiliser Firebase au lieu du stockage local
 */
function loadSpacedRepetitionData() {
  // Si l'utilisateur est connecté, les données sont déjà chargées par loadUserData()
  // Sinon, utiliser le stockage local comme avant
  if (!currentUser) {
    const savedData = localStorage.getItem('linguaStartSpacedRepetition');
    if (savedData) {
      spacedRepetitionData = JSON.parse(savedData);
    }
  }
}

/**
 * Remplace la fonction de sauvegarde des données de révision espacée
 * pour utiliser Firebase au lieu du stockage local
 */
function saveSpacedRepetitionData() {
  // Sauvegarder dans le stockage local pour les utilisateurs non connectés
  localStorage.setItem('linguaStartSpacedRepetition', JSON.stringify(spacedRepetitionData));
  
  // Si l'utilisateur est connecté, sauvegarder également dans Firebase
  if (currentUser) {
    saveUserData();
  }
}
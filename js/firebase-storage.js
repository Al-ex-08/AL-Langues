/**
 * LinguaStart - Application d'apprentissage des langues russe et arménienne
 * Gestion des ressources audio et fichiers avec Firebase Storage
 */

/**
 * Initialise les fonctionnalités de stockage Firebase
 */
document.addEventListener('DOMContentLoaded', function() {
    initStorageFeatures();
});

/**
 * Initialise les fonctionnalités liées au stockage Firebase
 */
function initStorageFeatures() {
    // Remplacer les chemins audio par des URL Firebase Storage
    replaceAudioSources();
}

/**
 * Remplace les sources audio locales par des URL Firebase Storage
 */
async function replaceAudioSources() {
    // Vérifier que Firebase est initialisé
    if (typeof storage === 'undefined') return;
    
    const audioElements = document.querySelectorAll('audio');
    if (audioElements.length === 0) return;
    
    const language = document.body.classList.contains('russian-theme') ? 'russian' : 'armenian';
    
    for (const audio of audioElements) {
        try {
            // Obtenir le chemin relatif actuel
            const currentSrc = audio.getAttribute('src');
            if (!currentSrc || currentSrc.startsWith('http')) continue; // Ignorer les URL déjà chargées
            
            // Construire le chemin Firebase Storage
            const storagePath = `audio/${language}/${currentSrc.split('/').pop()}`;
            
            // Récupérer l'URL depuis Firebase Storage
            const url = await getAudioFileUrl(storagePath);
            
            // Mettre à jour la source audio
            audio.src = url;
        } catch (error) {
            console.warn(`Impossible de charger l'audio depuis Firebase: ${error.message}`);
            // Conserver la source locale en cas d'erreur
        }
    }
}

/**
 * Précharge les fichiers audio pour une catégorie spécifique
 * @param {string} category - La catégorie d'audio (alphabet, vocabulary, phrases, etc.)
 */
async function preloadAudioCategory(category) {
    if (typeof storage === 'undefined') return;
    
    const language = document.body.classList.contains('russian-theme') ? 'russian' : 'armenian';
    const cacheName = `linguastart-audio-${language}-${category}`;
    
    try {
        // Lister tous les fichiers audio dans cette catégorie
        const audioFiles = await storage.ref(`audio/${language}/${category}`).listAll();
        
        // Créer un cache pour ces fichiers
        const audioCache = {};
        
        // Télécharger les URL pour chaque fichier
        for (const item of audioFiles.items) {
            const url = await item.getDownloadURL();
            const fileName = item.name;
            audioCache[fileName] = url;
        }
        
        // Stocker le cache dans le stockage local
        localStorage.setItem(cacheName, JSON.stringify(audioCache));
        
        console.log(`Préchargement des fichiers audio ${category} terminé`);
    } catch (error) {
        console.error(`Erreur lors du préchargement des fichiers audio ${category}:`, error);
    }
}

/**
 * Obtient l'URL d'un fichier audio, d'abord depuis le cache puis depuis Firebase
 * @param {string} fileName - Le nom du fichier audio
 * @param {string} category - La catégorie d'audio
 * @returns {Promise<string>} - L'URL du fichier audio
 */
async function getAudioUrl(fileName, category) {
    if (typeof storage === 'undefined') {
        // Retourner le chemin local si Firebase n'est pas disponible
        return `../audio/${language}/${category}/${fileName}`;
    }
    
    const language = document.body.classList.contains('russian-theme') ? 'russian' : 'armenian';
    const cacheName = `linguastart-audio-${language}-${category}`;
    
    // Vérifier si l'URL est dans le cache
    const cachedData = localStorage.getItem(cacheName);
    if (cachedData) {
        const audioCache = JSON.parse(cachedData);
        if (audioCache[fileName]) {
            return audioCache[fileName];
        }
    }
    
    // Si pas dans le cache, récupérer depuis Firebase
    try {
        const storagePath = `audio/${language}/${category}/${fileName}`;
        const url = await getAudioFileUrl(storagePath);
        return url;
    } catch (error) {
        console.error(`Erreur lors du chargement de l'audio ${fileName}:`, error);
        // Retourner le chemin local en cas d'erreur
        return `../audio/${language}/${category}/${fileName}`;
    }
}

/**
 * Télécharge un fichier audio vers Firebase Storage
 * @param {File} file - Le fichier audio à télécharger
 * @param {string} category - La catégorie d'audio (alphabet, vocabulary, etc.)
 * @param {string} fileName - Le nom du fichier (optionnel, utilise le nom du fichier par défaut)
 * @returns {Promise<string>} - L'URL du fichier téléchargé
 */
async function uploadAudioFile(file, category, fileName = null) {
    if (typeof storage === 'undefined') {
        throw new Error('Firebase Storage n\'est pas initialisé');
    }
    
    if (!currentUser) {
        throw new Error('Vous devez être connecté pour télécharger des fichiers');
    }
    
    const language = document.body.classList.contains('russian-theme') ? 'russian' : 'armenian';
    const name = fileName || file.name;
    
    try {
        // Référence au stockage Firebase
        const storageRef = storage.ref(`audio/${language}/${category}/${name}`);
        
        // Télécharger le fichier
        const uploadTask = storageRef.put(file);
        
        // Attendre la fin du téléchargement
        await uploadTask;
        
        // Obtenir l'URL de téléchargement
        const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
        
        // Mettre à jour le cache local
        const cacheName = `linguastart-audio-${language}-${category}`;
        const cachedData = localStorage.getItem(cacheName);
        if (cachedData) {
            const audioCache = JSON.parse(cachedData);
            audioCache[name] = downloadURL;
            localStorage.setItem(cacheName, JSON.stringify(audioCache));
        }
        
        return downloadURL;
    } catch (error) {
        console.error('Erreur lors du téléchargement du fichier audio:', error);
        throw error;
    }
}

/**
 * Télécharge un fichier de ressources d'apprentissage (JSON) vers Firebase Storage
 * @param {File} file - Le fichier JSON à télécharger
 * @param {string} type - Le type de ressource (vocabulary, phrases, etc.)
 * @returns {Promise<string>} - L'URL du fichier téléchargé
 */
async function uploadResourceFile(file, type) {
    if (typeof storage === 'undefined') {
        throw new Error('Firebase Storage n\'est pas initialisé');
    }
    
    if (!currentUser) {
        throw new Error('Vous devez être connecté pour télécharger des fichiers');
    }
    
    const language = document.body.classList.contains('russian-theme') ? 'russian' : 'armenian';
    
    try {
        // Référence au stockage Firebase
        const storageRef = storage.ref(`data/${language}/${type}.json`);
        
        // Télécharger le fichier
        const uploadTask = storageRef.put(file);
        
        // Attendre la fin du téléchargement
        await uploadTask;
        
        // Obtenir l'URL de téléchargement
        const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
        
        return downloadURL;
    } catch (error) {
        console.error('Erreur lors du téléchargement du fichier de ressources:', error);
        throw error;
    }
}

/**
 * Synchronise les fichiers audio locaux avec Firebase Storage
 * Cette fonction est utilisée par les administrateurs pour télécharger les fichiers audio
 */
async function syncAudioFiles() {
    if (typeof storage === 'undefined') {
        throw new Error('Firebase Storage n\'est pas initialisé');
    }
    
    if (!currentUser || !(await isUserAdmin(currentUser.uid))) {
        throw new Error('Vous devez être administrateur pour synchroniser les fichiers');
    }
    
    const language = document.body.classList.contains('russian-theme') ? 'russian' : 'armenian';
    const categories = ['alphabet', 'vocabulary', 'phrases', 'dialogues', 'situations'];
    
    for (const category of categories) {
        try {
            // Cette fonction nécessiterait un accès au système de fichiers local
            // qui n'est pas disponible dans le navigateur pour des raisons de sécurité
            // Elle devrait être implémentée côté serveur ou via une extension de navigateur
            console.log(`Synchronisation des fichiers audio ${category} pour ${language}`);
        } catch (error) {
            console.error(`Erreur lors de la synchronisation des fichiers audio ${category}:`, error);
        }
    }
}

/**
 * Vérifie si un utilisateur est administrateur
 * @param {string} uid - L'ID de l'utilisateur
 * @returns {Promise<boolean>} - True si l'utilisateur est administrateur
 */
async function isUserAdmin(uid) {
    try {
        const userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            return userData.role === 'admin';
        }
        return false;
    } catch (error) {
        console.error('Erreur lors de la vérification des droits d\'administrateur:', error);
        return false;
    }
}
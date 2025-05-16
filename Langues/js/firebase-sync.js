/**
 * LinguaStart - Application d'apprentissage des langues russe et arménienne
 * Synchronisation des données de progression avec Firebase
 */

/**
 * Initialise les fonctionnalités de synchronisation Firebase
 */
document.addEventListener('DOMContentLoaded', function() {
    initSyncFeatures();
});

/**
 * Initialise les fonctionnalités de synchronisation
 */
function initSyncFeatures() {
    // Remplacer les fonctions de stockage local par des fonctions Firebase
    overrideStorageFunctions();
    
    // Configurer la synchronisation automatique
    setupAutoSync();
}

/**
 * Remplace les fonctions de stockage local par des fonctions Firebase
 */
function overrideStorageFunctions() {
    // Sauvegarder les fonctions originales
    const originalSaveSpacedRepetition = window.saveSpacedRepetitionData;
    const originalLoadSpacedRepetition = window.loadSpacedRepetitionData;
    
    // Remplacer la fonction de sauvegarde
    window.saveSpacedRepetitionData = function() {
        // Appeler la fonction originale pour maintenir la compatibilité
        if (originalSaveSpacedRepetition) {
            originalSaveSpacedRepetition();
        }
        
        // Sauvegarder dans Firebase si l'utilisateur est connecté
        if (currentUser) {
            saveUserData();
        }
    };
    
    // Remplacer la fonction de chargement
    window.loadSpacedRepetitionData = function() {
        // Si l'utilisateur est connecté, charger depuis Firebase
        if (currentUser) {
            loadUserData();
        } 
        // Sinon, utiliser la fonction originale
        else if (originalLoadSpacedRepetition) {
            originalLoadSpacedRepetition();
        }
    };
    
    // Remplacer d'autres fonctions de stockage si nécessaire
    overrideQuizStorage();
    overrideProgressStorage();
}

/**
 * Remplace les fonctions de stockage des quiz
 */
function overrideQuizStorage() {
    // Fonction pour sauvegarder les résultats de quiz
    window.saveQuizResults = function(quizType, results) {
        // Sauvegarder localement
        localStorage.setItem(`linguaStart_quiz_${quizType}`, JSON.stringify(results));
        
        // Sauvegarder dans Firebase si l'utilisateur est connecté
        if (currentUser) {
            saveQuizResultsToFirebase(quizType, results);
        }
    };
    
    // Fonction pour charger les résultats de quiz
    window.loadQuizResults = async function(quizType) {
        // Si l'utilisateur est connecté, essayer de charger depuis Firebase
        if (currentUser) {
            try {
                const results = await loadQuizResultsFromFirebase(quizType);
                if (results) return results;
            } catch (error) {
                console.error('Erreur lors du chargement des résultats de quiz:', error);
            }
        }
        
        // Charger depuis le stockage local si pas de données Firebase
        const savedResults = localStorage.getItem(`linguaStart_quiz_${quizType}`);
        return savedResults ? JSON.parse(savedResults) : null;
    };
}

/**
 * Sauvegarde les résultats de quiz dans Firebase
 * @param {string} quizType - Le type de quiz
 * @param {Object} results - Les résultats du quiz
 */
async function saveQuizResultsToFirebase(quizType, results) {
    if (!currentUser) return;
    
    try {
        const language = document.body.classList.contains('russian-theme') ? 'russian' : 'armenian';
        
        await db.collection('users').doc(currentUser.uid)
            .collection('quizResults').doc(`${language}_${quizType}`)
            .set({
                results: results,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des résultats de quiz:', error);
    }
}

/**
 * Charge les résultats de quiz depuis Firebase
 * @param {string} quizType - Le type de quiz
 * @returns {Promise<Object>} - Les résultats du quiz
 */
async function loadQuizResultsFromFirebase(quizType) {
    if (!currentUser) return null;
    
    try {
        const language = document.body.classList.contains('russian-theme') ? 'russian' : 'armenian';
        
        const doc = await db.collection('users').doc(currentUser.uid)
            .collection('quizResults').doc(`${language}_${quizType}`).get();
        
        if (doc.exists) {
            return doc.data().results;
        }
        return null;
    } catch (error) {
        console.error('Erreur lors du chargement des résultats de quiz:', error);
        return null;
    }
}

/**
 * Remplace les fonctions de stockage de la progression
 */
function overrideProgressStorage() {
    // Fonction pour sauvegarder la progression
    window.saveProgress = function(lessonType, lessonId, progress) {
        // Sauvegarder localement
        const key = `linguaStart_progress_${lessonType}_${lessonId}`;
        localStorage.setItem(key, JSON.stringify(progress));
        
        // Sauvegarder dans Firebase si l'utilisateur est connecté
        if (currentUser) {
            saveProgressToFirebase(lessonType, lessonId, progress);
        }
    };
    
    // Fonction pour charger la progression
    window.loadProgress = async function(lessonType, lessonId) {
        // Si l'utilisateur est connecté, essayer de charger depuis Firebase
        if (currentUser) {
            try {
                const progress = await loadProgressFromFirebase(lessonType, lessonId);
                if (progress) return progress;
            } catch (error) {
                console.error('Erreur lors du chargement de la progression:', error);
            }
        }
        
        // Charger depuis le stockage local si pas de données Firebase
        const key = `linguaStart_progress_${lessonType}_${lessonId}`;
        const savedProgress = localStorage.getItem(key);
        return savedProgress ? JSON.parse(savedProgress) : null;
    };
}

/**
 * Sauvegarde la progression dans Firebase
 * @param {string} lessonType - Le type de leçon
 * @param {string} lessonId - L'identifiant de la leçon
 * @param {Object} progress - Les données de progression
 */
async function saveProgressToFirebase(lessonType, lessonId, progress) {
    if (!currentUser) return;
    
    try {
        const language = document.body.classList.contains('russian-theme') ? 'russian' : 'armenian';
        
        await db.collection('users').doc(currentUser.uid)
            .collection('progress').doc(`${language}_${lessonType}_${lessonId}`)
            .set({
                progress: progress,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
    } catch (error) {
        console.error('Erreur lors de la sauvegarde de la progression:', error);
    }
}

/**
 * Charge la progression depuis Firebase
 * @param {string} lessonType - Le type de leçon
 * @param {string} lessonId - L'identifiant de la leçon
 * @returns {Promise<Object>} - Les données de progression
 */
async function loadProgressFromFirebase(lessonType, lessonId) {
    if (!currentUser) return null;
    
    try {
        const language = document.body.classList.contains('russian-theme') ? 'russian' : 'armenian';
        
        const doc = await db.collection('users').doc(currentUser.uid)
            .collection('progress').doc(`${language}_${lessonType}_${lessonId}`).get();
        
        if (doc.exists) {
            return doc.data().progress;
        }
        return null;
    } catch (error) {
        console.error('Erreur lors du chargement de la progression:', error);
        return null;
    }
}

/**
 * Configure la synchronisation automatique des données
 */
function setupAutoSync() {
    // Synchroniser les données toutes les 5 minutes si l'utilisateur est connecté
    setInterval(() => {
        if (currentUser) {
            saveUserData();
        }
    }, 5 * 60 * 1000);
    
    // Synchroniser avant que l'utilisateur ne quitte la page
    window.addEventListener('beforeunload', () => {
        if (currentUser) {
            saveUserData();
        }
    });
}

/**
 * Synchronise manuellement toutes les données avec Firebase
 * @returns {Promise<boolean>} - True si la synchronisation a réussi
 */
async function syncAllData() {
    if (!currentUser) {
        alert('Vous devez être connecté pour synchroniser vos données.');
        return false;
    }
    
    try {
        // Sauvegarder les données de révision espacée
        await saveUserData();
        
        // Synchroniser les résultats de quiz
        await syncQuizResults();
        
        // Synchroniser la progression des leçons
        await syncLessonProgress();
        
        alert('Vos données ont été synchronisées avec succès.');
        return true;
    } catch (error) {
        console.error('Erreur lors de la synchronisation des données:', error);
        alert('Une erreur est survenue lors de la synchronisation de vos données.');
        return false;
    }
}

/**
 * Synchronise les résultats de quiz
 */
async function syncQuizResults() {
    if (!currentUser) return;
    
    const language = document.body.classList.contains('russian-theme') ? 'russian' : 'armenian';
    const quizTypes = ['alphabet', 'vocabulary', 'phrases', 'grammar', 'dialogues'];
    
    for (const quizType of quizTypes) {
        const key = `linguaStart_quiz_${quizType}`;
        const savedResults = localStorage.getItem(key);
        
        if (savedResults) {
            try {
                await saveQuizResultsToFirebase(quizType, JSON.parse(savedResults));
                console.log(`Quiz ${quizType} synchronisé avec succès`);
            } catch (error) {
                console.error(`Erreur lors de la synchronisation du quiz ${quizType}:`, error);
            }
        }
    }
    
    // Synchroniser également les données de révision des quiz
    await syncQuizReviewData();
}

/**
 * Synchronise la progression des leçons
 */
async function syncLessonProgress() {
    if (!currentUser) return;
    
    // Trouver toutes les clés de progression dans le stockage local
    const progressKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('linguaStart_progress_')) {
            progressKeys.push(key);
        }
    }
    
    // Synchroniser chaque élément de progression
    for (const key of progressKeys) {
        try {
            const savedProgress = localStorage.getItem(key);
            if (savedProgress) {
                // Extraire le type de leçon et l'ID de la clé
                const parts = key.replace('linguaStart_progress_', '').split('_');
                const lessonType = parts[0];
                const lessonId = parts.slice(1).join('_');
                
                await saveProgressToFirebase(lessonType, lessonId, JSON.parse(savedProgress));
            }
        } catch (error) {
            console.error(`Erreur lors de la synchronisation de la progression ${key}:`, error);
        }
    }
}

/**
 * Synchronise les données de révision des quiz
 */
async function syncQuizReviewData() {
    if (!currentUser) return;
    
    try {
        // Vérifier s'il y a des données de révision en attente de synchronisation
        const pendingReviews = localStorage.getItem('linguaStart_pendingQuizReviews');
        
        if (pendingReviews) {
            const reviews = JSON.parse(pendingReviews);
            
            for (const review of reviews) {
                try {
                    const language = review.language || document.body.classList.contains('russian-theme') ? 'russian' : 'armenian';
                    
                    await db.collection('users').doc(currentUser.uid)
                        .collection('quizReviews').doc(`${language}_${review.quizType}_${review.timestamp}`)
                        .set({
                            quizType: review.quizType,
                            language: language,
                            userAnswers: review.userAnswers,
                            score: review.score,
                            timestamp: firebase.firestore.Timestamp.fromMillis(review.timestamp)
                        });
                } catch (error) {
                    console.error('Erreur lors de la synchronisation d\'une révision de quiz:', error);
                }
            }
            
            // Effacer les révisions en attente après synchronisation
            localStorage.removeItem('linguaStart_pendingQuizReviews');
            console.log('Données de révision des quiz synchronisées avec succès');
        }
    } catch (error) {
        console.error('Erreur lors de la synchronisation des données de révision des quiz:', error);
    }
}

/**
 * Fusionne les données locales et distantes
 * @param {Object} localData - Les données stockées localement
 * @param {Object} remoteData - Les données stockées dans Firebase
 * @returns {Object} - Les données fusionnées
 */
function mergeData(localData, remoteData) {
    // Si l'une des sources est vide, utiliser l'autre
    if (!localData) return remoteData;
    if (!remoteData) return localData;
    
    // Pour les données de révision espacée, fusionner les cartes
    if (localData.cards && remoteData.cards) {
        const mergedCards = [];
        const cardMap = new Map();
        
        // Ajouter toutes les cartes distantes
        remoteData.cards.forEach(card => {
            cardMap.set(card.id, card);
        });
        
        // Ajouter ou mettre à jour avec les cartes locales
        localData.cards.forEach(card => {
            const existingCard = cardMap.get(card.id);
            
            if (existingCard) {
                // Utiliser la carte la plus récemment mise à jour
                const localDate = new Date(card.lastReviewed);
                const remoteDate = new Date(existingCard.lastReviewed);
                
                if (localDate > remoteDate) {
                    cardMap.set(card.id, card);
                }
            } else {
                cardMap.set(card.id, card);
            }
        });
        
        // Convertir la Map en tableau
        cardMap.forEach(card => {
            mergedCards.push(card);
        });
        
        // Créer l'objet fusionné
        const mergedData = {
            ...remoteData,
            cards: mergedCards
        };
        
        return mergedData;
    }
    
    // Pour les autres types de données, utiliser les données les plus récentes
    return remoteData;
}
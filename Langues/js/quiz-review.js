/**
 * LinguaStart - Application d'apprentissage des langues russe et arménienne
 * Fonctionnalités de révision des quiz
 */

/**
 * Initialise les fonctionnalités de révision des quiz
 */
document.addEventListener('DOMContentLoaded', function() {
    // Cette fonction sera appelée automatiquement lorsque le DOM est chargé
});

/**
 * Affiche l'interface de révision des réponses pour un quiz terminé
 * @param {Object} quizData - Les données du quiz
 * @param {Array} userAnswers - Les réponses de l'utilisateur
 * @param {HTMLElement} container - Le conteneur où afficher la révision
 */
function showQuizReview(quizData, userAnswers, container) {
    // Vider le conteneur
    container.innerHTML = '';
    
    // Créer l'en-tête de la révision
    const header = document.createElement('div');
    header.className = 'review-header';
    header.innerHTML = `
        <h2>Révision des réponses</h2>
        <p>Revoyez vos réponses pour améliorer votre apprentissage</p>
    `;
    container.appendChild(header);
    
    // Créer la liste des questions avec les réponses
    const reviewList = document.createElement('div');
    reviewList.className = 'review-list';
    container.appendChild(reviewList);
    
    // Ajouter chaque question avec la réponse de l'utilisateur
    quizData.questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.correctAnswer;
        
        const questionItem = document.createElement('div');
        questionItem.className = `review-item ${isCorrect ? 'correct' : 'incorrect'}`;
        
        // Construire le contenu de l'élément de révision
        questionItem.innerHTML = `
            <div class="review-question">
                <span class="question-number">${index + 1}</span>
                <p>${question.question}</p>
            </div>
            <div class="review-answers">
                <div class="user-answer">
                    <strong>Votre réponse:</strong>
                    <p class="${isCorrect ? 'correct-answer' : 'wrong-answer'}">
                        ${question.options[userAnswer]}
                    </p>
                </div>
                ${!isCorrect ? `
                <div class="correct-answer">
                    <strong>Réponse correcte:</strong>
                    <p>${question.options[question.correctAnswer]}</p>
                </div>
                ` : ''}
            </div>
            ${question.explanation ? `
            <div class="answer-explanation">
                <p><i class="fas fa-info-circle"></i> ${question.explanation}</p>
            </div>
            ` : ''}
        `;
        
        reviewList.appendChild(questionItem);
    });
    
    // Ajouter les boutons d'action
    const actions = document.createElement('div');
    actions.className = 'review-actions';
    actions.innerHTML = `
        <button class="btn primary" id="restart-quiz">Recommencer le quiz</button>
        <button class="btn secondary" id="back-to-results">Retour aux résultats</button>
    `;
    container.appendChild(actions);
    
    // Gérer les événements des boutons
    document.getElementById('restart-quiz').addEventListener('click', function() {
        // Déclencher l'événement de redémarrage du quiz
        const restartEvent = new CustomEvent('quiz:restart');
        container.dispatchEvent(restartEvent);
    });
    
    document.getElementById('back-to-results').addEventListener('click', function() {
        // Déclencher l'événement de retour aux résultats
        const backEvent = new CustomEvent('quiz:back-to-results');
        container.dispatchEvent(backEvent);
    });
    
    // Ajouter des styles spécifiques pour la révision
    addReviewStyles();
}

/**
 * Ajoute les styles CSS nécessaires pour l'interface de révision
 */
function addReviewStyles() {
    // Vérifier si les styles sont déjà ajoutés
    if (document.getElementById('quiz-review-styles')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'quiz-review-styles';
    styleElement.textContent = `
        .review-header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .review-list {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .review-item {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 1.5rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .review-item.correct {
            border-left: 4px solid #28a745;
        }
        
        .review-item.incorrect {
            border-left: 4px solid #dc3545;
        }
        
        .review-question {
            display: flex;
            align-items: flex-start;
            margin-bottom: 1rem;
        }
        
        .question-number {
            background-color: #6c757d;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 1rem;
            flex-shrink: 0;
        }
        
        .review-answers {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }
        
        .correct-answer p {
            color: #28a745;
            font-weight: 500;
        }
        
        .wrong-answer {
            color: #dc3545;
            text-decoration: line-through;
        }
        
        .answer-explanation {
            background-color: #e9ecef;
            padding: 1rem;
            border-radius: 4px;
            font-style: italic;
        }
        
        .review-actions {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-top: 2rem;
        }
    `;
    
    document.head.appendChild(styleElement);
}

/**
 * Sauvegarde les résultats de révision dans Firebase
 * @param {string} quizType - Le type de quiz
 * @param {Array} userAnswers - Les réponses de l'utilisateur
 * @param {number} score - Le score obtenu
 */
async function saveQuizReviewData(quizType, userAnswers, score) {
    const language = document.body.classList.contains('russian-theme') ? 'russian' : 'armenian';
    const timestamp = Date.now();
    
    // Créer l'objet de données de révision
    const reviewData = {
        quizType: quizType,
        language: language,
        userAnswers: userAnswers,
        score: score,
        timestamp: timestamp
    };
    
    // Sauvegarder localement d'abord
    saveQuizReviewLocally(reviewData);
    
    // Vérifier si l'utilisateur est connecté et si Firebase est disponible
    if (typeof currentUser === 'undefined' || !currentUser || typeof db === 'undefined') {
        return;
    }
    
    try {
        // Sauvegarder les données de révision dans Firebase
        await db.collection('users').doc(currentUser.uid)
            .collection('quizReviews').doc(`${language}_${quizType}_${timestamp}`)
            .set({
                ...reviewData,
                timestamp: firebase.firestore.Timestamp.fromMillis(timestamp)
            });
            
        console.log('Données de révision sauvegardées avec succès dans Firebase');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des données de révision:', error);
    }
}

/**
 * Charge l'historique des révisions de quiz depuis Firebase
 * @param {string} quizType - Le type de quiz (optionnel)
 * @returns {Promise<Array>} - L'historique des révisions
 */
async function loadQuizReviewHistory(quizType = null) {
    // Vérifier si l'utilisateur est connecté et si Firebase est disponible
    if (typeof currentUser === 'undefined' || !currentUser) return [];
    if (typeof db === 'undefined') return [];
    
    try {
        const language = document.body.classList.contains('russian-theme') ? 'russian' : 'armenian';
        let query = db.collection('users').doc(currentUser.uid).collection('quizReviews');
        
        // Filtrer par type de quiz si spécifié
        if (quizType) {
            query = query.where('quizType', '==', quizType)
                         .where('language', '==', language);
        } else {
            query = query.where('language', '==', language);
        }
        
        // Trier par date décroissante
        query = query.orderBy('timestamp', 'desc').limit(10);
        
        const snapshot = await query.get();
        const history = [];
        
        snapshot.forEach(doc => {
            history.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return history;
    } catch (error) {
        console.error('Erreur lors du chargement de l\'historique des révisions:', error);
        return [];
    }
}

/**
 * Sauvegarde les données de révision localement
 * @param {Object} reviewData - Les données de révision
 */
function saveQuizReviewLocally(reviewData) {
    try {
        // Récupérer les révisions en attente existantes
        let pendingReviews = localStorage.getItem('linguaStart_pendingQuizReviews');
        pendingReviews = pendingReviews ? JSON.parse(pendingReviews) : [];
        
        // Ajouter la nouvelle révision
        pendingReviews.push(reviewData);
        
        // Limiter le nombre de révisions en attente (garder les 20 plus récentes)
        if (pendingReviews.length > 20) {
            pendingReviews = pendingReviews.slice(-20);
        }
        
        // Sauvegarder dans le stockage local
        localStorage.setItem('linguaStart_pendingQuizReviews', JSON.stringify(pendingReviews));
        console.log('Données de révision sauvegardées localement');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde locale des données de révision:', error);
    }
}

/**
 * Charge les révisions de quiz sauvegardées localement
 * @returns {Array} - Les révisions sauvegardées localement
 */
function loadLocalQuizReviews() {
    try {
        const pendingReviews = localStorage.getItem('linguaStart_pendingQuizReviews');
        return pendingReviews ? JSON.parse(pendingReviews) : [];
    } catch (error) {
        console.error('Erreur lors du chargement des révisions locales:', error);
        return [];
    }
}

// Exporter les fonctions pour les rendre disponibles globalement
window.showQuizReview = showQuizReview;
window.saveQuizReviewData = saveQuizReviewData;
window.loadQuizReviewHistory = loadQuizReviewHistory;
window.loadLocalQuizReviews = loadLocalQuizReviews;
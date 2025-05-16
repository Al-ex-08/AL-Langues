/**
 * LinguaStart - Application d'apprentissage des langues russe et arménienne
 * Script pour les fonctionnalités de quiz interactifs
 */

document.addEventListener('DOMContentLoaded', function() {
    initQuizSystem();
});

/**
 * Initialise le système de quiz
 */
function initQuizSystem() {
    const quizContainer = document.querySelector('.quiz-container');
    if (!quizContainer) return;

    const language = document.body.classList.contains('russian-theme') ? 'russian' : 'armenian';
    const quizType = quizContainer.dataset.quizType || 'alphabet';
    
    // Charger les données du quiz
    fetch(`../data/${language}/quiz_${quizType}.json`)
        .then(response => response.json())
        .then(data => {
            createQuiz(data, quizContainer);
        })
        .catch(error => {
            console.error('Erreur lors du chargement du quiz:', error);
            quizContainer.innerHTML = '<p class="error">Impossible de charger le quiz. Veuillez réessayer plus tard.</p>';
        });
}

/**
 * Crée un quiz à partir des données
 * @param {Object} data - Les données du quiz
 * @param {HTMLElement} container - Le conteneur du quiz
 */
function createQuiz(data, container) {
    // Vider le conteneur
    container.innerHTML = '';
    
    // Créer le titre
    const title = document.createElement('h2');
    title.textContent = data.title;
    container.appendChild(title);
    
    // Créer le conteneur de questions
    const quizContent = document.createElement('div');
    quizContent.className = 'quiz-content';
    container.appendChild(quizContent);
    
    // Variables pour suivre l'état du quiz
    let currentQuestionIndex = 0;
    let score = 0;
    
    // Fonction pour afficher une question
    function showQuestion(index) {
        const question = data.questions[index];
        
        quizContent.innerHTML = `
            <div class="quiz-progress">
                <span>Question ${index + 1}/${data.questions.length}</span>
                <div class="progress-bar">
                    <div class="progress" style="width: ${((index + 1) / data.questions.length) * 100}%"></div>
                </div>
            </div>
            <div class="quiz-question">
                <h3>${question.question}</h3>
            </div>
            <div class="quiz-options"></div>
            <div class="quiz-feedback" style="display: none;"></div>
            <div class="quiz-navigation">
                <button class="btn secondary" id="next-question" disabled>Question suivante</button>
            </div>
        `;
        
        // Ajouter les options
        const optionsContainer = quizContent.querySelector('.quiz-options');
        question.options.forEach((option, optionIndex) => {
            const optionButton = document.createElement('button');
            optionButton.className = 'quiz-option';
            optionButton.textContent = option;
            optionButton.dataset.index = optionIndex;
            
            optionButton.addEventListener('click', function() {
                // Désactiver toutes les options
                document.querySelectorAll('.quiz-option').forEach(btn => {
                    btn.disabled = true;
                });
                
                // Vérifier la réponse
                const isCorrect = parseInt(this.dataset.index) === question.correctAnswer;
                
                // Mettre à jour le score
                if (isCorrect) score++;
                
                // Afficher le feedback
                const feedback = quizContent.querySelector('.quiz-feedback');
                feedback.style.display = 'block';
                feedback.innerHTML = isCorrect 
                    ? '<p class="correct"><i class="fas fa-check"></i> Correct !</p>'
                    : `<p class="incorrect"><i class="fas fa-times"></i> Incorrect. La bonne réponse est : ${question.options[question.correctAnswer]}</p>`;
                
                // Mettre en évidence la bonne réponse et la réponse de l'utilisateur
                document.querySelectorAll('.quiz-option').forEach((btn, idx) => {
                    if (idx === question.correctAnswer) {
                        btn.classList.add('correct-answer');
                    } else if (idx === parseInt(this.dataset.index) && !isCorrect) {
                        btn.classList.add('incorrect-answer');
                    }
                });
                
                // Activer le bouton suivant
                document.getElementById('next-question').disabled = false;
            });
            
            optionsContainer.appendChild(optionButton);
        });
        
        // Gérer le bouton suivant
        document.getElementById('next-question').addEventListener('click', function() {
            if (currentQuestionIndex < data.questions.length - 1) {
                currentQuestionIndex++;
                showQuestion(currentQuestionIndex);
            } else {
                showResults();
            }
        });
    }
    
    // Fonction pour afficher les résultats
    function showResults() {
        const percentage = Math.round((score / data.questions.length) * 100);
        let message, messageClass;
        
        if (percentage >= 80) {
            message = 'Excellent ! Vous maîtrisez bien ce sujet.';
            messageClass = 'excellent';
        } else if (percentage >= 60) {
            message = 'Bon travail ! Continuez à pratiquer.';
            messageClass = 'good';
        } else {
            message = 'Continuez à apprendre. La pratique fait la perfection !';
            messageClass = 'needs-improvement';
        }
        
        quizContent.innerHTML = `
            <div class="quiz-results">
                <h3>Résultats du Quiz</h3>
                <div class="score-display">
                    <div class="score-circle ${messageClass}">
                        <span class="score-value">${percentage}%</span>
                    </div>
                    <p>${score} sur ${data.questions.length} questions correctes</p>
                </div>
                <p class="result-message ${messageClass}">${message}</p>
                <div class="quiz-actions">
                    <button class="btn primary" id="restart-quiz">Recommencer le quiz</button>
                    <button class="btn secondary" id="review-answers">Revoir les réponses</button>
                </div>
            </div>
        `;
        
        // Gérer le bouton de redémarrage
        document.getElementById('restart-quiz').addEventListener('click', function() {
            currentQuestionIndex = 0;
            score = 0;
            showQuestion(currentQuestionIndex);
        });
        
        // Gérer le bouton de révision
        document.getElementById('review-answers').addEventListener('click', function() {
            // Afficher l'interface de révision
            showQuizReview(data, userAnswers, quizContent);
            
            // Sauvegarder les données de révision dans Firebase
            saveQuizReviewData(quizContainer.dataset.quizType, userAnswers, score);
        });
        
        // Écouter les événements personnalisés de l'interface de révision
        quizContent.addEventListener('quiz:restart', function() {
            currentQuestionIndex = 0;
            score = 0;
            showQuestion(currentQuestionIndex);
        });
        
        quizContent.addEventListener('quiz:back-to-results', function() {
            showResults();
        });
    }
    
    // Démarrer le quiz avec la première question
    showQuestion(currentQuestionIndex);
}

/**
 * Initialise les quiz de révision pour le système de révision espacée
 */
function initRevisionQuiz(cards) {
    const revisionContainer = document.querySelector('.revision-container');
    if (!revisionContainer) return;
    
    // Vider le conteneur
    revisionContainer.innerHTML = '';
    
    // Créer l'interface du quiz de révision
    const quizInterface = document.createElement('div');
    quizInterface.className = 'revision-quiz';
    quizInterface.innerHTML = `
        <h2>Quiz de révision</h2>
        <div class="revision-quiz-content"></div>
    `;
    
    revisionContainer.appendChild(quizInterface);
    
    // Mélanger les cartes pour le quiz
    const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
    
    // Variables pour suivre l'état du quiz
    let currentCardIndex = 0;
    let correctAnswers = 0;
    
    // Fonction pour afficher une carte
    function showCard(index) {
        const card = shuffledCards[index];
        const quizContent = document.querySelector('.revision-quiz-content');
        
        quizContent.innerHTML = `
            <div class="revision-progress">
                <span>Question ${index + 1}/${shuffledCards.length}</span>
                <div class="progress-bar">
                    <div class="progress" style="width: ${((index + 1) / shuffledCards.length) * 100}%"></div>
                </div>
            </div>
            <div class="revision-question">
                <h3>Que signifie : ${card.front}</h3>
            </div>
            <div class="revision-options"></div>
            <div class="revision-feedback" style="display: none;"></div>
            <div class="revision-navigation">
                <button class="btn secondary" id="next-card" disabled>Question suivante</button>
            </div>
        `;
        
        // Créer des options (la bonne réponse et des distracteurs)
        const options = [card.back];
        
        // Ajouter des distracteurs (autres cartes)
        const distractors = shuffledCards
            .filter((c, i) => i !== index)
            .map(c => c.back)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        
        options.push(...distractors);
        
        // Mélanger les options
        const shuffledOptions = [...options].sort(() => Math.random() - 0.5);
        
        // Ajouter les options
        const optionsContainer = quizContent.querySelector('.revision-options');
        shuffledOptions.forEach((option, optionIndex) => {
            const optionButton = document.createElement('button');
            optionButton.className = 'revision-option';
            optionButton.textContent = option;
            
            optionButton.addEventListener('click', function() {
                // Désactiver toutes les options
                document.querySelectorAll('.revision-option').forEach(btn => {
                    btn.disabled = true;
                });
                
                // Vérifier la réponse
                const isCorrect = option === card.back;
                
                // Mettre à jour le score
                if (isCorrect) correctAnswers++;
                
                // Afficher le feedback
                const feedback = quizContent.querySelector('.revision-feedback');
                feedback.style.display = 'block';
                feedback.innerHTML = isCorrect 
                    ? '<p class="correct"><i class="fas fa-check"></i> Correct !</p>'
                    : `<p class="incorrect"><i class="fas fa-times"></i> Incorrect. La bonne réponse est : ${card.back}</p>`;
                
                // Mettre en évidence la bonne réponse et la réponse de l'utilisateur
                document.querySelectorAll('.revision-option').forEach((btn) => {
                    if (btn.textContent === card.back) {
                        btn.classList.add('correct-answer');
                    } else if (btn.textContent === option && !isCorrect) {
                        btn.classList.add('incorrect-answer');
                    }
                });
                
                // Activer le bouton suivant
                document.getElementById('next-card').disabled = false;
            });
            
            optionsContainer.appendChild(optionButton);
        });
        
        // Gérer le bouton suivant
        document.getElementById('next-card').addEventListener('click', function() {
            if (currentCardIndex < shuffledCards.length - 1) {
                currentCardIndex++;
                showCard(currentCardIndex);
            } else {
                showRevisionResults();
            }
        });
    }
    
    // Fonction pour afficher les résultats
    function showRevisionResults() {
        const percentage = Math.round((correctAnswers / shuffledCards.length) * 100);
        const quizContent = document.querySelector('.revision-quiz-content');
        
        quizContent.innerHTML = `
            <div class="revision-results">
                <h3>Résultats de la révision</h3>
                <div class="score-display">
                    <div class="score-circle ${percentage >= 80 ? 'excellent' : percentage >= 60 ? 'good' : 'needs-improvement'}">
                        <span class="score-value">${percentage}%</span>
                    </div>
                    <p>${correctAnswers} sur ${shuffledCards.length} réponses correctes</p>
                </div>
                <div class="revision-actions">
                    <button class="btn primary" id="restart-revision">Recommencer la révision</button>
                    <button class="btn secondary" id="back-to-cards">Retour aux cartes</button>
                </div>
            </div>
        `;
        
        // Gérer le bouton de redémarrage
        document.getElementById('restart-revision').addEventListener('click', function() {
            currentCardIndex = 0;
            correctAnswers = 0;
            showCard(currentCardIndex);
        });
        
        // Gérer le bouton de retour
        document.getElementById('back-to-cards').addEventListener('click', function() {
            // Retourner à l'interface de révision espacée
            window.location.href = 'revision.html';
        });
    }
    
    // Démarrer le quiz avec la première carte
    if (shuffledCards.length > 0) {
        showCard(currentCardIndex);
    } else {
        const quizContent = document.querySelector('.revision-quiz-content');
        quizContent.innerHTML = '<p class="error">Aucune carte disponible pour la révision.</p>';
    }
}
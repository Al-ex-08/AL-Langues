/**
 * LinguaStart - Application d'apprentissage des langues russe et arménienne
 * Script principal pour les fonctionnalités communes
 */

document.addEventListener('DOMContentLoaded', function() {
    // Gestion du formulaire de contact
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            // Simulation d'envoi de formulaire
            alert(`Merci ${name} pour votre message ! Nous vous répondrons à ${email} dès que possible.`);
            contactForm.reset();
        });
    }

    // Animation des cartes de caractères
    const characterCards = document.querySelectorAll('.character-card');
    characterCards.forEach(card => {
        card.addEventListener('click', function() {
            // Ajouter une classe pour l'animation
            this.classList.add('card-flip');
            
            // Jouer l'audio si disponible
            const character = this.querySelector('.character').textContent.trim().charAt(0);
            const audioElement = document.querySelector(`audio[data-character="${character}"]`);
            if (audioElement) {
                audioElement.play();
            }
            
            // Retirer la classe après l'animation
            setTimeout(() => {
                this.classList.remove('card-flip');
            }, 1000);
        });
    });

    // Initialisation des flashcards
    initFlashcards();

    // Initialisation des quiz
    initQuiz();

    // Système de suivi de progression
    initProgressTracking();
});

/**
 * Initialise le système de flashcards
 */
function initFlashcards() {
    const flashcardContainer = document.querySelector('.flashcard-container');
    if (!flashcardContainer) return;

    const language = document.body.classList.contains('russian-theme') ? 'russian' : 'armenian';
    const category = flashcardContainer.dataset.category || 'vocabulary';
    
    // Charger les données des flashcards
    fetch(`../data/${language}/${category}.json`)
        .then(response => response.json())
        .then(data => {
            createFlashcards(data, flashcardContainer);
        })
        .catch(error => {
            console.error('Erreur lors du chargement des flashcards:', error);
            flashcardContainer.innerHTML = '<p class="error">Impossible de charger les flashcards. Veuillez réessayer plus tard.</p>';
        });
}

/**
 * Crée les flashcards à partir des données
 */
function createFlashcards(data, container) {
    // Mélanger les données pour un ordre aléatoire
    const shuffledData = [...data].sort(() => Math.random() - 0.5);
    
    // Vider le conteneur
    container.innerHTML = '';
    
    // Créer les éléments de navigation
    const nav = document.createElement('div');
    nav.className = 'flashcard-nav';
    nav.innerHTML = `
        <button id="prev-card" class="btn secondary"><i class="fas fa-arrow-left"></i> Précédent</button>
        <span id="card-counter">1/${shuffledData.length}</span>
        <button id="next-card" class="btn secondary">Suivant <i class="fas fa-arrow-right"></i></button>
    `;
    container.appendChild(nav);
    
    // Créer le conteneur de flashcards
    const flashcardsWrapper = document.createElement('div');
    flashcardsWrapper.className = 'flashcards-wrapper';
    container.appendChild(flashcardsWrapper);
    
    // Créer chaque flashcard
    shuffledData.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'flashcard';
        card.dataset.index = index;
        if (index > 0) card.style.display = 'none';
        
        card.innerHTML = `
            <div class="flashcard-inner">
                <div class="flashcard-front">
                    <p>${item.front}</p>
                    ${item.audio ? `<button class="audio-btn"><i class="fas fa-volume-up"></i></button>` : ''}
                </div>
                <div class="flashcard-back">
                    <p>${item.back}</p>
                    ${item.example ? `<p class="example">${item.example}</p>` : ''}
                </div>
            </div>
        `;
        
        // Ajouter l'audio si disponible
        if (item.audio) {
            const audio = document.createElement('audio');
            audio.src = item.audio;
            card.appendChild(audio);
            
            const audioBtn = card.querySelector('.audio-btn');
            audioBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                audio.play();
            });
        }
        
        // Ajouter l'événement pour retourner la carte
        card.addEventListener('click', function() {
            this.classList.toggle('flipped');
        });
        
        flashcardsWrapper.appendChild(card);
    });
    
    // Gérer la navigation
    let currentIndex = 0;
    const prevBtn = document.getElementById('prev-card');
    const nextBtn = document.getElementById('next-card');
    const counter = document.getElementById('card-counter');
    
    prevBtn.addEventListener('click', function() {
        if (currentIndex > 0) {
            const currentCard = flashcardsWrapper.querySelector(`.flashcard[data-index="${currentIndex}"]`);
            currentCard.style.display = 'none';
            currentCard.classList.remove('flipped');
            
            currentIndex--;
            const prevCard = flashcardsWrapper.querySelector(`.flashcard[data-index="${currentIndex}"]`);
            prevCard.style.display = 'block';
            counter.textContent = `${currentIndex + 1}/${shuffledData.length}`;
        }
    });
    
    nextBtn.addEventListener('click', function() {
        if (currentIndex < shuffledData.length - 1) {
            const currentCard = flashcardsWrapper.querySelector(`.flashcard[data-index="${currentIndex}"]`);
            currentCard.style.display = 'none';
            currentCard.classList.remove('flipped');
            
            currentIndex++;
            const nextCard = flashcardsWrapper.querySelector(`.flashcard[data-index="${currentIndex}"]`);
            nextCard.style.display = 'block';
            counter.textContent = `${currentIndex + 1}/${shuffledData.length}`;
        }
    });
}

/**
 * Initialise les quiz
 */
function initQuiz() {
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
 */
function createQuiz(data, container) {
    // Vider le conteneur
    container.innerHTML = '';
    
    // Créer le titre du quiz
    const title = document.createElement('h2');
    title.textContent = data.title;
    container.appendChild(title);
    
    // Créer le formulaire de quiz
    const form = document.createElement('form');
    form.className = 'quiz-form';
    container.appendChild(form);
    
    // Ajouter chaque question
    data.questions.forEach((q, qIndex) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'quiz-question';
        
        const questionText = document.createElement('p');
        questionText.className = 'question-text';
        questionText.textContent = `${qIndex + 1}. ${q.question}`;
        questionDiv.appendChild(questionText);
        
        // Ajouter les options
        q.options.forEach((option, oIndex) => {
            const optionLabel = document.createElement('label');
            optionLabel.className = 'quiz-option';
            
            const optionInput = document.createElement('input');
            optionInput.type = 'radio';
            optionInput.name = `question-${qIndex}`;
            optionInput.value = oIndex;
            optionInput.required = true;
            
            optionLabel.appendChild(optionInput);
            optionLabel.appendChild(document.createTextNode(` ${option}`));
            questionDiv.appendChild(optionLabel);
        });
        
        // Ajouter un élément pour le feedback
        const feedback = document.createElement('div');
        feedback.className = 'question-feedback';
        questionDiv.appendChild(feedback);
        
        form.appendChild(questionDiv);
    });
    
    // Ajouter le bouton de soumission
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'btn primary';
    submitBtn.textContent = 'Vérifier mes réponses';
    form.appendChild(submitBtn);
    
    // Ajouter le conteneur de résultats
    const resultsDiv = document.createElement('div');
    resultsDiv.className = 'quiz-results';
    resultsDiv.style.display = 'none';
    container.appendChild(resultsDiv);
    
    // Gérer la soumission du quiz
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let score = 0;
        const questions = form.querySelectorAll('.quiz-question');
        
        questions.forEach((question, qIndex) => {
            const selectedOption = question.querySelector(`input[name="question-${qIndex}"]:checked`);
            const feedback = question.querySelector('.question-feedback');
            
            if (parseInt(selectedOption.value) === data.questions[qIndex].correctAnswer) {
                score++;
                feedback.textContent = 'Correct !';
                feedback.className = 'question-feedback correct';
            } else {
                feedback.textContent = `Incorrect. La bonne réponse était : ${data.questions[qIndex].options[data.questions[qIndex].correctAnswer]}`;
                feedback.className = 'question-feedback incorrect';
            }
        });
        
        // Afficher les résultats
        resultsDiv.style.display = 'block';
        resultsDiv.innerHTML = `
            <h3>Résultats</h3>
            <p>Votre score : ${score}/${data.questions.length}</p>
            <p>${getScoreMessage(score, data.questions.length)}</p>
            <button id="retry-quiz" class="btn secondary">Réessayer</button>
        `;
        
        // Gérer le bouton de réessai
        document.getElementById('retry-quiz').addEventListener('click', function() {
            // Réinitialiser le formulaire et cacher les résultats
            form.reset();
            questions.forEach(question => {
                const feedback = question.querySelector('.question-feedback');
                feedback.textContent = '';
                feedback.className = 'question-feedback';
            });
            resultsDiv.style.display = 'none';
            
            // Enregistrer la progression
            updateProgress(data.title, score, data.questions.length);
        });
        
        // Enregistrer la progression
        updateProgress(data.title, score, data.questions.length);
    });
}

/**
 * Retourne un message en fonction du score
 */
function getScoreMessage(score, total) {
    const percentage = (score / total) * 100;
    
    if (percentage >= 90) {
        return 'Excellent ! Vous maîtrisez parfaitement ce sujet.';
    } else if (percentage >= 75) {
        return 'Très bien ! Vous avez une bonne compréhension du sujet.';
    } else if (percentage >= 50) {
        return 'Pas mal ! Continuez à pratiquer pour vous améliorer.';
    } else {
        return 'Continuez à étudier ce sujet et réessayez plus tard.';
    }
}

/**
 * Initialise le système de suivi de progression
 */
function initProgressTracking() {
    // Vérifier si le stockage local est disponible
    if (!localStorage) return;
    
    // Afficher la progression si on est sur la page d'accueil de la langue
    const progressSection = document.querySelector('.progress-section');
    if (progressSection) {
        displayProgress(progressSection);
    }
}

/**
 * Met à jour la progression de l'utilisateur
 */
function updateProgress(quizTitle, score, total) {
    if (!localStorage) return;
    
    const language = document.body.classList.contains('russian-theme') ? 'russian' : 'armenian';
    
    // Récupérer la progression existante ou créer un nouvel objet
    let progress = JSON.parse(localStorage.getItem(`linguastart_${language}_progress`)) || {};
    
    // Mettre à jour la progression pour ce quiz
    progress[quizTitle] = {
        score: score,
        total: total,
        date: new Date().toISOString()
    };
    
    // Sauvegarder la progression
    localStorage.setItem(`linguastart_${language}_progress`, JSON.stringify(progress));
}

/**
 * Affiche la progression de l'utilisateur
 */
function displayProgress(container) {
    if (!localStorage) return;
    
    const language = document.body.classList.contains('russian-theme') ? 'russian' : 'armenian';
    const progress = JSON.parse(localStorage.getItem(`linguastart_${language}_progress`));
    
    if (!progress || Object.keys(progress).length === 0) {
        container.innerHTML = '<p>Vous n\'avez pas encore complété d\'exercices. Commencez dès maintenant !</p>';
        return;
    }
    
    // Créer le tableau de progression
    let html = '<h2>Votre progression</h2>';
    html += '<div class="progress-table-container"><table class="progress-table">';
    html += '<thead><tr><th>Quiz</th><th>Score</th><th>Date</th></tr></thead><tbody>';
    
    for (const [quiz, data] of Object.entries(progress)) {
        const date = new Date(data.date).toLocaleDateString();
        const percentage = Math.round((data.score / data.total) * 100);
        
        html += `<tr>
            <td>${quiz}</td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                    <span>${data.score}/${data.total} (${percentage}%)</span>
                </div>
            </td>
            <td>${date}</td>
        </tr>`;
    }
    
    html += '</tbody></table></div>';
    
    // Ajouter un bouton pour réinitialiser la progression
    html += '<button id="reset-progress" class="btn secondary">Réinitialiser ma progression</button>';
    
    container.innerHTML = html;
    
    // Gérer le bouton de réinitialisation
    document.getElementById('reset-progress').addEventListener('click', function() {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser votre progression ? Cette action est irréversible.')) {
            localStorage.removeItem(`linguastart_${language}_progress`);
            container.innerHTML = '<p>Votre progression a été réinitialisée.</p>';
        }
    });
}
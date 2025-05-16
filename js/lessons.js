/**
 * LinguaStart - Application d'apprentissage des langues russe et arménienne
 * Script pour les fonctionnalités spécifiques aux leçons
 */

document.addEventListener('DOMContentLoaded', function() {
    // Gestion de l'audio pour les lettres de l'alphabet
    initAlphabetAudio();
    
    // Initialisation des exercices d'écriture
    initWritingExercises();
    
    // Initialisation des exercices de prononciation
    initPronunciationExercises();
});

/**
 * Initialise l'audio pour les lettres de l'alphabet
 */
function initAlphabetAudio() {
    const characterCards = document.querySelectorAll('.character-card');
    if (!characterCards.length) return;
    
    const language = document.body.classList.contains('russian-theme') ? 'russian' : 'armenian';
    
    characterCards.forEach(card => {
        const character = card.querySelector('.character').textContent.trim().charAt(0);
        const audioPath = `../audio/${language}/alphabet/${character.toLowerCase()}.mp3`;
        
        // Créer l'élément audio
        const audio = document.createElement('audio');
        audio.src = audioPath;
        audio.dataset.character = character;
        document.body.appendChild(audio);
        
        // Ajouter un bouton de lecture
        const playButton = document.createElement('button');
        playButton.className = 'play-audio';
        playButton.innerHTML = '<i class="fas fa-volume-up"></i>';
        playButton.addEventListener('click', function(e) {
            e.stopPropagation();
            audio.play();
        });
        
        card.appendChild(playButton);
        
        // Jouer l'audio au clic sur la carte
        card.addEventListener('click', function() {
            audio.play();
        });
    });
}

/**
 * Initialise les exercices d'écriture
 */
function initWritingExercises() {
    const writingExercises = document.querySelector('.writing-exercises');
    if (!writingExercises) return;
    
    const language = document.body.classList.contains('russian-theme') ? 'russian' : 'armenian';
    const exerciseType = writingExercises.dataset.exerciseType || 'alphabet';
    
    // Charger les données d'exercice
    fetch(`../data/${language}/writing_${exerciseType}.json`)
        .then(response => response.json())
        .then(data => {
            createWritingExercises(data, writingExercises);
        })
        .catch(error => {
            console.error('Erreur lors du chargement des exercices d\'écriture:', error);
            writingExercises.innerHTML = '<p class="error">Impossible de charger les exercices. Veuillez réessayer plus tard.</p>';
        });
}

/**
 * Crée les exercices d'écriture à partir des données
 */
function createWritingExercises(data, container) {
    // Vider le conteneur
    container.innerHTML = '';
    
    // Créer le titre
    const title = document.createElement('h2');
    title.textContent = data.title;
    container.appendChild(title);
    
    // Créer la description
    const description = document.createElement('p');
    description.textContent = data.description;
    container.appendChild(description);
    
    // Créer les exercices
    const exercisesContainer = document.createElement('div');
    exercisesContainer.className = 'exercises-container';
    container.appendChild(exercisesContainer);
    
    data.exercises.forEach((exercise, index) => {
        const exerciseDiv = document.createElement('div');
        exerciseDiv.className = 'writing-exercise';
        
        exerciseDiv.innerHTML = `
            <div class="exercise-prompt">
                <p>${exercise.prompt}</p>
                ${exercise.audio ? `<button class="audio-btn"><i class="fas fa-volume-up"></i></button>` : ''}
            </div>
            <div class="exercise-input">
                <input type="text" placeholder="Votre réponse..." data-answer="${exercise.answer}">
                <button class="check-btn">Vérifier</button>
            </div>
            <div class="exercise-feedback"></div>
        `;
        
        // Ajouter l'audio si disponible
        if (exercise.audio) {
            const audio = document.createElement('audio');
            audio.src = exercise.audio;
            exerciseDiv.appendChild(audio);
            
            const audioBtn = exerciseDiv.querySelector('.audio-btn');
            audioBtn.addEventListener('click', function() {
                audio.play();
            });
        }
        
        // Gérer la vérification de la réponse
        const checkBtn = exerciseDiv.querySelector('.check-btn');
        const input = exerciseDiv.querySelector('input');
        const feedback = exerciseDiv.querySelector('.exercise-feedback');
        
        checkBtn.addEventListener('click', function() {
            const userAnswer = input.value.trim();
            const correctAnswer = input.dataset.answer;
            
            if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
                feedback.textContent = 'Correct !';
                feedback.className = 'exercise-feedback correct';
                input.classList.add('correct-answer');
            } else {
                feedback.textContent = `Incorrect. La bonne réponse est : ${correctAnswer}`;
                feedback.className = 'exercise-feedback incorrect';
                input.classList.add('incorrect-answer');
            }
        });
        
        exercisesContainer.appendChild(exerciseDiv);
    });
}

/**
 * Initialise les exercices de prononciation
 */
function initPronunciationExercises() {
    const pronunciationExercises = document.querySelector('.pronunciation-exercises');
    if (!pronunciationExercises) return;
    
    const language = document.body.classList.contains('russian-theme') ? 'russian' : 'armenian';
    
    // Vérifier si l'API Web Speech est disponible
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        pronunciationExercises.innerHTML = '<p class="error">Votre navigateur ne prend pas en charge la reconnaissance vocale. Veuillez utiliser Chrome, Edge ou Safari pour accéder à cette fonctionnalité.</p>';
        return;
    }
    
    // Charger les données d'exercice
    fetch(`../data/${language}/pronunciation.json`)
        .then(response => response.json())
        .then(data => {
            createPronunciationExercises(data, pronunciationExercises, language);
        })
        .catch(error => {
            console.error('Erreur lors du chargement des exercices de prononciation:', error);
            pronunciationExercises.innerHTML = '<p class="error">Impossible de charger les exercices. Veuillez réessayer plus tard.</p>';
        });
}

/**
 * Crée les exercices de prononciation à partir des données
 */
function createPronunciationExercises(data, container, language) {
    // Vider le conteneur
    container.innerHTML = '';
    
    // Créer le titre
    const title = document.createElement('h2');
    title.textContent = data.title;
    container.appendChild(title);
    
    // Créer la description
    const description = document.createElement('p');
    description.textContent = data.description;
    container.appendChild(description);
    
    // Créer les exercices
    const exercisesContainer = document.createElement('div');
    exercisesContainer.className = 'exercises-container';
    container.appendChild(exercisesContainer);
    
    data.exercises.forEach((exercise, index) => {
        const exerciseDiv = document.createElement('div');
        exerciseDiv.className = 'pronunciation-exercise';
        
        exerciseDiv.innerHTML = `
            <div class="exercise-prompt">
                <p>${exercise.text}</p>
                <button class="audio-btn"><i class="fas fa-volume-up"></i></button>
            </div>
            <div class="exercise-controls">
                <button class="record-btn"><i class="fas fa-microphone"></i> Enregistrer</button>
                <div class="recording-status">Cliquez sur Enregistrer pour commencer</div>
            </div>
            <div class="exercise-feedback"></div>
        `;
        
        // Ajouter l'audio
        const audio = document.createElement('audio');
        audio.src = exercise.audio;
        exerciseDiv.appendChild(audio);
        
        const audioBtn = exerciseDiv.querySelector('.audio-btn');
        audioBtn.addEventListener('click', function() {
            audio.play();
        });
        
        // Gérer l'enregistrement
        const recordBtn = exerciseDiv.querySelector('.record-btn');
        const status = exerciseDiv.querySelector('.recording-status');
        const feedback = exerciseDiv.querySelector('.exercise-feedback');
        
        // Initialiser la reconnaissance vocale
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        // Configurer la reconnaissance vocale
        recognition.lang = language === 'russian' ? 'ru-RU' : 'hy-AM';
        recognition.continuous = false;
        recognition.interimResults = false;
        
        // Gérer les événements de reconnaissance
        recognition.onstart = function() {
            status.textContent = 'Écoute en cours...';
            status.className = 'recording-status recording';
            recordBtn.disabled = true;
        };
        
        recognition.onend = function() {
            status.textContent = 'Écoute terminée';
            status.className = 'recording-status';
            recordBtn.disabled = false;
        };
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript.toLowerCase();
            const confidence = event.results[0][0].confidence;
            
            // Comparer avec le texte attendu
            const expectedText = exercise.text.toLowerCase();
            const similarity = calculateSimilarity(transcript, expectedText);
            
            if (similarity > 0.7) {
                feedback.textContent = `Excellent ! Votre prononciation est correcte. (${Math.round(similarity * 100)}% de similarité)`;
                feedback.className = 'exercise-feedback correct';
            } else if (similarity > 0.4) {
                feedback.textContent = `Pas mal, mais vous pouvez vous améliorer. (${Math.round(similarity * 100)}% de similarité)`;
                feedback.className = 'exercise-feedback partial';
            } else {
                feedback.textContent = `Essayez encore. Écoutez l'exemple et réessayez. (${Math.round(similarity * 100)}% de similarité)`;
                feedback.className = 'exercise-feedback incorrect';
            }
        };
        
        recognition.onerror = function(event) {
            status.textContent = `Erreur: ${event.error}`;
            status.className = 'recording-status error';
            recordBtn.disabled = false;
        };
        
        // Démarrer l'enregistrement au clic
        recordBtn.addEventListener('click', function() {
            recognition.start();
        });
        
        exercisesContainer.appendChild(exerciseDiv);
    });
}

/**
 * Calcule la similarité entre deux chaînes de caractères
 * Utilise la distance de Levenshtein
 */
function calculateSimilarity(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = [];
    
    // Initialiser la matrice
    for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
    }
    
    // Remplir la matrice
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = str1.charAt(i - 1) === str2.charAt(j - 1) ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,      // suppression
                matrix[i][j - 1] + 1,      // insertion
                matrix[i - 1][j - 1] + cost // substitution
            );
        }
    }
    
    // Calculer la similarité
    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);
    return maxLen > 0 ? 1 - distance / maxLen : 1;
}
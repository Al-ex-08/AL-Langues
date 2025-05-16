/**
 * LinguaStart - Application d'apprentissage des langues russe et arménienne
 * Script pour les fonctionnalités spécifiques à l'apprentissage des alphabets
 */

document.addEventListener('DOMContentLoaded', function() {
    initAlphabetInteractions();
    initAlphabetExercises();
});

/**
 * Initialise les interactions avec l'alphabet
 */
function initAlphabetInteractions() {
    const characterCards = document.querySelectorAll('.character-card');
    if (!characterCards.length) return;
    
    const language = document.body.classList.contains('russian-theme') ? 'russian' : 'armenian';
    
    characterCards.forEach(card => {
        // Ajouter l'animation au clic
        card.addEventListener('click', function() {
            this.classList.add('card-flip');
            
            // Récupérer la lettre
            const character = this.querySelector('.character').textContent.trim().charAt(0);
            
            // Jouer l'audio
            playCharacterAudio(character, language);
            
            // Retirer l'animation après un délai
            setTimeout(() => {
                this.classList.remove('card-flip');
            }, 1000);
        });
        
        // Ajouter le bouton de lecture audio s'il n'existe pas déjà
        if (!card.querySelector('.play-audio')) {
            const character = card.querySelector('.character').textContent.trim().charAt(0);
            const playButton = document.createElement('button');
            playButton.className = 'play-audio';
            playButton.innerHTML = '<i class="fas fa-volume-up"></i>';
            playButton.addEventListener('click', function(e) {
                e.stopPropagation(); // Empêcher le déclenchement de l'événement du parent
                playCharacterAudio(character, language);
            });
            
            card.appendChild(playButton);
        }
    });
    
    // Ajouter un bouton pour écouter toutes les lettres en séquence
    const alphabetSection = document.querySelector('.alphabet-grid');
    if (alphabetSection && !document.getElementById('play-all-letters')) {
        const playAllButton = document.createElement('button');
        playAllButton.id = 'play-all-letters';
        playAllButton.className = 'btn secondary';
        playAllButton.innerHTML = '<i class="fas fa-play"></i> Écouter tout l\'alphabet';
        playAllButton.addEventListener('click', function() {
            playAllLetters(language);
        });
        
        // Insérer le bouton avant la grille d'alphabet
        alphabetSection.parentNode.insertBefore(playAllButton, alphabetSection);
    }
}

/**
 * Joue l'audio d'une lettre spécifique
 * @param {string} character - La lettre à prononcer
 * @param {string} language - La langue (russian ou armenian)
 */
function playCharacterAudio(character, language) {
    const audioPath = `../audio/${language}/alphabet/${character.toLowerCase()}.mp3`;
    
    // Vérifier si l'élément audio existe déjà
    let audioElement = document.querySelector(`audio[data-character="${character}"]`);
    
    if (!audioElement) {
        // Créer un nouvel élément audio
        audioElement = document.createElement('audio');
        audioElement.src = audioPath;
        audioElement.dataset.character = character;
        document.body.appendChild(audioElement);
    }
    
    // Jouer l'audio
    audioElement.play().catch(error => {
        console.error(`Impossible de jouer l'audio pour la lettre ${character}:`, error);
    });
}

/**
 * Joue l'audio de toutes les lettres de l'alphabet en séquence
 * @param {string} language - La langue (russian ou armenian)
 */
function playAllLetters(language) {
    const characterCards = document.querySelectorAll('.character-card');
    if (!characterCards.length) return;
    
    // Désactiver le bouton pendant la lecture
    const playAllButton = document.getElementById('play-all-letters');
    if (playAllButton) {
        playAllButton.disabled = true;
        playAllButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Lecture en cours...';
    }
    
    // Jouer les lettres en séquence
    let index = 0;
    const playNext = () => {
        if (index < characterCards.length) {
            const card = characterCards[index];
            const character = card.querySelector('.character').textContent.trim().charAt(0);
            
            // Mettre en évidence la carte actuelle
            card.classList.add('highlight');
            
            // Jouer l'audio
            const audioPath = `../audio/${language}/alphabet/${character.toLowerCase()}.mp3`;
            const audio = new Audio(audioPath);
            
            audio.onended = () => {
                // Retirer la mise en évidence
                card.classList.remove('highlight');
                
                // Passer à la lettre suivante
                index++;
                setTimeout(playNext, 300); // Petit délai entre chaque lettre
            };
            
            audio.onerror = () => {
                // En cas d'erreur, passer à la suivante
                card.classList.remove('highlight');
                index++;
                setTimeout(playNext, 300);
            };
            
            audio.play().catch(() => {
                // En cas d'erreur, passer à la suivante
                card.classList.remove('highlight');
                index++;
                setTimeout(playNext, 300);
            });
        } else {
            // Réactiver le bouton à la fin
            if (playAllButton) {
                playAllButton.disabled = false;
                playAllButton.innerHTML = '<i class="fas fa-play"></i> Écouter tout l\'alphabet';
            }
        }
    };
    
    playNext();
}

/**
 * Initialise les exercices d'apprentissage de l'alphabet
 */
function initAlphabetExercises() {
    const exercisesContainer = document.querySelector('.alphabet-exercises');
    if (!exercisesContainer) return;
    
    const language = document.body.classList.contains('russian-theme') ? 'russian' : 'armenian';
    
    // Créer les différents types d'exercices
    createLetterRecognitionExercise(exercisesContainer, language);
    createLetterWritingExercise(exercisesContainer, language);
    createLetterSoundExercise(exercisesContainer, language);
}

/**
 * Crée un exercice de reconnaissance des lettres
 * @param {HTMLElement} container - Le conteneur pour l'exercice
 * @param {string} language - La langue (russian ou armenian)
 */
function createLetterRecognitionExercise(container, language) {
    const exerciseDiv = document.createElement('div');
    exerciseDiv.className = 'exercise-section letter-recognition';
    exerciseDiv.innerHTML = `
        <h3>Reconnaissance des lettres</h3>
        <p>Cliquez sur la lettre correspondant au son que vous entendez.</p>
        <div class="exercise-content">
            <div class="exercise-prompt">
                <button class="play-sound-btn"><i class="fas fa-volume-up"></i> Écouter le son</button>
            </div>
            <div class="letter-options"></div>
            <div class="exercise-feedback"></div>
            <button class="btn primary next-exercise" style="display: none;">Exercice suivant</button>
        </div>
    `;
    
    container.appendChild(exerciseDiv);
    
    // Initialiser l'exercice
    initLetterRecognitionExercise(exerciseDiv, language);
}

/**
 * Initialise l'exercice de reconnaissance des lettres
 * @param {HTMLElement} exerciseDiv - Le div de l'exercice
 * @param {string} language - La langue (russian ou armenian)
 */
function initLetterRecognitionExercise(exerciseDiv, language) {
    // Récupérer toutes les lettres de l'alphabet depuis les cartes
    const allLetters = [];
    document.querySelectorAll('.character-card').forEach(card => {
        const letter = card.querySelector('.character').textContent.trim().charAt(0);
        allLetters.push(letter);
    });
    
    if (allLetters.length === 0) return;
    
    // Variables pour suivre l'état de l'exercice
    let currentLetter = '';
    let currentOptions = [];
    
    // Fonction pour générer un nouvel exercice
    function generateExercise() {
        // Choisir une lettre aléatoire
        currentLetter = allLetters[Math.floor(Math.random() * allLetters.length)];
        
        // Générer des options (la bonne réponse et des distracteurs)
        currentOptions = [currentLetter];
        
        // Ajouter des distracteurs
        while (currentOptions.length < 4) {
            const randomLetter = allLetters[Math.floor(Math.random() * allLetters.length)];
            if (!currentOptions.includes(randomLetter)) {
                currentOptions.push(randomLetter);
            }
        }
        
        // Mélanger les options
        currentOptions.sort(() => Math.random() - 0.5);
        
        // Mettre à jour l'interface
        const optionsContainer = exerciseDiv.querySelector('.letter-options');
        optionsContainer.innerHTML = '';
        
        currentOptions.forEach(letter => {
            const optionButton = document.createElement('button');
            optionButton.className = 'letter-option';
            optionButton.textContent = letter;
            
            optionButton.addEventListener('click', function() {
                // Vérifier la réponse
                const isCorrect = letter === currentLetter;
                
                // Désactiver toutes les options
                exerciseDiv.querySelectorAll('.letter-option').forEach(btn => {
                    btn.disabled = true;
                });
                
                // Mettre en évidence la bonne réponse et la réponse de l'utilisateur
                exerciseDiv.querySelectorAll('.letter-option').forEach(btn => {
                    if (btn.textContent === currentLetter) {
                        btn.classList.add('correct-answer');
                    } else if (btn.textContent === letter && !isCorrect) {
                        btn.classList.add('incorrect-answer');
                    }
                });
                
                // Afficher le feedback
                const feedback = exerciseDiv.querySelector('.exercise-feedback');
                feedback.innerHTML = isCorrect 
                    ? '<p class="correct"><i class="fas fa-check"></i> Correct !</p>'
                    : `<p class="incorrect"><i class="fas fa-times"></i> Incorrect. La bonne réponse est : ${currentLetter}</p>`;
                
                // Afficher le bouton pour passer à l'exercice suivant
                exerciseDiv.querySelector('.next-exercise').style.display = 'block';
            });
            
            optionsContainer.appendChild(optionButton);
        });
        
        // Réinitialiser le feedback
        exerciseDiv.querySelector('.exercise-feedback').innerHTML = '';
        
        // Masquer le bouton suivant
        exerciseDiv.querySelector('.next-exercise').style.display = 'none';
    }
    
    // Initialiser le premier exercice
    generateExercise();
    
    // Gérer le bouton de lecture du son
    exerciseDiv.querySelector('.play-sound-btn').addEventListener('click', function() {
        playCharacterAudio(currentLetter, language);
    });
    
    // Gérer le bouton pour passer à l'exercice suivant
    exerciseDiv.querySelector('.next-exercise').addEventListener('click', function() {
        generateExercise();
    });
}

/**
 * Crée un exercice d'écriture des lettres
 * @param {HTMLElement} container - Le conteneur pour l'exercice
 * @param {string} language - La langue (russian ou armenian)
 */
function createLetterWritingExercise(container, language) {
    const exerciseDiv = document.createElement('div');
    exerciseDiv.className = 'exercise-section letter-writing';
    exerciseDiv.innerHTML = `
        <h3>Écriture des lettres</h3>
        <p>Écrivez la lettre correspondant à la prononciation que vous entendez.</p>
        <div class="exercise-content">
            <div class="exercise-prompt">
                <button class="play-sound-btn"><i class="fas fa-volume-up"></i> Écouter le son</button>
            </div>
            <div class="writing-input">
                <input type="text" class="letter-input" placeholder="Écrivez la lettre ici" maxlength="1">
                <button class="check-btn">Vérifier</button>
            </div>
            <div class="exercise-feedback"></div>
            <button class="btn primary next-exercise" style="display: none;">Exercice suivant</button>
        </div>
    `;
    
    container.appendChild(exerciseDiv);
    
    // Initialiser l'exercice
    initLetterWritingExercise(exerciseDiv, language);
}

/**
 * Initialise l'exercice d'écriture des lettres
 * @param {HTMLElement} exerciseDiv - Le div de l'exercice
 * @param {string} language - La langue (russian ou armenian)
 */
function initLetterWritingExercise(exerciseDiv, language) {
    // Récupérer toutes les lettres de l'alphabet depuis les cartes
    const allLetters = [];
    document.querySelectorAll('.character-card').forEach(card => {
        const letter = card.querySelector('.character').textContent.trim().charAt(0);
        allLetters.push(letter);
    });
    
    if (allLetters.length === 0) return;
    
    // Variable pour suivre l'état de l'exercice
    let currentLetter = '';
    
    // Fonction pour générer un nouvel exercice
    function generateExercise() {
        // Choisir une lettre aléatoire
        currentLetter = allLetters[Math.floor(Math.random() * allLetters.length)];
        
        // Réinitialiser l'input
        const input = exerciseDiv.querySelector('.letter-input');
        input.value = '';
        input.disabled = false;
        input.focus();
        
        // Réinitialiser le feedback
        exerciseDiv.querySelector('.exercise-feedback').innerHTML = '';
        
        // Réactiver le bouton de vérification
        exerciseDiv.querySelector('.check-btn').disabled = false;
        
        // Masquer le bouton suivant
        exerciseDiv.querySelector('.next-exercise').style.display = 'none';
    }
    
    // Initialiser le premier exercice
    generateExercise();
    
    // Gérer le bouton de lecture du son
    exerciseDiv.querySelector('.play-sound-btn').addEventListener('click', function() {
        playCharacterAudio(currentLetter, language);
    });
    
    // Gérer le bouton de vérification
    exerciseDiv.querySelector('.check-btn').addEventListener('click', function() {
        const input = exerciseDiv.querySelector('.letter-input');
        const userAnswer = input.value.trim();
        
        // Vérifier la réponse
        const isCorrect = userAnswer.toLowerCase() === currentLetter.toLowerCase();
        
        // Désactiver l'input et le bouton
        input.disabled = true;
        this.disabled = true;
        
        // Afficher le feedback
        const feedback = exerciseDiv.querySelector('.exercise-feedback');
        feedback.innerHTML = isCorrect 
            ? '<p class="correct"><i class="fas fa-check"></i> Correct !</p>'
            : `<p class="incorrect"><i class="fas fa-times"></i> Incorrect. La bonne réponse est : ${currentLetter}</p>`;
        
        // Mettre en évidence l'input
        input.classList.add(isCorrect ? 'correct-answer' : 'incorrect-answer');
        
        // Afficher le bouton pour passer à l'exercice suivant
        exerciseDiv.querySelector('.next-exercise').style.display = 'block';
    });
    
    // Gérer la touche Entrée dans l'input
    exerciseDiv.querySelector('.letter-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            exerciseDiv.querySelector('.check-btn').click();
        }
    });
    
    // Gérer le bouton pour passer à l'exercice suivant
    exerciseDiv.querySelector('.next-exercise').addEventListener('click', function() {
        // Réinitialiser les classes de l'input
        exerciseDiv.querySelector('.letter-input').classList.remove('correct-answer', 'incorrect-answer');
        
        // Générer un nouvel exercice
        generateExercise();
    });
}

/**
 * Crée un exercice d'association son-lettre
 * @param {HTMLElement} container - Le conteneur pour l'exercice
 * @param {string} language - La langue (russian ou armenian)
 */
function createLetterSoundExercise(container, language) {
    const exerciseDiv = document.createElement('div');
    exerciseDiv.className = 'exercise-section letter-sound';
    exerciseDiv.innerHTML = `
        <h3>Association son-lettre</h3>
        <p>Associez chaque lettre au son correspondant.</p>
        <div class="exercise-content">
            <div class="matching-game">
                <div class="letters-column"></div>
                <div class="sounds-column"></div>
            </div>
            <div class="exercise-feedback"></div>
            <button class="btn primary check-matches">Vérifier les associations</button>
            <button class="btn secondary reset-exercise">Réinitialiser</button>
            <button class="btn primary next-exercise" style="display: none;">Nouvel exercice</button>
        </div>
    `;
    
    container.appendChild(exerciseDiv);
    
    // Initialiser l'exercice
    initLetterSoundExercise(exerciseDiv, language);
}

/**
 * Initialise l'exercice d'association son-lettre
 * @param {HTMLElement} exerciseDiv - Le div de l'exercice
 * @param {string} language - La langue (russian ou armenian)
 */
function initLetterSoundExercise(exerciseDiv, language) {
    // Récupérer toutes les lettres de l'alphabet depuis les cartes
    const allLetters = [];
    document.querySelectorAll('.character-card').forEach(card => {
        const letter = card.querySelector('.character').textContent.trim().charAt(0);
        allLetters.push(letter);
    });
    
    if (allLetters.length === 0) return;
    
    // Variables pour suivre l'état de l'exercice
    let selectedLetters = [];
    let selectedSounds = [];
    let currentMatches = {};
    let selectedElement = null;
    
    // Fonction pour générer un nouvel exercice
    function generateExercise() {
        // Réinitialiser les variables
        selectedLetters = [];
        selectedSounds = [];
        currentMatches = {};
        selectedElement = null;
        
        // Sélectionner 5 lettres aléatoires (ou moins si l'alphabet est plus petit)
        const numLetters = Math.min(5, allLetters.length);
        while (selectedLetters.length < numLetters) {
            const randomIndex = Math.floor(Math.random() * allLetters.length);
            const letter = allLetters[randomIndex];
            if (!selectedLetters.includes(letter)) {
                selectedLetters.push(letter);
                selectedSounds.push(letter); // Même lettre pour le son
            }
        }
        
        // Mélanger les sons
        selectedSounds.sort(() => Math.random() - 0.5);
        
        // Mettre à jour l'interface
        const lettersColumn = exerciseDiv.querySelector('.letters-column');
        const soundsColumn = exerciseDiv.querySelector('.sounds-column');
        
        lettersColumn.innerHTML = '';
        soundsColumn.innerHTML = '';
        
        // Créer les éléments de lettre
        selectedLetters.forEach(letter => {
            const letterElement = document.createElement('div');
            letterElement.className = 'matching-item letter-item';
            letterElement.textContent = letter;
            letterElement.dataset.letter = letter;
            
            letterElement.addEventListener('click', function() {
                // Désélectionner l'élément précédent s'il existe
                if (selectedElement) {
                    selectedElement.classList.remove('selected');
                }
                
                // Sélectionner cet élément
                this.classList.add('selected');
                selectedElement = this;
            });
            
            lettersColumn.appendChild(letterElement);
        });
        
        // Créer les éléments de son
        selectedSounds.forEach(letter => {
            const soundElement = document.createElement('div');
            soundElement.className = 'matching-item sound-item';
            soundElement.innerHTML = '<i class="fas fa-volume-up"></i>';
            soundElement.dataset.letter = letter;
            
            soundElement.addEventListener('click', function() {
                // Jouer le son
                playCharacterAudio(letter, language);
                
                // Si une lettre est sélectionnée, créer une association
                if (selectedElement && selectedElement.classList.contains('letter-item')) {
                    const selectedLetter = selectedElement.dataset.letter;
                    
                    // Supprimer l'association précédente si elle existe
                    Object.keys(currentMatches).forEach(key => {
                        if (currentMatches[key] === letter) {
                            delete currentMatches[key];
                        }
                    });
                    
                    // Créer la nouvelle association
                    currentMatches[selectedLetter] = letter;
                    
                    // Mettre à jour l'interface
                    updateMatchesDisplay();
                    
                    // Désélectionner la lettre
                    selectedElement.classList.remove('selected');
                    selectedElement = null;
                }
            });
            
            soundsColumn.appendChild(soundElement);
        });
        
        // Réinitialiser le feedback
        exerciseDiv.querySelector('.exercise-feedback').innerHTML = '';
        
        // Afficher les boutons appropriés
        exerciseDiv.querySelector('.check-matches').style.display = 'block';
        exerciseDiv.querySelector('.reset-exercise').style.display = 'block';
        exerciseDiv.querySelector('.next-exercise').style.display = 'none';
    }
    
    // Fonction pour mettre à jour l'affichage des associations
    function updateMatchesDisplay() {
        // Réinitialiser toutes les lignes
        exerciseDiv.querySelectorAll('.match-line').forEach(line => {
            line.remove();
        });
        
        // Créer une ligne pour chaque association
        Object.keys(currentMatches).forEach(letterKey => {
            const soundKey = currentMatches[letterKey];
            
            // Trouver les éléments correspondants
            const letterElement = exerciseDiv.querySelector(`.letter-item[data-letter="${letterKey}"]`);
            const soundElement = exerciseDiv.querySelector(`.sound-item[data-letter="${soundKey}"]`);
            
            if (letterElement && soundElement) {
                // Créer une ligne entre les deux éléments
                const matchLine = document.createElement('div');
                matchLine.className = 'match-line';
                
                // Positionner la ligne (simplifié pour cet exemple)
                const letterRect = letterElement.getBoundingClientRect();
                const soundRect = soundElement.getBoundingClientRect();
                
                // Ajouter la ligne au DOM
                exerciseDiv.querySelector('.matching-game').appendChild(matchLine);
            }
        });
    }
    
    // Initialiser le premier exercice
    generateExercise();
    
    // Gérer le bouton de vérification
    exerciseDiv.querySelector('.check-matches').addEventListener('click', function() {
        // Vérifier les associations
        let correctCount = 0;
        
        Object.keys(currentMatches).forEach(letterKey => {
            const soundKey = currentMatches[letterKey];
            if (letterKey === soundKey) {
                correctCount++;
            }
        });
        
        // Afficher le feedback
        const feedback = exerciseDiv.querySelector('.exercise-feedback');
        const totalMatches = selectedLetters.length;
        
        if (correctCount === totalMatches) {
            feedback.innerHTML = '<p class="correct"><i class="fas fa-check"></i> Parfait ! Toutes les associations sont correctes.</p>';
        } else {
            feedback.innerHTML = `<p class="partial"><i class="fas fa-info-circle"></i> ${correctCount} sur ${totalMatches} associations correctes.</p>`;
        }
        
        // Mettre en évidence les associations correctes et incorrectes
        Object.keys(currentMatches).forEach(letterKey => {
            const soundKey = currentMatches[letterKey];
            
            // Trouver les éléments correspondants
            const letterElement = exerciseDiv.querySelector(`.letter-item[data-letter="${letterKey}"]`);
            const soundElement = exerciseDiv.querySelector(`.sound-item[data-letter="${soundKey}"]`);
            
            if (letterElement && soundElement) {
                if (letterKey === soundKey) {
                    letterElement.classList.add('correct-match');
                    soundElement.classList.add('correct-match');
                } else {
                    letterElement.classList.add('incorrect-match');
                    soundElement.classList.add('incorrect-match');
                }
            }
        });
        
        // Masquer les boutons de vérification et de réinitialisation
        this.style.display = 'none';
        exerciseDiv.querySelector('.reset-exercise').style.display = 'none';
        
        // Afficher le bouton pour passer à l'exercice suivant
        exerciseDiv.querySelector('.next-exercise').style.display = 'block';
    });
    
    // Gérer le bouton de réinitialisation
    exerciseDiv.querySelector('.reset-exercise').addEventListener('click', function() {
        // Réinitialiser les associations
        currentMatches = {};
        
        // Réinitialiser l'interface
        exerciseDiv.querySelectorAll('.match-line').forEach(line => {
            line.remove();
        });
        
        exerciseDiv.querySelectorAll('.matching-item').forEach(item => {
            item.classList.remove('selected', 'correct-match', 'incorrect-match');
        });
        
        // Réinitialiser le feedback
        exerciseDiv.querySelector('.exercise-feedback').innerHTML = '';
        
        // Désélectionner l'élément sélectionné
        selectedElement = null;
    });
    
    // Gérer le bouton pour passer à l'exercice suivant
    exerciseDiv.querySelector('.next-exercise').addEventListener('click', function() {
        generateExercise();
    });
}
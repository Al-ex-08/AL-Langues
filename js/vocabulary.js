/**
 * LinguaStart - Application d'apprentissage des langues russe et arménienne
 * Script pour les fonctionnalités d'apprentissage du vocabulaire
 */

document.addEventListener('DOMContentLoaded', function() {
    initVocabularyLearning();
    initVocabularyExercises();
});

/**
 * Initialise l'apprentissage du vocabulaire
 */
function initVocabularyLearning() {
    const vocabularyContainer = document.querySelector('.vocabulary-container');
    if (!vocabularyContainer) return;

    const language = document.body.classList.contains('russian-theme') ? 'russian' : 'armenian';
    const category = vocabularyContainer.dataset.category || 'basic';
    
    // Charger les données de vocabulaire
    fetch(`../data/${language}/vocabulary.json`)
        .then(response => response.json())
        .then(data => {
            // Filtrer par catégorie si nécessaire
            const vocabularyData = category === 'all' ? data : data.filter(item => item.category === category);
            createVocabularyList(vocabularyData, vocabularyContainer, language);
        })
        .catch(error => {
            console.error('Erreur lors du chargement du vocabulaire:', error);
            vocabularyContainer.innerHTML = '<p class="error">Impossible de charger le vocabulaire. Veuillez réessayer plus tard.</p>';
        });
}

/**
 * Crée la liste de vocabulaire à partir des données
 * @param {Array} data - Les données de vocabulaire
 * @param {HTMLElement} container - Le conteneur pour la liste
 * @param {string} language - La langue (russian ou armenian)
 */
function createVocabularyList(data, container, language) {
    // Vider le conteneur
    container.innerHTML = '';
    
    // Regrouper par catégorie
    const categorizedData = {};
    data.forEach(item => {
        if (!categorizedData[item.category]) {
            categorizedData[item.category] = [];
        }
        categorizedData[item.category].push(item);
    });
    
    // Créer une section pour chaque catégorie
    Object.keys(categorizedData).forEach(category => {
        const categoryItems = categorizedData[category];
        
        const categorySection = document.createElement('div');
        categorySection.className = 'vocabulary-category';
        
        // Titre de la catégorie
        const categoryTitle = document.createElement('h2');
        categoryTitle.textContent = formatCategoryName(category);
        categorySection.appendChild(categoryTitle);
        
        // Créer la liste de mots
        const wordList = document.createElement('div');
        wordList.className = 'word-list';
        
        categoryItems.forEach(item => {
            const wordCard = document.createElement('div');
            wordCard.className = 'word-card';
            
            wordCard.innerHTML = `
                <div class="word-foreign">${item.word}</div>
                <div class="word-translation">${item.translation}</div>
                <div class="word-actions">
                    <button class="play-audio" data-word="${item.word}"><i class="fas fa-volume-up"></i></button>
                    <button class="add-to-revision"><i class="fas fa-plus"></i></button>
                </div>
                ${item.example ? `<div class="word-example">${item.example}</div>` : ''}
            `;
            
            // Ajouter l'événement pour la lecture audio
            const audioButton = wordCard.querySelector('.play-audio');
            audioButton.addEventListener('click', function() {
                playWordAudio(item.word, language);
            });
            
            // Ajouter l'événement pour ajouter à la révision
            const revisionButton = wordCard.querySelector('.add-to-revision');
            revisionButton.addEventListener('click', function() {
                addWordToRevision(item, language);
                this.innerHTML = '<i class="fas fa-check"></i>';
                this.disabled = true;
            });
            
            wordList.appendChild(wordCard);
        });
        
        categorySection.appendChild(wordList);
        container.appendChild(categorySection);
    });
    
    // Ajouter les contrôles de filtrage
    addVocabularyFilters(container, Object.keys(categorizedData));
}

/**
 * Formate le nom d'une catégorie pour l'affichage
 * @param {string} category - Le nom de la catégorie
 * @returns {string} - Le nom formaté
 */
function formatCategoryName(category) {
    // Remplacer les tirets par des espaces et mettre en majuscule la première lettre
    return category.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase());
}

/**
 * Ajoute des filtres pour le vocabulaire
 * @param {HTMLElement} container - Le conteneur pour les filtres
 * @param {Array} categories - Les catégories disponibles
 */
function addVocabularyFilters(container, categories) {
    const filtersDiv = document.createElement('div');
    filtersDiv.className = 'vocabulary-filters';
    filtersDiv.innerHTML = '<h3>Filtrer par catégorie:</h3>';
    
    const filterButtons = document.createElement('div');
    filterButtons.className = 'filter-buttons';
    
    // Ajouter un bouton pour toutes les catégories
    const allButton = document.createElement('button');
    allButton.className = 'filter-btn active';
    allButton.textContent = 'Toutes';
    allButton.addEventListener('click', function() {
        // Afficher toutes les catégories
        document.querySelectorAll('.vocabulary-category').forEach(cat => {
            cat.style.display = 'block';
        });
        
        // Mettre à jour les boutons actifs
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        this.classList.add('active');
    });
    
    filterButtons.appendChild(allButton);
    
    // Ajouter un bouton pour chaque catégorie
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'filter-btn';
        button.textContent = formatCategoryName(category);
        button.dataset.category = category;
        
        button.addEventListener('click', function() {
            // Masquer toutes les catégories
            document.querySelectorAll('.vocabulary-category').forEach(cat => {
                cat.style.display = 'none';
            });
            
            // Afficher uniquement la catégorie sélectionnée
            const selectedCategory = this.dataset.category;
            document.querySelectorAll('.vocabulary-category').forEach(cat => {
                if (cat.querySelector('h2').textContent === formatCategoryName(selectedCategory)) {
                    cat.style.display = 'block';
                }
            });
            
            // Mettre à jour les boutons actifs
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        });
        
        filterButtons.appendChild(button);
    });
    
    filtersDiv.appendChild(filterButtons);
    
    // Ajouter les filtres au début du conteneur
    container.insertBefore(filtersDiv, container.firstChild);
}

/**
 * Joue l'audio d'un mot
 * @param {string} word - Le mot à prononcer
 * @param {string} language - La langue (russian ou armenian)
 */
function playWordAudio(word, language) {
    const audioPath = `../audio/${language}/vocabulary/${encodeURIComponent(word.toLowerCase())}.mp3`;
    
    // Créer un élément audio temporaire
    const audio = new Audio(audioPath);
    
    // Jouer l'audio
    audio.play().catch(error => {
        console.error(`Impossible de jouer l'audio pour le mot ${word}:`, error);
    });
}

/**
 * Ajoute un mot au système de révision espacée
 * @param {Object} wordData - Les données du mot
 * @param {string} language - La langue (russian ou armenian)
 */
function addWordToRevision(wordData, language) {
    // Vérifier si la fonction de révision espacée est disponible
    if (typeof addCardToRevision === 'function') {
        const audioPath = `../audio/${language}/vocabulary/${encodeURIComponent(wordData.word.toLowerCase())}.mp3`;
        addCardToRevision(wordData.word, wordData.translation, audioPath);
    } else {
        console.error('La fonction de révision espacée n\'est pas disponible.');
    }
}

/**
 * Initialise les exercices de vocabulaire
 */
function initVocabularyExercises() {
    const exercisesContainer = document.querySelector('.vocabulary-exercises');
    if (!exercisesContainer) return;
    
    const language = document.body.classList.contains('russian-theme') ? 'russian' : 'armenian';
    
    // Charger les données de vocabulaire
    fetch(`../data/${language}/vocabulary.json`)
        .then(response => response.json())
        .then(data => {
            createVocabularyExercises(data, exercisesContainer, language);
        })
        .catch(error => {
            console.error('Erreur lors du chargement des exercices de vocabulaire:', error);
            exercisesContainer.innerHTML = '<p class="error">Impossible de charger les exercices. Veuillez réessayer plus tard.</p>';
        });
}

/**
 * Crée les exercices de vocabulaire
 * @param {Array} data - Les données de vocabulaire
 * @param {HTMLElement} container - Le conteneur pour les exercices
 * @param {string} language - La langue (russian ou armenian)
 */
function createVocabularyExercises(data, container, language) {
    // Vider le conteneur
    container.innerHTML = '';
    
    // Créer les différents types d'exercices
    createMatchingExercise(data, container, language);
    createTranslationExercise(data, container, language);
    createListeningExercise(data, container, language);
}

/**
 * Crée un exercice d'association mot-traduction
 * @param {Array} data - Les données de vocabulaire
 * @param {HTMLElement} container - Le conteneur pour l'exercice
 * @param {string} language - La langue (russian ou armenian)
 */
function createMatchingExercise(data, container, language) {
    const exerciseDiv = document.createElement('div');
    exerciseDiv.className = 'exercise-section matching-exercise';
    exerciseDiv.innerHTML = `
        <h3>Association mot-traduction</h3>
        <p>Associez chaque mot à sa traduction correcte.</p>
        <div class="exercise-content">
            <div class="matching-game">
                <div class="words-column"></div>
                <div class="translations-column"></div>
            </div>
            <div class="exercise-feedback"></div>
            <button class="btn primary check-matches">Vérifier les associations</button>
            <button class="btn secondary reset-exercise">Réinitialiser</button>
            <button class="btn primary next-exercise" style="display: none;">Nouvel exercice</button>
        </div>
    `;
    
    container.appendChild(exerciseDiv);
    
    // Initialiser l'exercice
    initMatchingExercise(exerciseDiv, data, language);
}

/**
 * Initialise l'exercice d'association mot-traduction
 * @param {HTMLElement} exerciseDiv - Le div de l'exercice
 * @param {Array} data - Les données de vocabulaire
 * @param {string} language - La langue (russian ou armenian)
 */
function initMatchingExercise(exerciseDiv, data, language) {
    // Variables pour suivre l'état de l'exercice
    let selectedWords = [];
    let selectedTranslations = [];
    let currentMatches = {};
    let selectedElement = null;
    
    // Fonction pour générer un nouvel exercice
    function generateExercise() {
        // Réinitialiser les variables
        selectedWords = [];
        selectedTranslations = [];
        currentMatches = {};
        selectedElement = null;
        
        // Sélectionner 5 mots aléatoires
        const shuffledData = [...data].sort(() => Math.random() - 0.5);
        const exerciseData = shuffledData.slice(0, 5);
        
        exerciseData.forEach(item => {
            selectedWords.push({
                id: item.word,
                text: item.word
            });
            
            selectedTranslations.push({
                id: item.word,
                text: item.translation
            });
        });
        
        // Mélanger les traductions
        selectedTranslations.sort(() => Math.random() - 0.5);
        
        // Mettre à jour l'interface
        const wordsColumn = exerciseDiv.querySelector('.words-column');
        const translationsColumn = exerciseDiv.querySelector('.translations-column');
        
        wordsColumn.innerHTML = '';
        translationsColumn.innerHTML = '';
        
        // Créer les éléments de mot
        selectedWords.forEach(word => {
            const wordElement = document.createElement('div');
            wordElement.className = 'matching-item word-item';
            wordElement.textContent = word.text;
            wordElement.dataset.id = word.id;
            
            wordElement.addEventListener('click', function() {
                // Désélectionner l'élément précédent s'il existe
                if (selectedElement) {
                    selectedElement.classList.remove('selected');
                }
                
                // Sélectionner cet élément
                this.classList.add('selected');
                selectedElement = this;
            });
            
            wordsColumn.appendChild(wordElement);
        });
        
        // Créer les éléments de traduction
        selectedTranslations.forEach(translation => {
            const translationElement = document.createElement('div');
            translationElement.className = 'matching-item translation-item';
            translationElement.textContent = translation.text;
            translationElement.dataset.id = translation.id;
            
            translationElement.addEventListener('click', function() {
                // Si un mot est sélectionné, créer une association
                if (selectedElement && selectedElement.classList.contains('word-item')) {
                    const selectedWordId = selectedElement.dataset.id;
                    const translationId = this.dataset.id;
                    
                    // Supprimer l'association précédente si elle existe
                    Object.keys(currentMatches).forEach(key => {
                        if (currentMatches[key] === translationId) {
                            delete currentMatches[key];
                        }
                    });
                    
                    // Créer la nouvelle association
                    currentMatches[selectedWordId] = translationId;
                    
                    // Mettre à jour l'interface
                    updateMatchesDisplay();
                    
                    // Désélectionner le mot
                    selectedElement.classList.remove('selected');
                    selectedElement = null;
                }
            });
            
            translationsColumn.appendChild(translationElement);
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
        
        // Réinitialiser les classes des éléments
        exerciseDiv.querySelectorAll('.matching-item').forEach(item => {
            item.classList.remove('matched');
        });
        
        // Mettre en évidence les éléments associés
        Object.keys(currentMatches).forEach(wordId => {
            const translationId = currentMatches[wordId];
            
            // Trouver les éléments correspondants
            const wordElement = exerciseDiv.querySelector(`.word-item[data-id="${wordId}"]`);
            const translationElement = exerciseDiv.querySelector(`.translation-item[data-id="${translationId}"]`);
            
            if (wordElement && translationElement) {
                wordElement.classList.add('matched');
                translationElement.classList.add('matched');
            }
        });
    }
    
    // Initialiser le premier exercice
    generateExercise();
    
    // Gérer le bouton de vérification
    exerciseDiv.querySelector('.check-matches').addEventListener('click', function() {
        // Vérifier les associations
        let correctCount = 0;
        
        Object.keys(currentMatches).forEach(wordId => {
            const translationId = currentMatches[wordId];
            if (wordId === translationId) {
                correctCount++;
            }
        });
        
        // Afficher le feedback
        const feedback = exerciseDiv.querySelector('.exercise-feedback');
        const totalMatches = selectedWords.length;
        
        if (correctCount === totalMatches) {
            feedback.innerHTML = '<p class="correct"><i class="fas fa-check"></i> Parfait ! Toutes les associations sont correctes.</p>';
        } else {
            feedback.innerHTML = `<p class="partial"><i class="fas fa-info-circle"></i> ${correctCount} sur ${totalMatches} associations correctes.</p>`;
        }
        
        // Mettre en évidence les associations correctes et incorrectes
        Object.keys(currentMatches).forEach(wordId => {
            const translationId = currentMatches[wordId];
            
            // Trouver les éléments correspondants
            const wordElement = exerciseDiv.querySelector(`.word-item[data-id="${wordId}"]`);
            const translationElement = exerciseDiv.querySelector(`.translation-item[data-id="${translationId}"]`);
            
            if (wordElement && translationElement) {
                if (wordId === translationId) {
                    wordElement.classList.add('correct-match');
                    translationElement.classList.add('correct-match');
                } else {
                    wordElement.classList.add('incorrect-match');
                    translationElement.classList.add('incorrect-match');
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
        updateMatchesDisplay();
        
        // Réinitialiser le feedback
        exerciseDiv.querySelector('.exercise-feedback').innerHTML = '';
        
        // Désélectionner l'élément sélectionné
        if (selectedElement) {
            selectedElement.classList.remove('selected');
            selectedElement = null;
        }
    });
    
    // Gérer le bouton pour passer à l'exercice suivant
    exerciseDiv.querySelector('.next-exercise').addEventListener('click', function() {
        generateExercise();
    });
}

/**
 * Crée un exercice de traduction
 * @param {Array} data - Les données de vocabulaire
 * @param {HTMLElement} container - Le conteneur pour l'exercice
 * @param {string} language - La langue (russian ou armenian)
 */
function createTranslationExercise(data, container, language) {
    const exerciseDiv = document.createElement('div');
    exerciseDiv.className = 'exercise-section translation-exercise';
    exerciseDiv.innerHTML = `
        <h3>Exercice de traduction</h3>
        <p>Traduisez le mot affiché.</p>
        <div class="exercise-content">
            <div class="exercise-prompt">
                <div class="word-to-translate"></div>
                <button class="play-audio-btn"><i class="fas fa-volume-up"></i></button>
            </div>
            <div class="translation-input">
                <input type="text" class="translation-field" placeholder="Votre traduction...">
                <button class="check-btn">Vérifier</button>
            </div>
            <div class="exercise-feedback"></div>
            <button class="btn primary next-exercise" style="display: none;">Exercice suivant</button>
        </div>
    `;
    
    container.appendChild(exerciseDiv);
    
    // Initialiser l'exercice
    initTranslationExercise(exerciseDiv, data, language);
}

/**
 * Initialise l'exercice de traduction
 * @param {HTMLElement} exerciseDiv - Le div de l'exercice
 * @param {Array} data - Les données de vocabulaire
 * @param {string} language - La langue (russian ou armenian)
 */
function initTranslationExercise(exerciseDiv, data, language) {
    // Variable pour suivre l'état de l'exercice
    let currentWord = null;
    
    // Fonction pour générer un nouvel exercice
    function generateExercise() {
        // Sélectionner un mot aléatoire
        const randomIndex = Math.floor(Math.random() * data.length);
        currentWord = data[randomIndex];
        
        // Mettre à jour l'interface
        const wordElement = exerciseDiv.querySelector('.word-to-translate');
        wordElement.textContent = currentWord.word;
        
        // Réinitialiser l'input
        const input = exerciseDiv.querySelector('.translation-field');
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
    
    // Gérer le bouton de lecture audio
    exerciseDiv.querySelector('.play-audio-btn').addEventListener('click', function() {
        if (currentWord) {
            playWordAudio(currentWord.word, language);
        }
    });
    
    // Gérer le bouton de vérification
    exerciseDiv.querySelector('.check-btn').addEventListener('click', function() {
        const input = exerciseDiv.querySelector('.translation-field');
        const userAnswer = input.value.trim().toLowerCase();
        const correctAnswer = currentWord.translation.toLowerCase();
        
        // Vérifier la réponse
        const isCorrect = userAnswer === correctAnswer;
        
        // Désactiver l'input et le bouton
        input.disabled = true;
        this.disabled = true;
        
        // Afficher le feedback
        const feedback = exerciseDiv.querySelector('.exercise-feedback');
        feedback.innerHTML = isCorrect 
            ? '<p class="correct"><i class="fas fa-check"></i> Correct !</p>'
            : `<p class="incorrect"><i class="fas fa-times"></i> Incorrect. La bonne réponse est : ${currentWord.translation}</p>`;
        
        // Mettre en évidence l'input
        input.classList.add(isCorrect ? 'correct-answer' : 'incorrect-answer');
        
        // Afficher le bouton pour passer à l'exercice suivant
        exerciseDiv.querySelector('.next-exercise').style.display = 'block';
    });
    
    // Gérer la touche Entrée dans l'input
    exerciseDiv.querySelector('.translation-field').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            exerciseDiv.querySelector('.check-btn').click();
        }
    });
    
    // Gérer le bouton pour passer à l'exercice suivant
    exerciseDiv.querySelector('.next-exercise').addEventListener('click', function() {
        // Réinitialiser les classes de l'input
        exerciseDiv.querySelector('.translation-field').classList.remove('correct-answer', 'incorrect-answer');
        
        // Générer un nouvel exercice
        generateExercise();
    });
}

/**
 * Crée un exercice d'écoute et de compréhension
 * @param {Array} data - Les données de vocabulaire
 * @param {HTMLElement} container - Le conteneur pour l'exercice
 * @param {string} language - La langue (russian ou armenian)
 */
function createListeningExercise(data, container, language) {
    const exerciseDiv = document.createElement('div');
    exerciseDiv.className = 'exercise-section listening-exercise';
    exerciseDiv.innerHTML = `
        <h3>Exercice d'écoute</h3>
        <p>Écoutez le mot et sélectionnez la bonne traduction.</p>
        <div class="exercise-content">
            <div class="exercise-prompt">
                <button class="play-word-btn"><i class="fas fa-volume-up"></i> Écouter le mot</button>
            </div>
            <div class="translation-options"></div>
            <div class="exercise-feedback"></div>
            <button class="btn primary next-exercise" style="display: none;">Exercice suivant</button>
        </div>
    `;
    
    container.appendChild(exerciseDiv);
    
    // Initialiser l'exercice
    initListeningExercise(exerciseDiv, data, language);
}

/**
 * Initialise l'exercice d'écoute
 * @param {HTMLElement} exerciseDiv - Le div de l'exercice
 * @param {Array} data - Les données de vocabulaire
 * @param {string} language - La langue (russian ou armenian)
 */
function initListeningExercise(exerciseDiv, data, language) {
    // Variable pour suivre l'état de l'exercice
    let currentWord = null;
    let options = [];
    
    // Fonction pour générer un nouvel exercice
    function generateExercise() {
        // Sélectionner un mot aléatoire
        const randomIndex = Math.floor(Math.random() * data.length);
        currentWord = data[randomIndex];
        
        // Générer des options (la bonne réponse et des distracteurs)
        options = [currentWord.translation];
        
        // Ajouter des distracteurs
        while (options.length < 4) {
            const randomDistractor = data[Math.floor(Math.random() * data.length)].translation;
            if (!options.includes(randomDistractor)) {
                options.push(randomDistractor);
            }
        }
        
        // Mélanger les options
        options.sort(() => Math.random() - 0.5);
        
        // Mettre à jour l'interface
        const optionsContainer = exerciseDiv.querySelector('.translation-options');
        optionsContainer.innerHTML = '';
        
        options.forEach(option => {
            const optionButton = document.createElement('button');
            optionButton.className = 'translation-option';
            optionButton.textContent = option;
            
            optionButton.addEventListener('click', function() {
                // Vérifier la réponse
                const isCorrect = option === currentWord.translation;
                
                // Désactiver toutes les options
                exerciseDiv.querySelectorAll('.translation-option').forEach(btn => {
                    btn.disabled = true;
                });
                
                // Mettre en évidence la bonne réponse et la réponse de l'utilisateur
                exerciseDiv.querySelectorAll('.translation-option').forEach(btn => {
                    if (btn.textContent === currentWord.translation) {
                        btn.classList.add('correct-answer');
                    } else if (btn.textContent === option && !isCorrect) {
                        btn.classList.add('incorrect-answer');
                    }
                });
                
                // Afficher le feedback
                const feedback = exerciseDiv.querySelector('.exercise-feedback');
                feedback.innerHTML = isCorrect 
                    ? '<p class="correct"><i class="fas fa-check"></i> Correct !</p>'
                    : `<p class
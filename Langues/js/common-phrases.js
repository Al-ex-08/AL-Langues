/**
 * LinguaStart - Application d'apprentissage des langues russe et arménienne
 * Script pour les fonctionnalités spécifiques aux phrases courantes
 */

document.addEventListener('DOMContentLoaded', function() {
    initCommonPhrases();
    initPhrasesExercises();
});

/**
 * Initialise l'affichage des phrases courantes
 */
function initCommonPhrases() {
    const phrasesContainer = document.querySelector('.phrases-container');
    if (!phrasesContainer) return;

    const language = document.body.classList.contains('russian-theme') ? 'russian' : 'armenian';
    
    // Charger les données des phrases courantes
    fetch(`../data/${language}/common_phrases.json`)
        .then(response => response.json())
        .then(data => {
            createPhrasesList(data, phrasesContainer, language);
        })
        .catch(error => {
            console.error('Erreur lors du chargement des phrases courantes:', error);
            phrasesContainer.innerHTML = '<p class="error">Impossible de charger les phrases. Veuillez réessayer plus tard.</p>';
        });
}

/**
 * Crée la liste des phrases courantes à partir des données
 * @param {Array} data - Les données des phrases
 * @param {HTMLElement} container - Le conteneur pour la liste
 * @param {string} language - La langue (russian ou armenian)
 */
function createPhrasesList(data, container, language) {
    // Vider le conteneur si nécessaire
    if (container.querySelector('.phrase-card')) {
        return; // Les phrases sont déjà affichées
    }
    
    // Regrouper par catégorie si les données contiennent une propriété category
    const hasCategories = data.some(item => item.category);
    
    if (hasCategories) {
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
            categorySection.className = 'phrases-category';
            
            // Titre de la catégorie
            const categoryTitle = document.createElement('h3');
            categoryTitle.textContent = formatCategoryName(category);
            categorySection.appendChild(categoryTitle);
            
            // Créer la liste de phrases
            const phrasesList = document.createElement('div');
            phrasesList.className = 'phrases-list';
            
            categoryItems.forEach(item => {
                const phraseCard = createPhraseCard(item, language);
                phrasesList.appendChild(phraseCard);
            });
            
            categorySection.appendChild(phrasesList);
            container.appendChild(categorySection);
        });
    } else {
        // Pas de catégories, afficher toutes les phrases
        data.forEach(item => {
            const phraseCard = createPhraseCard(item, language);
            container.appendChild(phraseCard);
        });
    }
    
    // Ajouter les contrôles de filtrage si nécessaire
    if (hasCategories) {
        const categories = [...new Set(data.map(item => item.category))];
        addPhrasesFilters(container, categories);
    }
}

/**
 * Crée une carte pour une phrase
 * @param {Object} item - Les données de la phrase
 * @param {string} language - La langue (russian ou armenian)
 * @returns {HTMLElement} - L'élément de carte créé
 */
function createPhraseCard(item, language) {
    const phraseCard = document.createElement('div');
    phraseCard.className = 'phrase-card';
    
    // Déterminer la prononciation (si disponible)
    const pronunciation = item.pronunciation || '';
    
    phraseCard.innerHTML = `
        <div class="phrase-foreign">${item.front}</div>
        ${pronunciation ? `<div class="phrase-pronunciation">${pronunciation}</div>` : ''}
        <div class="phrase-translation">${item.back}</div>
        <div class="phrase-actions">
            <button class="play-audio" data-audio="${getAudioFilename(item.audio)}"><i class="fas fa-volume-up"></i></button>
            <button class="add-to-revision"><i class="fas fa-plus"></i></button>
        </div>
        ${item.example ? `<div class="phrase-example">${item.example}</div>` : ''}
    `;
    
    // Ajouter l'événement pour la lecture audio
    const audioButton = phraseCard.querySelector('.play-audio');
    audioButton.addEventListener('click', function() {
        playPhraseAudio(item.front, language, this.dataset.audio);
    });
    
    // Ajouter l'événement pour ajouter à la révision
    const revisionButton = phraseCard.querySelector('.add-to-revision');
    revisionButton.addEventListener('click', function() {
        addPhraseToRevision(item, language);
        this.innerHTML = '<i class="fas fa-check"></i>';
        this.disabled = true;
    });
    
    return phraseCard;
}

/**
 * Extrait le nom du fichier audio à partir du chemin complet
 * @param {string} audioPath - Le chemin complet du fichier audio
 * @returns {string} - Le nom du fichier sans extension
 */
function getAudioFilename(audioPath) {
    if (!audioPath) return '';
    
    // Extraire le nom du fichier du chemin
    const parts = audioPath.split('/');
    const filename = parts[parts.length - 1];
    
    // Supprimer l'extension
    return filename.replace('.mp3', '');
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
 * Ajoute des filtres pour les phrases
 * @param {HTMLElement} container - Le conteneur pour les filtres
 * @param {Array} categories - Les catégories disponibles
 */
function addPhrasesFilters(container, categories) {
    const filtersDiv = document.createElement('div');
    filtersDiv.className = 'phrases-filters';
    filtersDiv.innerHTML = '<h3>Filtrer par catégorie:</h3>';
    
    const filterButtons = document.createElement('div');
    filterButtons.className = 'filter-buttons';
    
    // Ajouter un bouton pour toutes les catégories
    const allButton = document.createElement('button');
    allButton.className = 'filter-btn active';
    allButton.textContent = 'Toutes';
    allButton.addEventListener('click', function() {
        // Afficher toutes les catégories
        document.querySelectorAll('.phrases-category').forEach(cat => {
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
            document.querySelectorAll('.phrases-category').forEach(cat => {
                cat.style.display = 'none';
            });
            
            // Afficher uniquement la catégorie sélectionnée
            const selectedCategory = this.dataset.category;
            document.querySelectorAll('.phrases-category').forEach(cat => {
                if (cat.querySelector('h3').textContent === formatCategoryName(selectedCategory)) {
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
 * Joue l'audio d'une phrase
 * @param {string} phrase - La phrase à prononcer
 * @param {string} language - La langue (russian ou armenian)
 * @param {string} audioFilename - Le nom du fichier audio sans extension
 */
function playPhraseAudio(phrase, language, audioFilename) {
    if (!audioFilename) return;
    
    const audioPath = `../audio/${language}/phrases/${audioFilename}.mp3`;
    
    // Créer un élément audio temporaire
    const audio = new Audio(audioPath);
    
    // Jouer l'audio
    audio.play().catch(error => {
        console.error(`Impossible de jouer l'audio pour la phrase "${phrase}":`, error);
    });
}

/**
 * Ajoute une phrase au système de révision espacée
 * @param {Object} phraseData - Les données de la phrase
 * @param {string} language - La langue (russian ou armenian)
 */
function addPhraseToRevision(phraseData, language) {
    // Vérifier si la fonction de révision espacée est disponible
    if (typeof addCardToRevision === 'function') {
        const audioPath = phraseData.audio || `../audio/${language}/phrases/${getAudioFilename(phraseData.front.toLowerCase())}.mp3`;
        addCardToRevision(phraseData.front, phraseData.back, audioPath);
    } else {
        console.error('La fonction de révision espacée n\'est pas disponible.');
    }
}

/**
 * Initialise les exercices de phrases courantes
 */
function initPhrasesExercises() {
    const exercisesContainer = document.querySelector('.phrases-exercises');
    if (!exercisesContainer) return;
    
    const language = document.body.classList.contains('russian-theme') ? 'russian' : 'armenian';
    
    // Charger les données des phrases
    fetch(`../data/${language}/common_phrases.json`)
        .then(response => response.json())
        .then(data => {
            createPhrasesExercises(data, exercisesContainer, language);
        })
        .catch(error => {
            console.error('Erreur lors du chargement des exercices de phrases:', error);
            exercisesContainer.innerHTML = '<p class="error">Impossible de charger les exercices. Veuillez réessayer plus tard.</p>';
        });
}

/**
 * Crée les exercices de phrases courantes
 * @param {Array} data - Les données des phrases
 * @param {HTMLElement} container - Le conteneur pour les exercices
 * @param {string} language - La langue (russian ou armenian)
 */
function createPhrasesExercises(data, container, language) {
    // Vider le conteneur
    container.innerHTML = '';
    
    // Créer les différents types d'exercices
    createPhraseMatchingExercise(data, container, language);
    createPhraseTranslationExercise(data, container, language);
    createPhraseListeningExercise(data, container, language);
}

/**
 * Crée un exercice d'association phrase-traduction
 * @param {Array} data - Les données des phrases
 * @param {HTMLElement} container - Le conteneur pour l'exercice
 * @param {string} language - La langue (russian ou armenian)
 */
function createPhraseMatchingExercise(data, container, language) {
    const exerciseDiv = document.createElement('div');
    exerciseDiv.className = 'exercise-section matching-exercise';
    exerciseDiv.innerHTML = `
        <h3>Association phrase-traduction</h3>
        <p>Associez chaque phrase à sa traduction correcte.</p>
        <div class="exercise-content">
            <div class="matching-game">
                <div class="phrases-column"></div>
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
    initPhraseListeningExercise(exerciseDiv, data, language);
}

/**
 * Initialise l'exercice d'écoute de phrases
 * @param {HTMLElement} exerciseDiv - Le div de l'exercice
 * @param {Array} data - Les données des phrases
 * @param {string} language - La langue (russian ou armenian)
 */
function initPhraseListeningExercise(exerciseDiv, data, language) {
    let currentPhraseIndex = 0;
    let exerciseData = [];
    
    // Fonction pour générer un nouvel exercice
    function generateExercise() {
        // Sélectionner 5 phrases aléatoires
        const shuffledData = [...data].sort(() => Math.random() - 0.5);
        exerciseData = shuffledData.slice(0, 5);
        currentPhraseIndex = 0;
        
        // Afficher la première phrase
        showPhrase(currentPhraseIndex);
    }
    
    // Fonction pour afficher une phrase
    function showPhrase(index) {
        const currentPhrase = exerciseData[index];
        const optionsContainer = exerciseDiv.querySelector('.listening-options');
        const audioBtn = exerciseDiv.querySelector('.play-audio-btn');
        const feedback = exerciseDiv.querySelector('.exercise-feedback');
        
        // Réinitialiser le feedback
        feedback.innerHTML = '';
        
        // Configurer le bouton audio
        audioBtn.onclick = function() {
            playPhraseAudio(currentPhrase.front, language, getAudioFilename(currentPhrase.audio));
        };
        
        // Créer les options (la bonne traduction et 3 distracteurs)
        optionsContainer.innerHTML = '';
        
        // Sélectionner des distracteurs
        const distractors = getTranslationDistractors(data, currentPhrase);
        const options = [currentPhrase.back, ...distractors.slice(0, 3)];
        
        // Mélanger les options
        shuffleArray(options);
        
        // Créer les boutons d'options
        options.forEach(option => {
            const optionBtn = document.createElement('button');
            optionBtn.className = 'listening-option';
            optionBtn.textContent = option;
            
            optionBtn.addEventListener('click', function() {
                // Vérifier si la réponse est correcte
                const isCorrect = option === currentPhrase.back;
                
                // Désactiver tous les boutons d'options
                optionsContainer.querySelectorAll('.listening-option').forEach(btn => {
                    btn.disabled = true;
                    
                    if (btn.textContent === currentPhrase.back) {
                        btn.classList.add('correct-option');
                    } else if (btn === this && !isCorrect) {
                        btn.classList.add('incorrect-option');
                    }
                });
                
                // Afficher le feedback
                if (isCorrect) {
                    feedback.innerHTML = '<p class="correct"><i class="fas fa-check"></i> Correct !</p>';
                } else {
                    feedback.innerHTML = `<p class="incorrect"><i class="fas fa-times"></i> Incorrect. La traduction correcte est : "${currentPhrase.back}"</p>`;
                }
                
                // Afficher le bouton pour passer à la phrase suivante
                const nextBtn = exerciseDiv.querySelector('.next-listening');
                nextBtn.style.display = 'block';
                
                // Si c'est la dernière phrase, changer le texte du bouton
                if (currentPhraseIndex >= exerciseData.length - 1) {
                    nextBtn.textContent = 'Terminer l\'exercice';
                } else {
                    nextBtn.textContent = 'Phrase suivante';
                }
            });
            
            optionsContainer.appendChild(optionBtn);
        });
        
        // Masquer le bouton pour passer à la phrase suivante
        exerciseDiv.querySelector('.next-listening').style.display = 'none';
        
        // Jouer automatiquement l'audio après un court délai
        setTimeout(() => {
            audioBtn.click();
        }, 500);
    }
    
    // Gérer le bouton pour passer à la phrase suivante
    exerciseDiv.querySelector('.next-listening').addEventListener('click', function() {
        currentPhraseIndex++;
        
        if (currentPhraseIndex < exerciseData.length) {
            // Afficher la phrase suivante
            showPhrase(currentPhraseIndex);
        } else {
            // Fin de l'exercice, recommencer
            generateExercise();
        }
    });
    
    // Initialiser le premier exercice
    generateExercise();
}

/**
 * Obtient des traductions distractrices pour les options d'écoute
 * @param {Array} data - Toutes les données de phrases
 * @param {Object} currentPhrase - La phrase actuelle
 * @returns {Array} - Un tableau de traductions distractrices
 */
function getTranslationDistractors(data, currentPhrase) {
    // Filtrer les phrases pour exclure la phrase actuelle
    const otherPhrases = data.filter(item => item.front !== currentPhrase.front);
    
    // Mélanger les phrases restantes
    const shuffledPhrases = [...otherPhrases].sort(() => Math.random() - 0.5);
    
    // Retourner les traductions des phrases mélangées
    return shuffledPhrases.map(item => item.back);
}

/**
 * Mélange aléatoirement un tableau
 * @param {Array} array - Le tableau à mélanger
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
    
    // Initialiser l'exercice
    initPhraseMatchingExercise(exerciseDiv, data, language);
}

/**
 * Initialise l'exercice d'association phrase-traduction
 * @param {HTMLElement} exerciseDiv - Le div de l'exercice
 * @param {Array} data - Les données des phrases
 * @param {string} language - La langue (russian ou armenian)
 */
function initPhraseMatchingExercise(exerciseDiv, data, language) {
    // Variables pour suivre l'état de l'exercice
    let selectedPhrases = [];
    let selectedTranslations = [];
    let currentMatches = {};
    let selectedElement = null;
    
    // Fonction pour générer un nouvel exercice
    function generateExercise() {
        // Réinitialiser les variables
        selectedPhrases = [];
        selectedTranslations = [];
        currentMatches = {};
        selectedElement = null;
        
        // Sélectionner 5 phrases aléatoires
        const shuffledData = [...data].sort(() => Math.random() - 0.5);
        const exerciseData = shuffledData.slice(0, 5);
        
        exerciseData.forEach(item => {
            selectedPhrases.push({
                id: item.front,
                text: item.front
            });
            
            selectedTranslations.push({
                id: item.front,
                text: item.back
            });
        });
        
        // Mélanger les traductions
        selectedTranslations.sort(() => Math.random() - 0.5);
        
        // Mettre à jour l'interface
        const phrasesColumn = exerciseDiv.querySelector('.phrases-column');
        const translationsColumn = exerciseDiv.querySelector('.translations-column');
        
        phrasesColumn.innerHTML = '';
        translationsColumn.innerHTML = '';
        
        // Créer les éléments de phrase
        selectedPhrases.forEach(phrase => {
            const phraseElement = document.createElement('div');
            phraseElement.className = 'matching-item phrase-item';
            phraseElement.textContent = phrase.text;
            phraseElement.dataset.id = phrase.id;
            
            phraseElement.addEventListener('click', function() {
                // Désélectionner l'élément précédent s'il existe
                if (selectedElement) {
                    selectedElement.classList.remove('selected');
                }
                
                // Sélectionner cet élément
                this.classList.add('selected');
                selectedElement = this;
            });
            
            phrasesColumn.appendChild(phraseElement);
        });
        
        // Créer les éléments de traduction
        selectedTranslations.forEach(translation => {
            const translationElement = document.createElement('div');
            translationElement.className = 'matching-item translation-item';
            translationElement.textContent = translation.text;
            translationElement.dataset.id = translation.id;
            
            translationElement.addEventListener('click', function() {
                // Si une phrase est sélectionnée, créer une association
                if (selectedElement && selectedElement.classList.contains('phrase-item')) {
                    const selectedPhraseId = selectedElement.dataset.id;
                    const translationId = this.dataset.id;
                    
                    // Supprimer l'association précédente si elle existe
                    Object.keys(currentMatches).forEach(key => {
                        if (currentMatches[key] === translationId) {
                            delete currentMatches[key];
                        }
                    });
                    
                    // Créer la nouvelle association
                    currentMatches[selectedPhraseId] = translationId;
                    
                    // Mettre à jour l'interface
                    updateMatchesDisplay();
                    
                    // Désélectionner la phrase
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
        Object.keys(currentMatches).forEach(phraseId => {
            const translationId = currentMatches[phraseId];
            
            // Trouver les éléments correspondants
            const phraseElement = exerciseDiv.querySelector(`.phrase-item[data-id="${phraseId}"]`);
            const translationElement = exerciseDiv.querySelector(`.translation-item[data-id="${translationId}"]`);
            
            if (phraseElement && translationElement) {
                phraseElement.classList.add('matched');
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
        
        Object.keys(currentMatches).forEach(phraseId => {
            const translationId = currentMatches[phraseId];
            if (phraseId === translationId) {
                correctCount++;
            }
        });
        
        // Afficher le feedback
        const feedback = exerciseDiv.querySelector('.exercise-feedback');
        const totalMatches = selectedPhrases.length;
        
        if (correctCount === totalMatches) {
            feedback.innerHTML = '<p class="correct"><i class="fas fa-check"></i> Parfait ! Toutes les associations sont correctes.</p>';
        } else {
            feedback.innerHTML = `<p class="partial"><i class="fas fa-info-circle"></i> ${correctCount} sur ${totalMatches} associations correctes.</p>`;
        }
        
        // Mettre en évidence les associations correctes et incorrectes
        Object.keys(currentMatches).forEach(phraseId => {
            const translationId = currentMatches[phraseId];
            
            // Trouver les éléments correspondants
            const phraseElement = exerciseDiv.querySelector(`.phrase-item[data-id="${phraseId}"]`);
            const translationElement = exerciseDiv.querySelector(`.translation-item[data-id="${translationId}"]`);
            
            if (phraseElement && translationElement) {
                if (phraseId === translationId) {
                    phraseElement.classList.add('correct-match');
                    translationElement.classList.add('correct-match');
                } else {
                    phraseElement.classList.add('incorrect-match');
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
 * Crée un exercice de traduction de phrases
 * @param {Array} data - Les données des phrases
 * @param {HTMLElement} container - Le conteneur pour l'exercice
 * @param {string} language - La langue (russian ou armenian)
 */
function createPhraseTranslationExercise(data, container, language) {
    const exerciseDiv = document.createElement('div');
    exerciseDiv.className = 'exercise-section translation-exercise';
    exerciseDiv.innerHTML = `
        <h3>Exercice de traduction</h3>
        <p>Traduisez la phrase affichée.</p>
        <div class="exercise-content">
            <div class="exercise-prompt">
                <div class="phrase-to-translate"></div>
                <button class="play-audio-btn"><i class="fas fa-volume-up"></i></button>
            </div>
            <div class="translation-input">
                <input type="text" placeholder="Votre traduction..." class="translation-field">
                <button class="btn primary check-translation">Vérifier</button>
            </div>
            <div class="exercise-feedback"></div>
            <button class="btn primary next-translation" style="display: none;">Phrase suivante</button>
        </div>
    `;
    
    container.appendChild(exerciseDiv);
    
    // Initialiser l'exercice
    initPhraseListeningExercise(exerciseDiv, data, language);
}

/**
 * Initialise l'exercice d'écoute de phrases
 * @param {HTMLElement} exerciseDiv - Le div de l'exercice
 * @param {Array} data - Les données des phrases
 * @param {string} language - La langue (russian ou armenian)
 */
function initPhraseListeningExercise(exerciseDiv, data, language) {
    let currentPhraseIndex = 0;
    let exerciseData = [];
    
    // Fonction pour générer un nouvel exercice
    function generateExercise() {
        // Sélectionner 5 phrases aléatoires
        const shuffledData = [...data].sort(() => Math.random() - 0.5);
        exerciseData = shuffledData.slice(0, 5);
        currentPhraseIndex = 0;
        
        // Afficher la première phrase
        showPhrase(currentPhraseIndex);
    }
    
    // Fonction pour afficher une phrase
    function showPhrase(index) {
        const currentPhrase = exerciseData[index];
        const optionsContainer = exerciseDiv.querySelector('.listening-options');
        const audioBtn = exerciseDiv.querySelector('.play-audio-btn');
        const feedback = exerciseDiv.querySelector('.exercise-feedback');
        
        // Réinitialiser le feedback
        feedback.innerHTML = '';
        
        // Configurer le bouton audio
        audioBtn.onclick = function() {
            playPhraseAudio(currentPhrase.front, language, getAudioFilename(currentPhrase.audio));
        };
        
        // Créer les options (la bonne traduction et 3 distracteurs)
        optionsContainer.innerHTML = '';
        
        // Sélectionner des distracteurs
        const distractors = getTranslationDistractors(data, currentPhrase);
        const options = [currentPhrase.back, ...distractors.slice(0, 3)];
        
        // Mélanger les options
        shuffleArray(options);
        
        // Créer les boutons d'options
        options.forEach(option => {
            const optionBtn = document.createElement('button');
            optionBtn.className = 'listening-option';
            optionBtn.textContent = option;
            
            optionBtn.addEventListener('click', function() {
                // Vérifier si la réponse est correcte
                const isCorrect = option === currentPhrase.back;
                
                // Désactiver tous les boutons d'options
                optionsContainer.querySelectorAll('.listening-option').forEach(btn => {
                    btn.disabled = true;
                    
                    if (btn.textContent === currentPhrase.back) {
                        btn.classList.add('correct-option');
                    } else if (btn === this && !isCorrect) {
                        btn.classList.add('incorrect-option');
                    }
                });
                
                // Afficher le feedback
                if (isCorrect) {
                    feedback.innerHTML = '<p class="correct"><i class="fas fa-check"></i> Correct !</p>';
                } else {
                    feedback.innerHTML = `<p class="incorrect"><i class="fas fa-times"></i> Incorrect. La traduction correcte est : "${currentPhrase.back}"</p>`;
                }
                
                // Afficher le bouton pour passer à la phrase suivante
                const nextBtn = exerciseDiv.querySelector('.next-listening');
                nextBtn.style.display = 'block';
                
                // Si c'est la dernière phrase, changer le texte du bouton
                if (currentPhraseIndex >= exerciseData.length - 1) {
                    nextBtn.textContent = 'Terminer l\'exercice';
                } else {
                    nextBtn.textContent = 'Phrase suivante';
                }
            });
            
            optionsContainer.appendChild(optionBtn);
        });
        
        // Masquer le bouton pour passer à la phrase suivante
        exerciseDiv.querySelector('.next-listening').style.display = 'none';
        
        // Jouer automatiquement l'audio après un court délai
        setTimeout(() => {
            audioBtn.click();
        }, 500);
    }
    
    // Gérer le bouton pour passer à la phrase suivante
    exerciseDiv.querySelector('.next-listening').addEventListener('click', function() {
        currentPhraseIndex++;
        
        if (currentPhraseIndex < exerciseData.length) {
            // Afficher la phrase suivante
            showPhrase(currentPhraseIndex);
        } else {
            // Fin de l'exercice, recommencer
            generateExercise();
        }
    });
    
    // Initialiser le premier exercice
    generateExercise();
}

/**
 * Obtient des traductions distractrices pour les options d'écoute
 * @param {Array} data - Toutes les données de phrases
 * @param {Object} currentPhrase - La phrase actuelle
 * @returns {Array} - Un tableau de traductions distractrices
 */
function getTranslationDistractors(data, currentPhrase) {
    // Filtrer les phrases pour exclure la phrase actuelle
    const otherPhrases = data.filter(item => item.front !== currentPhrase.front);
    
    // Mélanger les phrases restantes
    const shuffledPhrases = [...otherPhrases].sort(() => Math.random() - 0.5);
    
    // Retourner les traductions des phrases mélangées
    return shuffledPhrases.map(item => item.back);
}

/**
 * Mélange aléatoirement un tableau
 * @param {Array} array - Le tableau à mélanger
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
    
    // Initialiser l'exercice
    initPhraseTranslationExercise(exerciseDiv, data, language);
}

/**
 * Initialise l'exercice de traduction de phrases
 * @param {HTMLElement} exerciseDiv - Le div de l'exercice
 * @param {Array} data - Les données des phrases
 * @param {string} language - La langue (russian ou armenian)
 */
function initPhraseTranslationExercise(exerciseDiv, data, language) {
    let currentPhraseIndex = 0;
    let exerciseData = [];
    
    // Fonction pour générer un nouvel exercice
    function generateExercise() {
        // Sélectionner 10 phrases aléatoires
        const shuffledData = [...data].sort(() => Math.random() - 0.5);
        exerciseData = shuffledData.slice(0, 10);
        currentPhraseIndex = 0;
        
        // Afficher la première phrase
        showPhrase(currentPhraseIndex);
    }
    
    // Fonction pour afficher une phrase
    function showPhrase(index) {
        const currentPhrase = exerciseData[index];
        const phraseElement = exerciseDiv.querySelector('.phrase-to-translate');
        const audioBtn = exerciseDiv.querySelector('.play-audio-btn');
        const translationField = exerciseDiv.querySelector('.translation-field');
        const feedback = exerciseDiv.querySelector('.exercise-feedback');
        
        // Afficher la phrase
        phraseElement.textContent = currentPhrase.front;
        
        // Réinitialiser le champ de saisie et le feedback
        translationField.value = '';
        feedback.innerHTML = '';
        
        // Configurer le bouton audio
        audioBtn.onclick = function() {
            playPhraseAudio(currentPhrase.front, language, getAudioFilename(currentPhrase.audio));
        };
        
        // Afficher les boutons appropriés
        exerciseDiv.querySelector('.check-translation').style.display = 'block';
        exerciseDiv.querySelector('.next-translation').style.display = 'none';
        
        // Focus sur le champ de saisie
        translationField.focus();
    }
    
    // Gérer le bouton de vérification
    exerciseDiv.querySelector('.check-translation').addEventListener('click', function() {
        const translationField = exerciseDiv.querySelector('.translation-field');
        const userTranslation = translationField.value.trim().toLowerCase();
        const correctTranslation = exerciseData[currentPhraseIndex].back.toLowerCase();
        const feedback = exerciseDiv.querySelector('.exercise-feedback');
        
        // Vérifier la traduction
        if (userTranslation === correctTranslation) {
            feedback.innerHTML = '<p class="correct"><i class="fas fa-check"></i> Correct !</p>';
            translationField.classList.add('correct-answer');
        } else {
            feedback.innerHTML = `<p class="incorrect"><i class="fas fa-times"></i> Incorrect. La traduction correcte est : "${exerciseData[currentPhraseIndex].back}"</p>`;
            translationField.classList.add('incorrect-answer');
        }
        
        // Masquer le bouton de vérification
        this.style.display = 'none';
        
        // Afficher le bouton pour passer à la phrase suivante
        const nextBtn = exerciseDiv.querySelector('.next-translation');
        nextBtn.style.display = 'block';
        
        // Si c'est la dernière phrase, changer le texte du bouton
        if (currentPhraseIndex >= exerciseData.length - 1) {
            nextBtn.textContent = 'Terminer l\'exercice';
        } else {
            nextBtn.textContent = 'Phrase suivante';
        }
    });
    
    // Gérer le bouton pour passer à la phrase suivante
    exerciseDiv.querySelector('.next-translation').addEventListener('click', function() {
        const translationField = exerciseDiv.querySelector('.translation-field');
        translationField.classList.remove('correct-answer', 'incorrect-answer');
        
        currentPhraseIndex++;
        
        if (currentPhraseIndex < exerciseData.length) {
            // Afficher la phrase suivante
            showPhrase(currentPhraseIndex);
        } else {
            // Fin de l'exercice, recommencer
            generateExercise();
        }
    });
    
    // Initialiser le premier exercice
    generateExercise();
}

/**
 * Crée un exercice d'écoute de phrases
 * @param {Array} data - Les données des phrases
 * @param {HTMLElement} container - Le conteneur pour l'exercice
 * @param {string} language - La langue (russian ou armenian)
 */
function createPhraseListeningExercise(data, container, language) {
    const exerciseDiv = document.createElement('div');
    exerciseDiv.className = 'exercise-section listening-exercise';
    exerciseDiv.innerHTML = `
        <h3>Exercice d'écoute</h3>
        <p>Écoutez la phrase et sélectionnez la traduction correcte.</p>
        <div class="exercise-content">
            <div class="exercise-prompt">
                <button class="play-audio-btn"><i class="fas fa-volume-up"></i> Écouter la phrase</button>
            </div>
            <div class="listening-options"></div>
            <div class="exercise-feedback"></div>
            <button class="btn primary next-listening" style="display: none;">Phrase suivante</button>
        </div>
    `;
    
    container.appendChild(exerciseDiv);
    
    // Initialiser l'exercice
    initPhraseListeningExercise(exerciseDiv, data, language);
}

/**
 * Initialise l'exercice d'écoute de phrases
 * @param {HTMLElement} exerciseDiv - Le div de l'exercice
 * @param {Array} data - Les données des phrases
 * @param {string} language - La langue (russian ou armenian)
 */
function initPhraseListeningExercise(exerciseDiv, data, language) {
    let currentPhraseIndex = 0;
    let exerciseData = [];
    
    // Fonction pour générer un nouvel exercice
    function generateExercise() {
        // Sélectionner 5 phrases aléatoires
        const shuffledData = [...data].sort(() => Math.random() - 0.5);
        exerciseData = shuffledData.slice(0, 5);
        currentPhraseIndex = 0;
        
        // Afficher la première phrase
        showPhrase(currentPhraseIndex);
    }
    
    // Fonction pour afficher une phrase
    function showPhrase(index) {
        const currentPhrase = exerciseData[index];
        const optionsContainer = exerciseDiv.querySelector('.listening-options');
        const audioBtn = exerciseDiv.querySelector('.play-audio-btn');
        const feedback = exerciseDiv.querySelector('.exercise-feedback');
        
        // Réinitialiser le feedback
        feedback.innerHTML = '';
        
        // Configurer le bouton audio
        audioBtn.onclick = function() {
            playPhraseAudio(currentPhrase.front, language, getAudioFilename(currentPhrase.audio));
        };
        
        // Créer les options (la bonne traduction et 3 distracteurs)
        optionsContainer.innerHTML = '';
        
        // Sélectionner des distracteurs
        const distractors = getTranslationDistractors(data, currentPhrase);
        const options = [currentPhrase.back, ...distractors.slice(0, 3)];
        
        // Mélanger les options
        shuffleArray(options);
        
        // Créer les boutons d'options
        options.forEach(option => {
            const optionBtn = document.createElement('button');
            optionBtn.className = 'listening-option';
            optionBtn.textContent = option;
            
            optionBtn.addEventListener('click', function() {
                // Vérifier si la réponse est correcte
                const isCorrect = option === currentPhrase.back;
                
                // Désactiver tous les boutons d'options
                optionsContainer.querySelectorAll('.listening-option').forEach(btn => {
                    btn.disabled = true;
                    
                    if (btn.textContent === currentPhrase.back) {
                        btn.classList.add('correct-option');
                    } else if (btn === this && !isCorrect) {
                        btn.classList.add('incorrect-option');
                    }
                });
                
                // Afficher le feedback
                if (isCorrect) {
                    feedback.innerHTML = '<p class="correct"><i class="fas fa-check"></i> Correct !</p>';
                } else {
                    feedback.innerHTML = `<p class="incorrect"><i class="fas fa-times"></i> Incorrect. La traduction correcte est : "${currentPhrase.back}"</p>`;
                }
                
                // Afficher le bouton pour passer à la phrase suivante
                const nextBtn = exerciseDiv.querySelector('.next-listening');
                nextBtn.style.display = 'block';
                
                // Si c'est la dernière phrase, changer le texte du bouton
                if (currentPhraseIndex >= exerciseData.length - 1) {
                    nextBtn.textContent = 'Terminer l\'exercice';
                } else {
                    nextBtn.textContent = 'Phrase suivante';
                }
            });
            
            optionsContainer.appendChild(optionBtn);
        });
        
        // Masquer le bouton pour passer à la phrase suivante
        exerciseDiv.querySelector('.next-listening').style.display = 'none';
        
        // Jouer automatiquement l'audio après un court délai
        setTimeout(() => {
            audioBtn.click();
        }, 500);
    }
    
    // Gérer le bouton pour passer à la phrase suivante
    exerciseDiv.querySelector('.next-listening').addEventListener('click', function() {
        currentPhraseIndex++;
        
        if (currentPhraseIndex < exerciseData.length) {
            // Afficher la phrase suivante
            showPhrase(currentPhraseIndex);
        } else {
            // Fin de l'exercice, recommencer
            generateExercise();
        }
    });
    
    // Initialiser le premier exercice
    generateExercise();
}

/**
 * Obtient des traductions distractrices pour les options d'écoute
 * @param {Array} data - Toutes les données de phrases
 * @param {Object} currentPhrase - La phrase actuelle
 * @returns {Array} - Un tableau de traductions distractrices
 */
function getTranslationDistractors(data, currentPhrase) {
    // Filtrer les phrases pour exclure la phrase actuelle
    const otherPhrases = data.filter(item => item.front !== currentPhrase.front);
    
    // Mélanger les phrases restantes
    const shuffledPhrases = [...otherPhrases].sort(() => Math.random() - 0.5);
    
    // Retourner les traductions des phrases mélangées
    return shuffledPhrases.map(item => item.back);
}

/**
 * Mélange aléatoirement un tableau
 * @param {Array} array - Le tableau à mélanger
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
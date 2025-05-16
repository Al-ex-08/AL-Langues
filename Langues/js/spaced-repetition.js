/**
 * LinguaStart - Application d'apprentissage des langues russe et arménienne
 * Système de révision espacée pour un apprentissage efficace
 */

let spacedRepetitionData = {
    cards: [],
    nextReview: {}
};

// Initialisation du système de révision espacée
document.addEventListener('DOMContentLoaded', function() {
    initSpacedRepetition();
});

/**
 * Initialise le système de révision espacée
 */
function initSpacedRepetition() {
    // Charger les données sauvegardées si elles existent
    loadSpacedRepetitionData();
    
    // Initialiser les éléments d'interface
    initSpacedRepetitionUI();
    
    // Vérifier s'il y a des cartes à réviser aujourd'hui
    updateRevisionCards();
}

/**
 * Charge les données de révision espacée depuis le stockage local
 */
function loadSpacedRepetitionData() {
    const savedData = localStorage.getItem('linguaStartSpacedRepetition');
    if (savedData) {
        spacedRepetitionData = JSON.parse(savedData);
    }
}

/**
 * Sauvegarde les données de révision espacée dans le stockage local
 */
function saveSpacedRepetitionData() {
    localStorage.setItem('linguaStartSpacedRepetition', JSON.stringify(spacedRepetitionData));
}

/**
 * Initialise l'interface utilisateur pour la révision espacée
 */
function initSpacedRepetitionUI() {
    // Créer les options de révision (durée et niveau)
    const revisionOptionsContainer = document.createElement('div');
    revisionOptionsContainer.className = 'revision-options';
    revisionOptionsContainer.innerHTML = `
        <div class="revision-time-options">
            <h4>Temps de révision disponible</h4>
            <div class="time-buttons">
                <button class="time-btn" data-time="5">5 min</button>
                <button class="time-btn" data-time="10">10 min</button>
                <button class="time-btn" data-time="15">15 min</button>
                <button class="time-btn" data-time="30">30 min</button>
                <button class="time-btn active" data-time="0">Sans limite</button>
            </div>
        </div>
        <div class="revision-level-options">
            <h4>Niveau d'apprentissage</h4>
            <div class="level-buttons">
                <button class="level-btn" data-level="debutant">Débutant</button>
                <button class="level-btn" data-level="intermediaire">Intermédiaire</button>
                <button class="level-btn" data-level="avance">Avancé</button>
                <button class="level-btn active" data-level="tous">Tous niveaux</button>
            </div>
        </div>
    `;
    
    // Insérer les options avant le bouton de démarrage
    const spacedRepetitionCards = document.querySelector('.spaced-repetition-cards');
    if (spacedRepetitionCards) {
        const startRevisionBtn = document.querySelector('.start-revision');
        if (startRevisionBtn) {
            spacedRepetitionCards.insertBefore(revisionOptionsContainer, startRevisionBtn);
            
            // Ajouter les événements pour les boutons de temps
            const timeButtons = document.querySelectorAll('.time-btn');
            timeButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    timeButtons.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                });
            });
            
            // Ajouter les événements pour les boutons de niveau
            const levelButtons = document.querySelectorAll('.level-btn');
            levelButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    levelButtons.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                });
            });
            
            // Modifier l'événement du bouton de démarrage
            startRevisionBtn.addEventListener('click', function() {
                const selectedTime = document.querySelector('.time-btn.active').dataset.time;
                const selectedLevel = document.querySelector('.level-btn.active').dataset.level;
                
                // Convertir le temps en nombre (0 = sans limite)
                const timeInMinutes = parseInt(selectedTime) || null;
                
                startRevision(timeInMinutes, selectedLevel);
            });
        }
    }
    
    // Ajouter des boutons pour ajouter des cartes à la révision
    const flashcards = document.querySelectorAll('.flashcard');
    flashcards.forEach(card => {
        const addToRevisionBtn = document.createElement('button');
        addToRevisionBtn.className = 'add-to-revision';
        addToRevisionBtn.innerHTML = '<i class="fas fa-plus"></i> Ajouter à la révision';
        addToRevisionBtn.addEventListener('click', function() {
            const front = card.querySelector('.front').textContent;
            const back = card.querySelector('.back').textContent;
            const audio = card.querySelector('audio') ? card.querySelector('audio').src : null;
            
            addCardToRevision(front, back, audio);
            addToRevisionBtn.disabled = true;
            addToRevisionBtn.innerHTML = '<i class="fas fa-check"></i> Ajouté à la révision';
        });
        
        card.appendChild(addToRevisionBtn);
    });
}

/**
 * Ajoute une carte au système de révision espacée
 * @param {string} front - Le contenu de la face avant (mot/phrase en langue étrangère)
 * @param {string} back - Le contenu de la face arrière (traduction)
 * @param {string} audio - URL du fichier audio (optionnel)
 */
function addCardToRevision(front, back, audio) {
    // Vérifier si la carte existe déjà
    const existingCardIndex = spacedRepetitionData.cards.findIndex(card => card.front === front);
    
    if (existingCardIndex === -1) {
        // Ajouter une nouvelle carte
        const newCard = {
            id: Date.now().toString(),
            front: front,
            back: back,
            audio: audio,
            level: 0, // Niveau de maîtrise (0-5)
            lastReviewed: new Date().toISOString(),
            nextReview: new Date().toISOString() // Première révision immédiate
        };
        
        spacedRepetitionData.cards.push(newCard);
        spacedRepetitionData.nextReview[newCard.id] = new Date().toISOString();
        
        // Sauvegarder les données
        saveSpacedRepetitionData();
        
        // Mettre à jour l'interface
        updateRevisionCards();
    }
}

/**
 * Met à jour l'affichage des cartes à réviser aujourd'hui
 */
function updateRevisionCards() {
    const revisionCardsContainer = document.querySelector('.revision-cards');
    const startRevisionBtn = document.querySelector('.start-revision');
    const noCardsMessage = document.querySelector('.no-cards-message');
    
    if (!revisionCardsContainer) return;
    
    // Vider le conteneur
    revisionCardsContainer.innerHTML = '';
    
    // Obtenir les cartes à réviser aujourd'hui
    const today = new Date();
    const cardsToReview = spacedRepetitionData.cards.filter(card => {
        const nextReviewDate = new Date(card.nextReview);
        return nextReviewDate <= today;
    });
    
    if (cardsToReview.length > 0) {
        // Afficher le nombre de cartes à réviser
        const countElement = document.createElement('p');
        countElement.className = 'revision-count';
        countElement.textContent = `${cardsToReview.length} carte(s) à réviser aujourd'hui`;
        revisionCardsContainer.appendChild(countElement);
        
        // Activer le bouton de révision
        if (startRevisionBtn) {
            startRevisionBtn.disabled = false;
        }
        
        // Masquer le message "pas de cartes"
        if (noCardsMessage) {
            noCardsMessage.style.display = 'none';
        }
    } else {
        // Afficher un message s'il n'y a pas de cartes à réviser
        if (noCardsMessage) {
            noCardsMessage.style.display = 'block';
        } else {
            const message = document.createElement('p');
            message.className = 'no-cards-message';
            message.textContent = 'Aucune carte à réviser aujourd\'hui. Ajoutez des cartes depuis les modules d\'apprentissage.';
            revisionCardsContainer.appendChild(message);
        }
        
        // Désactiver le bouton de révision
        if (startRevisionBtn) {
            startRevisionBtn.disabled = true;
        }
    }
}

/**
 * Filtre les cartes en fonction du temps disponible et du niveau d'apprentissage
 * @param {Array} cards - Les cartes à filtrer
 * @param {number} timeInMinutes - Le temps disponible en minutes
 * @param {string} levelFilter - Le niveau d'apprentissage ('debutant', 'intermediaire', 'avance' ou 'tous')
 * @returns {Array} - Les cartes filtrées
 */
function filterCardsByTimeAndLevel(cards, timeInMinutes, levelFilter) {
    // Estimer le temps moyen par carte (en secondes)
    const avgTimePerCard = 30; // 30 secondes par carte en moyenne
    const maxCards = timeInMinutes ? Math.floor((timeInMinutes * 60) / avgTimePerCard) : cards.length;
    
    // Filtrer par niveau si nécessaire
    let filteredCards = [...cards];
    
    if (levelFilter !== 'tous') {
        switch(levelFilter) {
            case 'debutant':
                // Niveau 0-1
                filteredCards = filteredCards.filter(card => card.level <= 1);
                break;
            case 'intermediaire':
                // Niveau 2-3
                filteredCards = filteredCards.filter(card => card.level >= 2 && card.level <= 3);
                break;
            case 'avance':
                // Niveau 4-5
                filteredCards = filteredCards.filter(card => card.level >= 4);
                break;
        }
    }
    
    // Si après filtrage par niveau il n'y a pas assez de cartes, on prend des cartes de tous niveaux
    if (filteredCards.length === 0) {
        filteredCards = [...cards];
    }
    
    // Trier les cartes par priorité (niveau de maîtrise bas en premier)
    filteredCards.sort((a, b) => a.level - b.level);
    
    // Limiter le nombre de cartes en fonction du temps disponible
    return filteredCards.slice(0, Math.min(maxCards, filteredCards.length));
}

/**
 * Démarre une session de révision
 * @param {number} timeInMinutes - Le temps disponible en minutes (par défaut: pas de limite)
 * @param {string} levelFilter - Le niveau d'apprentissage (par défaut: 'tous')
 */
function startRevision(timeInMinutes = null, levelFilter = 'tous') {
    // Utiliser le nouveau système de sessions de révision personnalisées
    if (typeof createRevisionSession === 'function') {
        createRevisionSession(timeInMinutes, levelFilter);
        return;
    }
    
    // Fallback vers l'ancienne méthode si le nouveau système n'est pas disponible
    const revisionCardsContainer = document.querySelector('.revision-cards');
    if (!revisionCardsContainer) return;
    
    // Obtenir les cartes à réviser aujourd'hui
    const today = new Date();
    const cardsToReview = spacedRepetitionData.cards.filter(card => {
        const nextReviewDate = new Date(card.nextReview);
        return nextReviewDate <= today;
    });
    
    if (cardsToReview.length === 0) return;
    
    // Filtrer les cartes en fonction du temps et du niveau si spécifiés
    const cardsForSession = timeInMinutes ? 
        filterCardsByTimeAndLevel(cardsToReview, timeInMinutes, levelFilter) : 
        cardsToReview;
    
    if (cardsForSession.length === 0) {
        alert("Aucune carte ne correspond aux critères sélectionnés. Essayez un autre niveau ou une durée plus longue.");
        return;
    }
    
    // Vider le conteneur
    revisionCardsContainer.innerHTML = '';
    
    // Créer l'interface de révision
    const revisionInterface = document.createElement('div');
    revisionInterface.className = 'revision-interface';
    
    // Ajouter des informations sur la session
    const sessionInfo = document.createElement('div');
    sessionInfo.className = 'session-info';
    sessionInfo.innerHTML = `
        <p>
            <strong>Session de révision:</strong> 
            ${timeInMinutes ? `${timeInMinutes} minutes` : 'Sans limite de temps'} | 
            Niveau: ${levelFilter === 'tous' ? 'Tous niveaux' : levelFilter.charAt(0).toUpperCase() + levelFilter.slice(1)} | 
            ${cardsForSession.length} carte(s)
        </p>
    `;
    
    // Ajouter un timer si une limite de temps est définie
    if (timeInMinutes) {
        const timerElement = document.createElement('div');
        timerElement.className = 'session-timer';
        timerElement.textContent = `Temps restant: ${timeInMinutes}:00`;
        sessionInfo.appendChild(timerElement);
    }
    
    revisionInterface.appendChild(sessionInfo);
    
    // Créer la carte de révision
    const revisionCard = document.createElement('div');
    revisionCard.className = 'revision-card';
    revisionCard.innerHTML = `
        <div class="revision-front">${cardsForSession[0].front}</div>
        <div class="revision-back" style="display: none;">${cardsForSession[0].back}</div>
        <div class="revision-controls">
            <button class="show-answer">Afficher la réponse</button>
            <div class="rating-buttons" style="display: none;">
                <p>Comment avez-vous répondu?</p>
                <button class="rating-btn" data-rating="0">Je ne savais pas</button>
                <button class="rating-btn" data-rating="1">Difficile</button>
                <button class="rating-btn" data-rating="2">Correct avec effort</button>
                <button class="rating-btn" data-rating="3">Facile</button>
            </div>
        </div>
    `;
    
    // Ajouter l'audio si disponible
    if (cardsForSession[0].audio) {
        const audioBtn = document.createElement('button');
        audioBtn.className = 'play-audio';
        audioBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        audioBtn.addEventListener('click', function() {
            const audio = new Audio(cardsForSession[0].audio);
            audio.play();
        });
        revisionCard.querySelector('.revision-front').appendChild(audioBtn);
    }
    
    // Ajouter les événements
    revisionCard.querySelector('.show-answer').addEventListener('click', function() {
        revisionCard.querySelector('.revision-back').style.display = 'block';
        this.style.display = 'none';
        revisionCard.querySelector('.rating-buttons').style.display = 'block';
    });
    
    // Ajouter les événements pour les boutons de notation
    revisionCard.querySelectorAll('.rating-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            updateCardLevel(cardsForSession[0].id, rating);
            
            // Passer à la carte suivante ou terminer la révision
            cardsForSession.shift();
            if (cardsForSession.length > 0) {
                // Afficher la carte suivante
                revisionCard.querySelector('.revision-front').textContent = cardsForSession[0].front;
                revisionCard.querySelector('.revision-back').textContent = cardsForSession[0].back;
                revisionCard.querySelector('.revision-back').style.display = 'none';
                revisionCard.querySelector('.show-answer').style.display = 'block';
                revisionCard.querySelector('.rating-buttons').style.display = 'none';
                
                // Ajouter l'audio si disponible
                if (cardsForSession[0].audio) {
                    const audioBtn = document.createElement('button');
                    audioBtn.className = 'play-audio';
                    audioBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
                    audioBtn.addEventListener('click', function() {
                        const audio = new Audio(cardsForSession[0].audio);
                        audio.play();
                    });
                    revisionCard.querySelector('.revision-front').appendChild(audioBtn);
                }
            } else {
                // Terminer la révision
                revisionInterface.innerHTML = `
                    <div class="revision-complete">
                        <h3>Révision terminée!</h3>
                        <p>Vous avez révisé toutes les cartes prévues pour aujourd'hui.</p>
                        <button class="close-revision">Fermer</button>
                    </div>
                `;
                
                revisionInterface.querySelector('.close-revision').addEventListener('click', function() {
                    updateRevisionCards();
                });
            }
        });
    });
    
    revisionInterface.appendChild(revisionCard);
    revisionCardsContainer.appendChild(revisionInterface);
}

/**
 * Met à jour le niveau de maîtrise d'une carte et calcule la prochaine date de révision
 * @param {string} cardId - L'identifiant de la carte
 * @param {number} rating - La notation de l'utilisateur (0-3)
 */
function updateCardLevel(cardId, rating) {
    const cardIndex = spacedRepetitionData.cards.findIndex(card => card.id === cardId);
    if (cardIndex === -1) return;
    
    const card = spacedRepetitionData.cards[cardIndex];
    
    // Mettre à jour le niveau de maîtrise en fonction de la notation
    if (rating === 0) {
        // Réponse incorrecte, réinitialiser le niveau
        card.level = 0;
    } else {
        // Réponse correcte, augmenter le niveau (max 5)
        card.level = Math.min(card.level + rating, 5);
    }
    
    // Calculer la prochaine date de révision en fonction du niveau
    const today = new Date();
    let nextReviewDays;
    
    switch (card.level) {
        case 0: nextReviewDays = 0; break;     // Aujourd'hui
        case 1: nextReviewDays = 1; break;     // Demain
        case 2: nextReviewDays = 3; break;     // Dans 3 jours
        case 3: nextReviewDays = 7; break;     // Dans 1 semaine
        case 4: nextReviewDays = 14; break;    // Dans 2 semaines
        case 5: nextReviewDays = 30; break;    // Dans 1 mois
        default: nextReviewDays = 1;
    }
    
    const nextReview = new Date(today);
    nextReview.setDate(today.getDate() + nextReviewDays);
    
    // Mettre à jour les informations de la carte
    card.lastReviewed = today.toISOString();
    card.nextReview = nextReview.toISOString();
    
    // Mettre à jour les données
    spacedRepetitionData.cards[cardIndex] = card;
    spacedRepetitionData.nextReview[card.id] = card.nextReview;
    
    // Sauvegarder les données
    saveSpacedRepetitionData();
}
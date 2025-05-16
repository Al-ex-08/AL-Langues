/**
 * LinguaStart - Application d'apprentissage des langues russe et arménienne
 * Système de sessions de révision personnalisées
 */

/**
 * Classe pour gérer les sessions de révision personnalisées
 */
class RevisionSession {
    /**
     * Crée une nouvelle session de révision
     * @param {number} timeInMinutes - Durée de la session en minutes (null pour sans limite)
     * @param {string} levelFilter - Niveau d'apprentissage ('debutant', 'intermediaire', 'avance', 'tous')
     * @param {Array} cards - Cartes disponibles pour la révision
     */
    constructor(timeInMinutes, levelFilter, cards) {
        this.timeInMinutes = timeInMinutes;
        this.levelFilter = levelFilter;
        this.allCards = [...cards];
        this.sessionCards = this.filterCards();
        this.currentCardIndex = 0;
        this.startTime = null;
        this.elapsedTime = 0;
        this.isActive = false;
        this.timerInterval = null;
    }

    /**
     * Filtre les cartes en fonction du temps et du niveau
     * @returns {Array} - Les cartes filtrées pour la session
     */
    filterCards() {
        // Estimer le temps moyen par carte (en secondes)
        const avgTimePerCard = 30; // 30 secondes par carte en moyenne
        const maxCards = this.timeInMinutes ? Math.floor((this.timeInMinutes * 60) / avgTimePerCard) : this.allCards.length;
        
        // Filtrer par niveau si nécessaire
        let filteredCards = [...this.allCards];
        
        if (this.levelFilter !== 'tous') {
            switch(this.levelFilter) {
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
            filteredCards = [...this.allCards];
        }
        
        // Trier les cartes par priorité (niveau de maîtrise bas en premier)
        filteredCards.sort((a, b) => a.level - b.level);
        
        // Limiter le nombre de cartes en fonction du temps disponible
        return filteredCards.slice(0, Math.min(maxCards, filteredCards.length));
    }

    /**
     * Démarre la session de révision
     */
    start() {
        this.isActive = true;
        this.startTime = new Date();
        
        // Démarrer le timer si une limite de temps est définie
        if (this.timeInMinutes) {
            this.timerInterval = setInterval(() => {
                this.updateElapsedTime();
                
                // Vérifier si le temps est écoulé
                if (this.elapsedTime >= this.timeInMinutes * 60) {
                    this.end();
                }
            }, 1000);
        }
        
        return this.getCurrentCard();
    }

    /**
     * Met à jour le temps écoulé
     */
    updateElapsedTime() {
        const now = new Date();
        this.elapsedTime = Math.floor((now - this.startTime) / 1000);
        
        // Mettre à jour l'affichage du temps restant
        if (this.timeInMinutes) {
            const remainingSeconds = (this.timeInMinutes * 60) - this.elapsedTime;
            if (remainingSeconds <= 0) {
                this.end();
                return;
            }
            
            const minutes = Math.floor(remainingSeconds / 60);
            const seconds = remainingSeconds % 60;
            
            const timerElement = document.querySelector('.session-timer');
            if (timerElement) {
                timerElement.textContent = `Temps restant: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            }
        }
    }

    /**
     * Obtient la carte actuelle
     * @returns {Object|null} - La carte actuelle ou null si la session est terminée
     */
    getCurrentCard() {
        if (!this.isActive || this.currentCardIndex >= this.sessionCards.length) {
            return null;
        }
        
        return this.sessionCards[this.currentCardIndex];
    }

    /**
     * Passe à la carte suivante
     * @returns {Object|null} - La carte suivante ou null si la session est terminée
     */
    nextCard() {
        this.currentCardIndex++;
        
        if (this.currentCardIndex >= this.sessionCards.length) {
            this.end();
            return null;
        }
        
        return this.getCurrentCard();
    }

    /**
     * Termine la session de révision
     */
    end() {
        this.isActive = false;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Afficher un résumé de la session
        this.showSessionSummary();
    }

    /**
     * Affiche un résumé de la session de révision
     */
    showSessionSummary() {
        const revisionInterface = document.querySelector('.revision-interface');
        if (!revisionInterface) return;
        
        // Calculer les statistiques de la session
        const totalCards = this.currentCardIndex;
        const minutes = Math.floor(this.elapsedTime / 60);
        const seconds = this.elapsedTime % 60;
        
        revisionInterface.innerHTML = `
            <div class="revision-complete">
                <h3>Révision terminée!</h3>
                <p>Vous avez révisé ${totalCards} carte(s) en ${minutes}:${seconds < 10 ? '0' : ''}${seconds}.</p>
                <button class="close-revision">Fermer</button>
            </div>
        `;
        
        revisionInterface.querySelector('.close-revision').addEventListener('click', function() {
            updateRevisionCards();
        });
    }
}

/**
 * Crée et démarre une nouvelle session de révision personnalisée
 * @param {number} timeInMinutes - Durée de la session en minutes (null pour sans limite)
 * @param {string} levelFilter - Niveau d'apprentissage ('debutant', 'intermediaire', 'avance', 'tous')
 */
function createRevisionSession(timeInMinutes = null, levelFilter = 'tous') {
    const revisionCardsContainer = document.querySelector('.revision-cards');
    if (!revisionCardsContainer) return;
    
    // Obtenir les cartes à réviser aujourd'hui
    const today = new Date();
    const cardsToReview = spacedRepetitionData.cards.filter(card => {
        const nextReviewDate = new Date(card.nextReview);
        return nextReviewDate <= today;
    });
    
    if (cardsToReview.length === 0) return;
    
    // Créer une nouvelle session de révision
    const session = new RevisionSession(timeInMinutes, levelFilter, cardsToReview);
    const sessionCards = session.sessionCards;
    
    if (sessionCards.length === 0) {
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
            ${sessionCards.length} carte(s)
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
    
    // Démarrer la session
    session.start();
    
    // Créer la carte de révision pour la première carte
    const currentCard = session.getCurrentCard();
    const revisionCard = document.createElement('div');
    revisionCard.className = 'revision-card';
    revisionCard.innerHTML = `
        <div class="revision-front">${currentCard.front}</div>
        <div class="revision-back" style="display: none;">${currentCard.back}</div>
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
    if (currentCard.audio) {
        const audioBtn = document.createElement('button');
        audioBtn.className = 'play-audio';
        audioBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        audioBtn.addEventListener('click', function() {
            const audio = new Audio(currentCard.audio);
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
            updateCardLevel(currentCard.id, rating);
            
            // Passer à la carte suivante
            const nextCard = session.nextCard();
            if (nextCard) {
                // Mettre à jour la carte actuelle
                revisionCard.querySelector('.revision-front').textContent = nextCard.front;
                revisionCard.querySelector('.revision-back').textContent = nextCard.back;
                revisionCard.querySelector('.revision-back').style.display = 'none';
                revisionCard.querySelector('.show-answer').style.display = 'block';
                revisionCard.querySelector('.rating-buttons').style.display = 'none';
                
                // Ajouter l'audio si disponible
                if (nextCard.audio) {
                    const audioBtn = document.createElement('button');
                    audioBtn.className = 'play-audio';
                    audioBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
                    audioBtn.addEventListener('click', function() {
                        const audio = new Audio(nextCard.audio);
                        audio.play();
                    });
                    revisionCard.querySelector('.revision-front').appendChild(audioBtn);
                }
            }
        });
    });
    
    revisionInterface.appendChild(revisionCard);
    revisionCardsContainer.appendChild(revisionInterface);
}

// Remplacer la fonction startRevision par createRevisionSession
function startRevision(timeInMinutes = null, levelFilter = 'tous') {
    createRevisionSession(timeInMinutes, levelFilter);
}
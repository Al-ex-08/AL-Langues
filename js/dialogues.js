/**
 * LinguaStart - Application d'apprentissage des langues russe et arménienne
 * Script pour les fonctionnalités de dialogues interactifs
 */

document.addEventListener('DOMContentLoaded', function() {
    initDialogues();
    initSituations();
});

/**
 * Initialise les dialogues interactifs
 */
function initDialogues() {
    const practiceButtons = document.querySelectorAll('.dialogue-practice .practice-button');
    practiceButtons.forEach(button => {
        button.addEventListener('click', startDialoguePractice);
    });
}

/**
 * Démarre une session de pratique de dialogue
 */
function startDialoguePractice() {
    const dialogueCard = this.closest('.dialogue-card');
    const dialogueContent = dialogueCard.querySelector('.dialogue-content');
    const dialogueTitle = dialogueCard.querySelector('h3').textContent;
    
    // Déterminer la langue en fonction de la classe du body
    const language = document.body.classList.contains('russian-theme') ? 'russian' : 'armenian';
    
    // Extraire les lignes du dialogue
    const dialogueLines = [];
    dialogueContent.querySelectorAll('.dialogue-line').forEach(line => {
        dialogueLines.push({
            speaker: line.querySelector('.speaker').textContent.replace(':', ''),
            text: line.querySelector('.text').textContent,
            translation: line.querySelector('.translation').textContent,
            audio: line.querySelector('.play-audio').dataset.audio
        });
    });
    
    // Créer l'interface de pratique
    const practiceInterface = document.createElement('div');
    practiceInterface.className = 'dialogue-practice-interface';
    practiceInterface.innerHTML = `
        <div class="practice-header">
            <h3>Pratique: ${dialogueTitle}</h3>
            <p>Choisissez votre rôle:</p>
            <div class="role-selection">
                <button class="role-btn" data-role="${dialogueLines[0].speaker}">${dialogueLines[0].speaker}</button>
                <button class="role-btn" data-role="${dialogueLines[1].speaker}">${dialogueLines[1].speaker}</button>
            </div>
        </div>
        <div class="practice-content" style="display: none;"></div>
    `;
    
    // Ajouter les événements pour la sélection du rôle
    practiceInterface.querySelectorAll('.role-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const selectedRole = this.dataset.role;
            startRolePractice(practiceInterface, dialogueLines, selectedRole, language);
        });
    });
    
    // Remplacer le contenu du dialogue par l'interface de pratique
    dialogueCard.innerHTML = '';
    dialogueCard.appendChild(practiceInterface);
}

/**
 * Démarre une pratique de dialogue avec un rôle spécifique
 * @param {HTMLElement} container - Le conteneur de l'interface de pratique
 * @param {Array} lines - Les lignes du dialogue
 * @param {string} userRole - Le rôle choisi par l'utilisateur
 * @param {string} language - La langue du dialogue (russian ou armenian)
 */
function startRolePractice(container, lines, userRole, language) {
    // Masquer la sélection de rôle
    container.querySelector('.role-selection').style.display = 'none';
    
    // Afficher le contenu de pratique
    const practiceContent = container.querySelector('.practice-content');
    practiceContent.style.display = 'block';
    
    // Créer l'interface de dialogue
    practiceContent.innerHTML = `
        <div class="practice-dialogue">
            <div class="dialogue-messages"></div>
            <div class="user-input-container">
                <div class="user-prompt"></div>
                <div class="input-options"></div>
            </div>
        </div>
        <button class="restart-practice">Recommencer</button>
    `;
    
    // Ajouter l'événement pour recommencer
    practiceContent.querySelector('.restart-practice').addEventListener('click', function() {
        startRolePractice(container, lines, userRole, language);
    });
    
    // Commencer le dialogue
    runDialoguePractice(practiceContent, lines, userRole, language, 0);
}

/**
 * Exécute la pratique de dialogue étape par étape
 * @param {HTMLElement} container - Le conteneur de l'interface de pratique
 * @param {Array} lines - Les lignes du dialogue
 * @param {string} userRole - Le rôle choisi par l'utilisateur
 * @param {string} language - La langue du dialogue (russian ou armenian)
 * @param {number} currentIndex - L'index de la ligne actuelle
 */
function runDialoguePractice(container, lines, userRole, language, currentIndex) {
    if (currentIndex >= lines.length) {
        // Dialogue terminé
        const messagesContainer = container.querySelector('.dialogue-messages');
        const completionMessage = document.createElement('div');
        completionMessage.className = 'dialogue-completion';
        completionMessage.innerHTML = `
            <p>Félicitations ! Vous avez terminé ce dialogue.</p>
            <button class="restart-btn">Recommencer</button>
        `;
        messagesContainer.appendChild(completionMessage);
        
        completionMessage.querySelector('.restart-btn').addEventListener('click', function() {
            startRolePractice(container.closest('.dialogue-practice-interface'), lines, userRole, language);
        });
        
        // Masquer l'interface de saisie
        container.querySelector('.user-input-container').style.display = 'none';
        return;
    }
    
    const currentLine = lines[currentIndex];
    const messagesContainer = container.querySelector('.dialogue-messages');
    const userInputContainer = container.querySelector('.user-input-container');
    const userPrompt = container.querySelector('.user-prompt');
    const inputOptions = container.querySelector('.input-options');
    
    // Ajouter la ligne actuelle au dialogue
    const messageElement = document.createElement('div');
    messageElement.className = `dialogue-message ${currentLine.speaker === userRole ? 'user-message' : 'other-message'}`;
    
    if (currentLine.speaker === userRole) {
        // C'est au tour de l'utilisateur
        userPrompt.textContent = `À vous de jouer (${currentLine.speaker}):`;
        inputOptions.innerHTML = '';
        
        // Créer les options de réponse (la bonne réponse et 2 distracteurs)
        const options = [currentLine.text];
        
        // Ajouter des distracteurs (lignes d'autres dialogues ou variations)
        const distractors = getDistractors(lines, currentIndex, language);
        options.push(...distractors);
        
        // Mélanger les options
        shuffleArray(options);
        
        // Créer les boutons d'options
        options.forEach(option => {
            const optionBtn = document.createElement('button');
            optionBtn.className = 'dialogue-option';
            optionBtn.textContent = option;
            optionBtn.addEventListener('click', function() {
                // Ajouter la réponse de l'utilisateur
                messageElement.innerHTML = `
                    <div class="message-header">
                        <span class="message-speaker">${currentLine.speaker}:</span>
                    </div>
                    <div class="message-text">${option}</div>
                    <div class="message-translation">${currentLine.translation}</div>
                `;
                messagesContainer.appendChild(messageElement);
                
                // Vérifier si la réponse est correcte
                if (option === currentLine.text) {
                    // Réponse correcte
                    const feedbackElement = document.createElement('div');
                    feedbackElement.className = 'dialogue-feedback correct';
                    feedbackElement.innerHTML = '<i class="fas fa-check"></i> Correct!';
                    messagesContainer.appendChild(feedbackElement);
                    
                    // Jouer l'audio si disponible
                    if (currentLine.audio) {
                        const audioPath = `../audio/${language}/${currentLine.audio}.mp3`;
                        const audio = new Audio(audioPath);
                        audio.play();
                    }
                    
                    // Passer à la ligne suivante après un court délai
                    setTimeout(() => {
                        runDialoguePractice(container, lines, userRole, language, currentIndex + 1);
                    }, 1500);
                } else {
                    // Réponse incorrecte
                    const feedbackElement = document.createElement('div');
                    feedbackElement.className = 'dialogue-feedback incorrect';
                    feedbackElement.innerHTML = `
                        <i class="fas fa-times"></i> Incorrect. La réponse correcte est:
                        <div class="correct-answer">${currentLine.text}</div>
                    `;
                    messagesContainer.appendChild(feedbackElement);
                    
                    // Passer à la ligne suivante après un délai plus long
                    setTimeout(() => {
                        runDialoguePractice(container, lines, userRole, language, currentIndex + 1);
                    }, 3000);
                }
                
                // Masquer les options
                userInputContainer.style.display = 'none';
            });
            inputOptions.appendChild(optionBtn);
        });
        
        // Afficher l'interface de saisie
        userInputContainer.style.display = 'block';
    } else {
        // C'est au tour de l'autre interlocuteur
        messageElement.innerHTML = `
            <div class="message-header">
                <span class="message-speaker">${currentLine.speaker}:</span>
            </div>
            <div class="message-text">${currentLine.text}</div>
            <div class="message-translation">${currentLine.translation}</div>
        `;
        messagesContainer.appendChild(messageElement);
        
        // Jouer l'audio si disponible
        if (currentLine.audio) {
            const audioPath = `../audio/${language}/${currentLine.audio}.mp3`;
            const audio = new Audio(audioPath);
            audio.play();
        }
        
        // Masquer l'interface de saisie pendant que l'autre parle
        userInputContainer.style.display = 'none';
        
        // Passer à la ligne suivante après un court délai
        setTimeout(() => {
            runDialoguePractice(container, lines, userRole, language, currentIndex + 1);
        }, 2000);
    }
    
    // Faire défiler vers le bas pour voir les nouveaux messages
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Obtient des réponses distractrices pour les options de dialogue
 * @param {Array} lines - Les lignes du dialogue complet
 * @param {number} currentIndex - L'index de la ligne actuelle
 * @param {string} language - La langue du dialogue (russian ou armenian)
 * @returns {Array} - Un tableau de textes distracteurs
 */
function getDistractors(lines, currentIndex, language) {
    // Dans une implémentation réelle, on pourrait charger des distracteurs depuis une base de données
    // Pour cet exemple, nous utilisons des variations simples ou d'autres lignes du même dialogue
    const distractors = [];
    const currentLine = lines[currentIndex];
    
    // Trouver d'autres lignes du même locuteur
    const speakerLines = lines.filter((line, index) => 
        line.speaker === currentLine.speaker && index !== currentIndex
    );
    
    // Ajouter jusqu'à 2 distracteurs
    if (speakerLines.length > 0) {
        distractors.push(speakerLines[0].text);
    }
    
    // Si nous n'avons pas assez de distracteurs, ajouter des variations
    if (distractors.length < 2) {
        if (language === 'russian') {
            distractors.push("Извините, я не понимаю.");
        } else { // armenian
            distractors.push("Ներեցեք, ես չեմ հասկանում:");
        }
    }
    
    // Limiter à 2 distracteurs
    return distractors.slice(0, 2);
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

/**
 * Initialise les mises en situation interactives
 */
function initSituations() {
    const startButtons = document.querySelectorAll('.situation-card .start-situation');
    startButtons.forEach(button => {
        button.addEventListener('click', startSituation);
    });
}

/**
 * Démarre une mise en situation interactive
 */
function startSituation() {
    const situationCard = this.closest('.situation-card');
    const situationTitle = situationCard.querySelector('h3').textContent;
    const situationDesc = situationCard.querySelector('p').textContent;
    const situationContent = situationCard.querySelector('.situation-content');
    
    // Déterminer la langue en fonction de la classe du body
    const language = document.body.classList.contains('russian-theme') ? 'russian' : 'armenian';
    
    // Masquer le bouton de démarrage
    this.style.display = 'none';
    
    // Afficher le contenu de la situation
    situationContent.style.display = 'block';
    
    // Créer l'interface de la situation
    situationContent.innerHTML = `
        <div class="situation-scenario">
            <p>${situationDesc}</p>
        </div>
        <div class="situation-dialogue">
            <div class="situation-messages"></div>
            <div class="situation-input-container">
                <div class="situation-prompt">Que diriez-vous dans cette situation?</div>
                <div class="situation-options"></div>
            </div>
        </div>
        <button class="restart-situation">Recommencer</button>
    `;
    
    // Ajouter l'événement pour recommencer
    situationContent.querySelector('.restart-situation').addEventListener('click', function() {
        situationContent.style.display = 'none';
        situationCard.querySelector('.start-situation').style.display = 'block';
    });
    
    // Charger le scénario approprié en fonction du titre
    let scenario;
    if (situationTitle.includes("Demander son chemin")) {
        scenario = getDirectionsScenario(language);
    } else if (situationTitle.includes("Commander au restaurant")) {
        scenario = getRestaurantScenario(language);
    } else {
        // Scénario par défaut
        scenario = getDefaultScenario(language);
    }
    
    // Démarrer le scénario
    runSituationScenario(situationContent, scenario, language, 0);
}

/**
 * Exécute un scénario de mise en situation étape par étape
 * @param {HTMLElement} container - Le conteneur de l'interface de situation
 * @param {Array} scenario - Les étapes du scénario
 * @param {string} language - La langue du scénario (russian ou armenian)
 * @param {number} currentStep - L'index de l'étape actuelle
 */
function runSituationScenario(container, scenario, language, currentStep) {
    if (currentStep >= scenario.length) {
        // Scénario terminé
        const messagesContainer = container.querySelector('.situation-messages');
        const completionMessage = document.createElement('div');
        completionMessage.className = 'situation-completion';
        completionMessage.innerHTML = `
            <p>Félicitations ! Vous avez terminé cette mise en situation.</p>
            <button class="restart-btn">Recommencer</button>
        `;
        messagesContainer.appendChild(completionMessage);
        
        completionMessage.querySelector('.restart-btn').addEventListener('click', function() {
            container.style.display = 'none';
            container.closest('.situation-card').querySelector('.start-situation').style.display = 'block';
        });
        
        // Masquer l'interface de saisie
        container.querySelector('.situation-input-container').style.display = 'none';
        return;
    }
    
    const currentScenarioStep = scenario[currentStep];
    const messagesContainer = container.querySelector('.situation-messages');
    const inputContainer = container.querySelector('.situation-input-container');
    const optionsContainer = container.querySelector('.situation-options');
    
    if (currentScenarioStep.type === 'system') {
        // Message système (narration)
        const systemMessage = document.createElement('div');
        systemMessage.className = 'situation-system-message';
        systemMessage.textContent = currentScenarioStep.text;
        messagesContainer.appendChild(systemMessage);
        
        // Passer à l'étape suivante après un court délai
        setTimeout(() => {
            runSituationScenario(container, scenario, language, currentStep + 1);
        }, 2000);
    } else if (currentScenarioStep.type === 'npc') {
        // Message d'un personnage non-joueur
        const npcMessage = document.createElement('div');
        npcMessage.className = 'situation-npc-message';
        npcMessage.innerHTML = `
            <div class="message-header">
                <span class="message-speaker">${currentScenarioStep.speaker}:</span>
            </div>
            <div class="message-text">${currentScenarioStep.text}</div>
            <div class="message-translation">${currentScenarioStep.translation}</div>
        `;
        messagesContainer.appendChild(npcMessage);
        
        // Jouer l'audio si disponible
        if (currentScenarioStep.audio) {
            const audioPath = `../audio/${language}/situations/${currentScenarioStep.audio}.mp3`;
            const audio = new Audio(audioPath);
            audio.play();
        }
        
        // Passer à l'étape suivante après un court délai
        setTimeout(() => {
            runSituationScenario(container, scenario, language, currentStep + 1);
        }, 2500);
    } else if (currentScenarioStep.type === 'player') {
        // C'est au tour du joueur de répondre
        inputContainer.style.display = 'block';
        optionsContainer.innerHTML = '';
        
        // Créer les options de réponse
        currentScenarioStep.options.forEach(option => {
            const optionBtn = document.createElement('button');
            optionBtn.className = 'situation-option';
            optionBtn.innerHTML = `
                <div class="option-text">${option.text}</div>
                <div class="option-translation">${option.translation}</div>
            `;
            optionBtn.addEventListener('click', function() {
                // Ajouter la réponse du joueur
                const playerMessage = document.createElement('div');
                playerMessage.className = 'situation-player-message';
                playerMessage.innerHTML = `
                    <div class="message-header">
                        <span class="message-speaker">Vous:</span>
                    </div>
                    <div class="message-text">${option.text}</div>
                    <div class="message-translation">${option.translation}</div>
                `;
                messagesContainer.appendChild(playerMessage);
                
                // Masquer l'interface de saisie
                inputContainer.style.display = 'none';
                
                // Passer à l'étape suivante (ou à l'étape spécifiée par l'option)
                setTimeout(() => {
                    const nextStep = option.nextStep !== undefined ? option.nextStep : currentStep + 1;
                    runSituationScenario(container, scenario, language, nextStep);
                }, 1500);
            });
            optionsContainer.appendChild(optionBtn);
        });
    }
    
    // Faire défiler vers le bas pour voir les nouveaux messages
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Obtient un scénario pour demander son chemin
 * @param {string} language - La langue du scénario (russian ou armenian)
 * @returns {Array} - Un tableau d'étapes de scénario
 */
function getDirectionsScenario(language) {
    if (language === 'russian') {
        return [
            {
                type: 'system',
                text: 'Vous êtes perdu(e) dans une ville russe et vous devez trouver la gare.'
            },
            {
                type: 'system',
                text: 'Vous voyez un passant qui pourrait vous aider.'
            },
            {
                type: 'player',
                options: [
                    {
                        text: 'Извините, вы не подскажете, где находится вокзал?',
                        translation: 'Excusez-moi, pourriez-vous me dire où se trouve la gare?'
                    },
                    {
                        text: 'Здравствуйте! Я ищу вокзал.',
                        translation: 'Bonjour! Je cherche la gare.'
                    },
                    {
                        text: 'Вокзал? Где?',
                        translation: 'La gare? Où?'
                    }
                ]
            },
            {
                type: 'npc',
                speaker: 'Прохожий',
                text: 'Да, конечно. Идите прямо по этой улице, затем на втором перекрёстке поверните направо.',
                translation: 'Oui, bien sûr. Allez tout droit dans cette rue, puis au deuxième carrefour, tournez à droite.',
                audio: 'directions1'
            },
            {
                type: 'player',
                options: [
                    {
                        text: 'Спасибо! А далеко ли идти?',
                        translation: 'Merci! Est-ce loin?'
                    },
                    {
                        text: 'Извините, я не понял. Можете повторить?',
                        translation: 'Excusez-moi, je n\'ai pas compris. Pouvez-vous répéter?'
                    },
                    {
                        text: 'Второй перекрёсток направо... Понятно.',
                        translation: 'Deuxième carrefour à droite... Je comprends.'
                    }
                ]
            },
            {
                type: 'npc',
                speaker: 'Прохожий',
                text: 'Это примерно 10-15 минут пешком. Вы увидите большое серое здание с часами.',
                translation: 'C\'est à environ 10-15 minutes à pied. Vous verrez un grand bâtiment gris avec une horloge.',
                audio: 'directions2'
            },
            {
                type: 'player',
                options: [
                    {
                        text: 'Большое спасибо за помощь!',
                        translation: 'Merci beaucoup pour votre aide!'
                    },
                    {
                        text: 'Отлично! Я найду его.',
                        translation: 'Parfait! Je vais le trouver.'
                    },
                    {
                        text: 'Спасибо. Хорошего дня!',
                        translation: 'Merci. Bonne journée!'
                    }
                ]
            },
            {
                type: 'npc',
                speaker: 'Прохожий',
                text: 'Пожалуйста! Счастливого пути!',
                translation: 'Je vous en prie! Bon voyage!',
                audio: 'directions3'
            },
            {
                type: 'system',
                text: 'Vous remerciez la personne et vous dirigez vers la gare en suivant ses indications.'
            }
        ];
    } else { // arménien
        return [
            {
                type: 'system',
                text: 'Vous êtes perdu(e) à Erevan et vous devez trouver la Place de la République.'
            },
            {
                type: 'system',
                text: 'Vous voyez un passant qui pourrait vous aider.'
            },
            {
                type: 'player',
                options: [
                    {
                        text: 'Ներեցեք, կարո՞ղ եք ասել, որտեղ է գտնվում Հանրապետության հրապարակը:',
                        translation: 'Excusez-moi, pourriez-vous me dire où se trouve la Place de la République?'
                    },
                    {
                        text: 'Բարև Ձեզ! Ես փնտրում եմ Հանրապետության հրապարակը:',
                        translation: 'Bonjour! Je cherche la Place de la République.'
                    },
                    {
                        text: 'Հանրապետության հրապարակը՞: Որտե՞ղ:',
                        translation: 'La Place de la République? Où?'
                    }
                ]
            },
            {
                type: 'npc',
                speaker: 'Անցորդ',
                text: 'Այո, իհարկե: Գնացեք ուղիղ այս փողոցով, հետո երկրորդ խաչմերուկում թեքվեք աջ:',
                translation: 'Oui, bien sûr. Allez tout droit dans cette rue, puis au deuxième carrefour, tournez à droite.',
                audio: 'directions1'
            },
            {
                type: 'player',
                options: [
                    {
                        text: 'Շնորհակալություն: Հեռո՞ւ է այն:',
                        translation: 'Merci! Est-ce loin?'
                    },
                    {
                        text: 'Ներեցեք, ես չհասկացա: Կարո՞ղ եք կրկնել:',
                        translation: 'Excusez-moi, je n\'ai pas compris. Pouvez-vous répéter?'
                    },
                    {
                        text: 'Երկրորդ խաչմերուկում աջ... Հասկանալի է:',
                        translation: 'Deuxième carrefour à droite... Je comprends.'
                    }
                ]
            },
            {
                type: 'npc',
                speaker: 'Անցորդ',
                text: 'Դա մոտավորապես 10-15 րոպե ոտքով: Դուք կտեսնեք մեծ հրապարակ շատրվաններով:',
                translation: 'C\'est à environ 10-15 minutes à pied. Vous verrez une grande place avec des fontaines.',
                audio: 'directions2'
            },
            {
                type: 'player',
                options: [
                    {
                        text: 'Շատ շնորհակալություն օգնության համար:',
                        translation: 'Merci beaucoup pour votre aide!'
                    },
                    {
                        text: 'Հիանալի է: Ես կգտնեմ այն:',
                        translation: 'Parfait! Je vais la trouver.'
                    },
                    {
                        text: 'Շնորհակալություն: Լավ օր:',
                        translation: 'Merci. Bonne journée!'
                    }
                ]
            },
            {
                type: 'npc',
                speaker: 'Անցորդ',
                text: 'Խնդրեմ: Հաճելի զբոսանք:',
                translation: 'Je vous en prie! Bonne promenade!',
                audio: 'directions3'
            },
            {
                type: 'system',
                text: 'Vous remerciez la personne et vous dirigez vers la Place de la République en suivant ses indications.'
            }
        ];
    }
}

/**
 * Obtient un scénario pour commander au restaurant
 * @
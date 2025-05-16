/**
 * LinguaStart - Application d'apprentissage des langues russe et arménienne
 * Fonctionnalités d'authentification et de gestion de compte utilisateur
 */

/**
 * Initialise les fonctionnalités d'authentification
 */
document.addEventListener('DOMContentLoaded', function() {
    initAuthUI();
    setupAuthListeners();
});

/**
 * Initialise l'interface utilisateur d'authentification
 */
function initAuthUI() {
    // Créer les éléments d'interface pour l'authentification s'ils n'existent pas déjà
    createAuthModals();
    
    // Ajouter les boutons d'authentification dans le header si nécessaire
    addAuthButtonsToHeader();
}

/**
 * Crée les modales d'authentification dans le DOM
 */
function createAuthModals() {
    // Vérifier si les modales existent déjà
    if (document.getElementById('login-modal')) return;
    
    // Créer la structure des modales
    const modalsHTML = `
        <!-- Modal de connexion -->
        <div id="login-modal" class="auth-modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Connexion</h2>
                <form id="login-form" class="auth-form">
                    <div class="form-group">
                        <label for="login-email">Email</label>
                        <input type="email" id="login-email" required>
                    </div>
                    <div class="form-group">
                        <label for="login-password">Mot de passe</label>
                        <input type="password" id="login-password" required>
                    </div>
                    <div class="form-error" id="login-error"></div>
                    <button type="submit" class="btn primary">Se connecter</button>
                </form>
                <p class="auth-switch">Pas encore de compte ? <a href="#" id="show-signup">S'inscrire</a></p>
                <p class="auth-switch"><a href="#" id="show-reset-password">Mot de passe oublié ?</a></p>
            </div>
        </div>
        
        <!-- Modal d'inscription -->
        <div id="signup-modal" class="auth-modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Inscription</h2>
                <form id="signup-form" class="auth-form">
                    <div class="form-group">
                        <label for="signup-name">Nom d'utilisateur</label>
                        <input type="text" id="signup-name" required>
                    </div>
                    <div class="form-group">
                        <label for="signup-email">Email</label>
                        <input type="email" id="signup-email" required>
                    </div>
                    <div class="form-group">
                        <label for="signup-password">Mot de passe</label>
                        <input type="password" id="signup-password" required minlength="6">
                        <small>Le mot de passe doit contenir au moins 6 caractères</small>
                    </div>
                    <div class="form-group">
                        <label for="signup-password-confirm">Confirmer le mot de passe</label>
                        <input type="password" id="signup-password-confirm" required>
                    </div>
                    <div class="form-error" id="signup-error"></div>
                    <button type="submit" class="btn primary">S'inscrire</button>
                </form>
                <p class="auth-switch">Déjà un compte ? <a href="#" id="show-login">Se connecter</a></p>
            </div>
        </div>
        
        <!-- Modal de réinitialisation de mot de passe -->
        <div id="reset-password-modal" class="auth-modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Réinitialiser le mot de passe</h2>
                <form id="reset-password-form" class="auth-form">
                    <div class="form-group">
                        <label for="reset-email">Email</label>
                        <input type="email" id="reset-email" required>
                    </div>
                    <div class="form-error" id="reset-error"></div>
                    <div class="form-success" id="reset-success"></div>
                    <button type="submit" class="btn primary">Envoyer le lien de réinitialisation</button>
                </form>
                <p class="auth-switch"><a href="#" id="back-to-login">Retour à la connexion</a></p>
            </div>
        </div>
        
        <!-- Modal de profil utilisateur -->
        <div id="profile-modal" class="auth-modal">
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Profil utilisateur</h2>
                <div id="user-profile-content">
                    <div class="profile-info">
                        <div class="profile-avatar">
                            <img id="user-avatar" src="img/default-avatar.svg" alt="Avatar utilisateur">
                            <button id="change-avatar" class="btn secondary small">Changer</button>
                        </div>
                        <div class="profile-details">
                            <h3 id="profile-name"></h3>
                            <p id="profile-email"></p>
                        </div>
                    </div>
                    
                    <div class="profile-section">
                        <h3>Langues d'apprentissage</h3>
                        <div class="learning-languages">
                            <div class="language-checkbox">
                                <input type="checkbox" id="learn-russian" name="learning-languages" value="russian">
                                <label for="learn-russian">Russe</label>
                            </div>
                            <div class="language-checkbox">
                                <input type="checkbox" id="learn-armenian" name="learning-languages" value="armenian">
                                <label for="learn-armenian">Arménien</label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="profile-section">
                        <h3>Statistiques d'apprentissage</h3>
                        <div class="learning-statistics">
                            <!-- Les statistiques seront injectées ici par JavaScript -->
                        </div>
                    </div>
                    
                    <div class="profile-actions">
                        <button id="save-profile" class="btn primary">Enregistrer les modifications</button>
                        <button id="logout-button" class="btn secondary">Se déconnecter</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Ajouter les modales au body
    const modalsContainer = document.createElement('div');
    modalsContainer.id = 'auth-modals';
    modalsContainer.innerHTML = modalsHTML;
    document.body.appendChild(modalsContainer);
    
    // Ajouter le CSS nécessaire s'il n'existe pas déjà
    if (!document.getElementById('auth-styles')) {
        const authStyles = document.createElement('style');
        authStyles.id = 'auth-styles';
        authStyles.textContent = `
            .auth-modal {
                display: none;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
            }
            
            .modal-content {
                background-color: #fff;
                margin: 10% auto;
                padding: 2rem;
                border-radius: 8px;
                max-width: 500px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                position: relative;
            }
            
            .close-modal {
                position: absolute;
                right: 1rem;
                top: 0.5rem;
                font-size: 1.5rem;
                cursor: pointer;
            }
            
            .auth-form .form-group {
                margin-bottom: 1.5rem;
            }
            
            .auth-form label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 500;
            }
            
            .auth-form input {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 1rem;
            }
            
            .auth-form small {
                display: block;
                margin-top: 0.25rem;
                color: #666;
            }
            
            .form-error {
                color: #e74c3c;
                margin: 1rem 0;
                font-size: 0.9rem;
            }
            
            .form-success {
                color: #2ecc71;
                margin: 1rem 0;
                font-size: 0.9rem;
            }
            
            .auth-switch {
                margin-top: 1.5rem;
                text-align: center;
                font-size: 0.9rem;
            }
            
            .profile-info {
                display: flex;
                align-items: center;
                margin-bottom: 2rem;
            }
            
            .profile-avatar {
                margin-right: 1.5rem;
                text-align: center;
            }
            
            .profile-avatar img {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                object-fit: cover;
                border: 2px solid #ddd;
            }
            
            .profile-section {
                margin-bottom: 2rem;
            }
            
            .learning-languages {
                display: flex;
                gap: 1.5rem;
                margin-top: 0.5rem;
            }
            
            .language-checkbox {
                display: flex;
                align-items: center;
            }
            
            .language-checkbox input {
                margin-right: 0.5rem;
            }
            
            .learning-statistics {
                display: flex;
                justify-content: space-between;
                margin-top: 1rem;
            }
            
            .stat-item {
                text-align: center;
                flex: 1;
            }
            
            .stat-value {
                display: block;
                font-size: 1.5rem;
                font-weight: bold;
                color: #3498db;
            }
            
            .stat-label {
                font-size: 0.9rem;
                color: #666;
            }
            
            .profile-actions {
                display: flex;
                justify-content: space-between;
                margin-top: 2rem;
            }
            
            .auth-buttons {
                display: flex;
                gap: 1rem;
            }
            
            .user-profile {
                display: none;
                cursor: pointer;
            }
            
            .user-profile-header {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .user-avatar-small {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                object-fit: cover;
            }
        `;
        document.head.appendChild(authStyles);
    }
}

/**
 * Ajoute les boutons d'authentification dans le header
 */
function addAuthButtonsToHeader() {
    const nav = document.querySelector('header nav ul');
    if (!nav) return;
    
    // Vérifier si les boutons existent déjà
    if (document.querySelector('.auth-buttons')) return;
    
    // Créer l'élément li pour les boutons d'authentification
    const authLi = document.createElement('li');
    authLi.className = 'auth-container';
    
    // Ajouter les boutons de connexion/inscription
    authLi.innerHTML = `
        <div class="auth-buttons">
            <button id="login-button" class="btn secondary small">Connexion</button>
            <button id="signup-button" class="btn primary small">Inscription</button>
        </div>
        <div class="user-profile">
            <div class="user-profile-header">
                <img src="img/default-avatar.svg" alt="Avatar" class="user-avatar-small">
                <span class="user-name">Utilisateur</span>
            </div>
        </div>
    `;
    
    nav.appendChild(authLi);
}

/**
 * Configure les écouteurs d'événements pour l'authentification
 */
function setupAuthListeners() {
    // Écouteurs pour ouvrir/fermer les modales
    document.addEventListener('click', function(e) {
        // Boutons d'ouverture de modale
        if (e.target.id === 'login-button') {
            openModal('login-modal');
        } else if (e.target.id === 'signup-button') {
            openModal('signup-modal');
        } else if (e.target.matches('.user-profile, .user-profile *')) {
            openModal('profile-modal');
        }
        
        // Liens de navigation entre modales
        else if (e.target.id === 'show-signup') {
            closeAllModals();
            openModal('signup-modal');
        } else if (e.target.id === 'show-login') {
            closeAllModals();
            openModal('login-modal');
        } else if (e.target.id === 'show-reset-password') {
            closeAllModals();
            openModal('reset-password-modal');
        } else if (e.target.id === 'back-to-login') {
            closeAllModals();
            openModal('login-modal');
        }
        
        // Fermeture des modales
        else if (e.target.matches('.close-modal')) {
            closeAllModals();
        } else if (e.target.matches('.auth-modal')) {
            closeAllModals();
        }
    });
    
    // Écouteurs pour les formulaires
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    const resetForm = document.getElementById('reset-password-form');
    if (resetForm) {
        resetForm.addEventListener('submit', handleResetPassword);
    }
    
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    
    const saveProfileButton = document.getElementById('save-profile');
    if (saveProfileButton) {
        saveProfileButton.addEventListener('click', saveUserProfile);
    }
}

/**
 * Ouvre une modale d'authentification
 * @param {string} modalId - L'ID de la modale à ouvrir
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        
        // Si c'est la modale de profil, charger les données utilisateur
        if (modalId === 'profile-modal' && currentUser) {
            updateProfileUI(currentUser);
        }
    }
}

/**
 * Ferme toutes les modales d'authentification
 */
function closeAllModals() {
    const modals = document.querySelectorAll('.auth-modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

/**
 * Gère la soumission du formulaire de connexion
 * @param {Event} e - L'événement de soumission
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorElement = document.getElementById('login-error');
    
    try {
        errorElement.textContent = '';
        await signInWithEmailPassword(email, password);
        closeAllModals();
    } catch (error) {
        let errorMessage = 'Une erreur est survenue lors de la connexion.';
        
        // Messages d'erreur personnalisés
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorMessage = 'Email ou mot de passe incorrect.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Trop de tentatives de connexion. Veuillez réessayer plus tard.';
        }
        
        errorElement.textContent = errorMessage;
    }
}

/**
 * Gère la soumission du formulaire d'inscription
 * @param {Event} e - L'événement de soumission
 */
async function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const passwordConfirm = document.getElementById('signup-password-confirm').value;
    const errorElement = document.getElementById('signup-error');
    
    // Vérifier que les mots de passe correspondent
    if (password !== passwordConfirm) {
        errorElement.textContent = 'Les mots de passe ne correspondent pas.';
        return;
    }
    
    try {
        errorElement.textContent = '';
        await signUpWithEmailPassword(email, password, name);
        closeAllModals();
    } catch (error) {
        let errorMessage = 'Une erreur est survenue lors de l\'inscription.';
        
        // Messages d'erreur personnalisés
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Cet email est déjà utilisé par un autre compte.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Le mot de passe est trop faible. Utilisez au moins 6 caractères.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'L\'adresse email n\'est pas valide.';
        }
        
        errorElement.textContent = errorMessage;
    }
}

/**
 * Gère la soumission du formulaire de réinitialisation de mot de passe
 * @param {Event} e - L'événement de soumission
 */
async function handleResetPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('reset-email').value;
    const errorElement = document.getElementById('reset-error');
    const successElement = document.getElementById('reset-success');
    
    try {
        errorElement.textContent = '';
        successElement.textContent = '';
        
        await auth.sendPasswordResetEmail(email);
        successElement.textContent = 'Un email de réinitialisation a été envoyé à votre adresse.';
        document.getElementById('reset-password-form').reset();
    } catch (error) {
        let errorMessage = 'Une erreur est survenue lors de l\'envoi de l\'email de réinitialisation.';
        
        // Messages d'erreur personnalisés
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'Aucun compte n\'est associé à cet email.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'L\'adresse email n\'est pas valide.';
        }
        
        errorElement.textContent = errorMessage;
    }
}

/**
 * Gère la déconnexion de l'utilisateur
 */
async function handleLogout() {
    try {
        await signOut();
        closeAllModals();
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
    }
}

/**
 * Met à jour l'interface du profil utilisateur
 * @param {Object} user - L'utilisateur actuellement connecté
 */
async function updateProfileUI(user) {
    if (!user) return;
    
    // Mettre à jour les informations de base
    document.getElementById('profile-name').textContent = user.displayName || 'Utilisateur';
    document.getElementById('profile-email').textContent = user.email;
    
    // Mettre à jour l'avatar
    const avatarImg = document.getElementById('user-avatar');
    if (user.photoURL) {
        avatarImg.src = user.photoURL;
    } else {
        avatarImg.src = 'img/default-avatar.svg';
    }
    
    try {
        // Charger les préférences utilisateur depuis Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            
            // Mettre à jour les langues d'apprentissage
            if (userData.preferences && userData.preferences.learningLanguages) {
                const languages = userData.preferences.learningLanguages;
                document.getElementById('learn-russian').checked = languages.includes('russian');
                document.getElementById('learn-armenian').checked = languages.includes('armenian');
            }
        }
    } catch (error) {
        console.error('Erreur lors du chargement des préférences utilisateur:', error);
    }
}

/**
 * Sauvegarde les préférences du profil utilisateur
 */
async function saveUserProfile() {
    if (!currentUser) return;
    
    try {
        // Récupérer les langues d'apprentissage sélectionnées
        const learningLanguages = [];
        if (document.getElementById('learn-russian').checked) {
            learningLanguages.push('russian');
        }
        if (document.getElementById('learn-armenian').checked) {
            learningLanguages.push('armenian');
        }
        
        // Mettre à jour les préférences dans Firestore
        await db.collection('users').doc(currentUser.uid).update({
            'preferences.learningLanguages': learningLanguages
        });
        
        // Afficher un message de succès
        alert('Vos préférences ont été enregistrées avec succès.');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des préférences:', error);
        alert('Une erreur est survenue lors de l\'enregistrement de vos préférences.');
    }
}

/**
 * Change l'avatar de l'utilisateur
 * Cette fonction est appelée par le bouton "Changer" dans le profil
 */
document.addEventListener('DOMContentLoaded', function() {
    const changeAvatarBtn = document.getElementById('change-avatar');
    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', function() {
            // Créer un input file invisible
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);
            
            // Déclencher le clic sur l'input
            fileInput.click();
            
            // Gérer le changement de fichier
            fileInput.addEventListener('change', async function() {
                if (fileInput.files.length > 0 && currentUser) {
                    try {
                        const file = fileInput.files[0];
                        
                        // Vérifier la taille du fichier (max 2MB)
                        if (file.size > 2 * 1024 * 1024) {
                            alert('L\'image est trop volumineuse. Veuillez choisir une image de moins de 2MB.');
                            return;
                        }
                        
                        // Référence au stockage Firebase
                        const storageRef = storage.ref(`users/${currentUser.uid}/avatar`);
                        
                        // Télécharger le fichier
                        const uploadTask = storageRef.put(file);
                        
                        // Gérer les événements de téléchargement
                        uploadTask.on('state_changed', 
                            // Progression
                            (snapshot) => {
                                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                console.log(`Téléchargement: ${progress}%`);
                            },
                            // Erreur
                            (error) => {
                                console.error('Erreur lors du téléchargement:', error);
                                alert('Une erreur est survenue lors du téléchargement de l\'image.');
                            },
                            // Succès
                            async () => {
                                // Obtenir l'URL de téléchargement
                                const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                                
                                // Mettre à jour le profil utilisateur
                                await currentUser.updateProfile({
                                    photoURL: downloadURL
                                });
                                
                                // Mettre à jour l'interface
                                document.getElementById('user-avatar').src = downloadURL;
                                document.querySelector('.user-avatar-small').src = downloadURL;
                                
                                alert('Votre avatar a été mis à jour avec succès.');
                            }
                        );
                    } catch (error) {
                        console.error('Erreur lors du changement d\'avatar:', error);
                        alert('Une erreur est survenue lors du changement d\'avatar.');
                    }
                }
                
                // Supprimer l'input file
                document.body.removeChild(fileInput);
            });
        });
    }
});
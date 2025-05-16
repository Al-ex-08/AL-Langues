# Intégration Firebase dans l'Application d'Apprentissage des Langues

Ce document explique comment l'intégration Firebase a été réalisée dans l'application d'apprentissage des langues russe et arménienne.

## Configuration Firebase

L'application utilise les services suivants de Firebase :

- **Authentication** : Pour la gestion des utilisateurs
- **Firestore** : Pour stocker les données de progression
- **Storage** : Pour héberger les fichiers audio et les ressources
- **Analytics** : Pour suivre l'utilisation de l'application

## Fichiers créés

Plusieurs fichiers ont été créés pour intégrer Firebase :

1. **`js/firebase-config.js`** : Configuration et initialisation de Firebase
2. **`js/auth.js`** : Fonctionnalités d'authentification et gestion des utilisateurs
3. **`js/firebase-storage.js`** : Gestion des ressources audio avec Firebase Storage
4. **`js/firebase-sync.js`** : Synchronisation des données de progression
5. **`firebase-rules.txt`** : Règles de sécurité pour Firestore et Storage

## Fonctionnalités implémentées

### Authentification

- Inscription avec email et mot de passe
- Connexion avec email et mot de passe
- Réinitialisation de mot de passe
- Profil utilisateur avec avatar personnalisable
- Préférences de langues d'apprentissage

### Stockage des données

- Sauvegarde des données de révision espacée
- Synchronisation des résultats de quiz
- Suivi de la progression des leçons
- Statistiques d'apprentissage

### Ressources audio

- Hébergement des fichiers audio dans Firebase Storage
- Préchargement des fichiers audio par catégorie
- Fallback vers les fichiers locaux en cas d'erreur

## Utilisation

### Pour les utilisateurs

1. Créez un compte en cliquant sur le bouton "Inscription"
2. Connectez-vous pour synchroniser vos données entre appareils
3. Vos progrès seront automatiquement sauvegardés

### Pour les administrateurs

1. Les utilisateurs avec le rôle "admin" peuvent télécharger de nouveaux fichiers audio et ressources
2. Utilisez les règles de sécurité dans `firebase-rules.txt` pour configurer Firebase

## Structure des données Firestore

```
users/
  {userId}/
    displayName: string
    email: string
    createdAt: timestamp
    preferences: {
      language: string
      learningLanguages: array
    }
    
    spacedRepetition/
      data: {
        cards: array
        nextReview: map
      }
      
    statistics/
      learning: {
        totalCards: number
        masteredCards: number
        lastSession: timestamp
        streak: number
      }
      
    quizResults/
      {language}_{quizType}: {
        results: object
        updatedAt: timestamp
      }
      
    progress/
      {language}_{lessonType}_{lessonId}: {
        progress: object
        updatedAt: timestamp
      }
```

## Mode hors ligne

L'application fonctionne également en mode hors ligne :

- Les données sont stockées localement avec `localStorage`
- Synchronisation automatique lorsque la connexion est rétablie
- Fusion intelligente des données locales et distantes

## Sécurité

Les règles de sécurité Firebase garantissent que :

- Les utilisateurs ne peuvent accéder qu'à leurs propres données
- Les fichiers audio et ressources sont accessibles publiquement en lecture seule
- Seuls les administrateurs peuvent modifier les ressources publiques
- Les avatars utilisateurs sont limités en taille et type de fichier
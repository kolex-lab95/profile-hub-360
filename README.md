# Portfolio Hub — CV Profile 360

Plateforme de portfolios étudiants et de découverte de talents construite pour le projet Frameworks Frontend ESMT/MISI-Soir.

## Démarrer

Pré-requis : Node.js 20+ et npm.

```bash
npm install
npm run dev
```

`npm run dev` démarre Vite et l’API REST simulée json-server. L’interface est habituellement disponible sur `http://localhost:5173`; Vite sélectionne le port suivant si celui-ci est déjà utilisé.

## Vérifier

```bash
npm run test
npm run build
```

## Comptes de démonstration

| Rôle | E-mail | Mot de passe |
| --- | --- | --- |
| Étudiante | `amel@portfolio.demo` | `demo123` |
| Étudiant | `yann@portfolio.demo` | `demo123` |
| Étudiante | `sarah@portfolio.demo` | `demo123` |
| Recruteuse | `elsa@talent.demo` | `demo123` |

## Architecture

- `src/components` : composants UI réutilisables, navigation et gardes de routes.
- `src/context` : session de démonstration, thème, données globales et notifications.
- `src/services` : client REST pour l’API simulée.
- `src/utils` : export PDF et calculs statistiques déterministes.
- `db.json` : données de démonstration initiales, servies par json-server.

Les sessions et la préférence de thème sont conservées dans le navigateur. Les opérations sur les projets, favoris et consultations sont persistées dans `db.json` par l’API de démonstration.

## Réinitialiser les données de démonstration

Après des essais de CRUD, restaurez `db.json` depuis Git :

```bash
git restore db.json
```

L’authentification est volontairement simulée côté frontend pour le contexte académique. Elle doit être remplacée par une authentification et des contrôles d’autorisation côté serveur pour tout usage en production.

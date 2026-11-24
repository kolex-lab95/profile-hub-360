# Portfolio Hub — CV Profile 360

Application React de portfolios étudiants et de découverte de talents, réalisée dans le cadre du module Frameworks Frontend ESMT/MISI-Soir.

## Fonctionnalités

### Espace étudiant

- Inscription, connexion et routes protégées.
- Création, édition, publication et suppression de projets.
- Couvertures de projets personnalisées persistées dans IndexedDB.
- Profil public, disponibilité professionnelle, statistiques et export PDF.

### Espace recruteur

- Recherche de talents par mot-clé, compétence et disponibilité.
- Consultation de portfolios, favoris et profils récemment visités.
- Messagerie privée avec les étudiants.

### Expérience commune

- Interface FR/EN, trois thèmes persistants et navigation responsive.
- Notifications, tableaux de bord, conseils et données de démonstration.

## Technologies

- React 19, Vite et React Router.
- Context API pour la session, le thème, les données et les notifications.
- Axios pour les appels REST centralisés.
- json-server pour l’API locale simulée.
- jsPDF pour les exports, IndexedDB pour les couvertures et Tailwind/PostCSS pour l’outillage de styles.
- Vitest et Testing Library pour les tests.

## Architecture

```text
src/
├── components/  # composants UI, navigation et gardes de routes
├── context/     # état global applicatif
├── data/        # contenus illustratifs publics
├── i18n/        # provider et catalogue FR/EN
├── services/    # client Axios et contrats REST
└── utils/       # logique métier pure : statistiques, favoris, PDF, etc.
scripts/         # initialisation reproductible des données de démonstration
db.json          # données json-server locales
```

Le client Axios utilise `VITE_API_URL` lorsqu’elle est définie. Sans variable, il appelle `/api`, proxyfié par Vite vers json-server local (`http://localhost:3001`). Les composants ne portent donc aucune URL d’API.

## Installation et lancement

Pré-requis : Node.js 20+ et npm.

```bash
npm install
npm run dev
```

`npm run dev` démarre Vite et json-server. Vite est habituellement disponible sur `http://localhost:5173` et sélectionne le port suivant s’il est déjà occupé.

Pour personnaliser l’URL de l’API, copiez `.env.example` vers `.env` et ajustez `VITE_API_URL`. La variable est publique côté Vite : elle ne doit jamais contenir de secret.

## Commandes utiles

```bash
npm run dev                 # interface et API locale
npm run dev:web             # interface Vite seule
npm run dev:api             # json-server seul, port 3001
npm run test                # tests automatisés
npm run build               # build de production
npm run preview             # aperçu du build
npm run seed:demo-recruiter # ajoute Nadia Faye sans écraser les données
```

## Comptes de démonstration

| Rôle | E-mail | Mot de passe |
| --- | --- | --- |
| Étudiante | `amel@portfolio.demo` | `demo123` |
| Étudiant | `yann@portfolio.demo` | `demo123` |
| Étudiante | `sarah@portfolio.demo` | `demo123` |
| Recruteuse | `elsa@talent.demo` | `demo123` |
| Recruteuse | `nadia@talent.demo` | `demo123` |

`npm run seed:demo-recruiter` est idempotente : Nadia Faye est ajoutée seulement lorsqu’elle est absente et une collision d’identifiant ou d’e-mail arrête l’opération.

## Données et limites

- `db.json` est une base locale de démonstration. Conservez une copie avant toute remise à zéro volontaire : cette opération efface les modifications locales.
- L’authentification et les autorisations sont simulées côté frontend pour le cadre académique. Une API de production nécessiterait une authentification et des contrôles côté serveur.
- Les couvertures personnalisées sont stockées localement dans le navigateur ; elles ne sont pas transférées par json-server.
- Le build actuel affiche un avertissement Vite sur la taille d’un chunk ; il reste fonctionnel et aucune optimisation de découpage n’a été introduite dans cette mission.

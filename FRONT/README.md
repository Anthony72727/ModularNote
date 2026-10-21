# ModularNote - Front

Client web de ModularNote, développé en React + TypeScript avec Vite.

## Architecture

Clean architecture côté web : les dépendances pointent vers le `domain`, qui ne dépend de rien.

```mermaid
flowchart LR
    P["presentation"] --> D["domain"]
    Da["data"] --> D
    Da -- "HTTP" --> API[(API ModularNote)]
```

| Dossier (`ModularNote/src/`) | Rôle |
|---|---|
| `presentation/` | Interface utilisateur |
| `domain/` | Cœur métier |
| `data/` | Accès aux données (appels à l'API) |
| `core/` | Éléments partagés |

## Commandes

Depuis `FRONT/ModularNote` :

```bash
npm install
npm run dev      # serveur de développement
npm run lint
npm run build
```

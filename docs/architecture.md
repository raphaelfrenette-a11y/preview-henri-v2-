# Henri V2 — Contrat de données

## Entités
- Groupe: `id`, `nom`, `degré`.
- Bloc annuel: `id`, `groupId`, `sport`, `sessionCount`, `ordre`.
- Séquence: `id`, `annualBlockId`, `groupId`, `sessions[]`.
- Séance: `id`, `sequenceId`, `index`, `titre`, `objectif`, `activités[]`.
- Période calendrier: `id`, `groupId`, `date`, `annualBlockId`, `sessionIndex`.

## Invariants
1. Une période du calendrier ne recopie pas le contenu d'une séance; elle ne contient qu'une référence.
2. L'ouverture d'un cours résout cette référence et ouvre la séance en édition.
3. Les séquences sont enregistrées de façon explicite, sans modifier la structure annuelle.
4. L'affectation à plusieurs groupes fabrique des copies indépendantes des séquences.
5. Les opérations sur plusieurs groupes sont validées avant toute mutation.
6. L'interface affiche un succès seulement après vérification de persistance.

## Tests d'acceptation prioritaires
1. Créer 2 groupes aux calendriers distincts.
2. Distribuer les blocs annuels, dont Ultimate 4 séances.
3. Générer et modifier les 4 séances d'Ultimate.
4. Enregistrer pour les deux groupes.
5. Recharger l'application, ouvrir le cours 3 dans chaque groupe : la séance 3 doit s'ouvrir.
6. Modifier la séance 3 du premier groupe, recharger et vérifier l'indépendance du second.
7. Vérifier qu'aucun cours annuel ne s'est déplacé.
8. Importer et modifier les autres fonctionnalités sans régression.

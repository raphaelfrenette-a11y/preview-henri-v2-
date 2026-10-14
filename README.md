# Henri V2 — Reconstruction sécurisée

Ce dépôt est réservé à la nouvelle version de Henri. L’application existante reste inchangée.

## Objectif
Conserver l’interface et les fonctionnalités validées, tout en reconstruisant un moteur cohérent pour les groupes, la planification annuelle, les séquences et le calendrier.

## Règles du moteur
- Chaque groupe possède sa planification annuelle indépendante.
- Chaque bloc annuel a un identifiant stable, un sport et un nombre fixe de séances.
- Une séquence est enregistrée explicitement sur un bloc annuel et un groupe.
- Le calendrier ouvre la séance exacte via groupe + bloc annuel + index de séance.
- Aucun bouton « enregistré » ne doit apparaître avant confirmation du stockage.
- Aucune planification ne doit être supprimée ou écrasée silencieusement.
- Les données de l’ancienne application ne doivent jamais être effacées.
- Les tests automatisés de sauvegarde, rechargement, lien et navigation devront réussir avant publication.

## Statut
Dépôt initialisé. **L’application V2 n’est pas encore prête pour les tests utilisateurs.**

Ne pas confondre cette phase avec une version fonctionnelle de Henri.

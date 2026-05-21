# Security Policy

## Signaler une vulnérabilité

La sécurité de la plateforme **Ressources Relationnelles** est prioritaire. Si vous découvrez une faille de sécurité (injection, élévation de privilège, fuite de données, contournement d'authentification, etc.), **ne créez pas d'issue publique** : utilisez le canal privé suivant.

### Procédure de signalement

1. Ouvrir un **Security Advisory privé** :
   [https://github.com/ressources-relationnelles-CESI-EFTEG/backend/security/advisories/new](https://github.com/ressources-relationnelles-CESI-EFTEG/backend/security/advisories/new)
2. Décrire :
   - Le type de vulnérabilité (injection SQL, élévation de privilège, fuite de données, etc.)
   - Le module et la route concernés (ex. `POST /auth/sign-in`)
   - Les étapes de reproduction
   - L'impact estimé
   - Une suggestion de correctif si possible

### Délais de réponse

| Sévérité | Première réponse | Correctif visé |
|----------|------------------|----------------|
| Critique (faille exploitable à distance, fuite de données, contournement d'authentification) | 24 h | 72 h |
| Élevée | 3 jours | 2 semaines |
| Modérée / faible | 1 semaine | Prochaine release |

### Versions supportées

Seule la branche `main` reçoit des correctifs de sécurité. Les versions taggées antérieures ne sont pas maintenues.

### Politique de divulgation

Nous suivons une **divulgation coordonnée** : la faille n'est rendue publique qu'après mise à disposition d'un correctif. Le déclarant est crédité dans l'avis de sécurité publié (CVE / GHSA), sauf demande contraire.

### Pour plus de détails

La matrice OWASP Top 10, la matrice des risques probabilité × impact, la conformité RGPD, la procédure de gestion de crise et la rotation des secrets sont documentées dans [`docs/SECURITY.md`](./docs/SECURITY.md).

# E-mails de réservation (Resend) — guide de mise en production

Ce document explique **comment fonctionnent les e-mails du site** et **ce que tu
dois faire le jour de la mise en ligne** pour que tout soit parfait. C'est écrit
pour être compris **sans connaissances techniques**.

> 🔴 **À faire avant la mise en prod (demain).** Tant que ces étapes ne sont pas
> faites, **seul `bsb95149@gmail.com` reçoit des e-mails** — le client, lui, ne
> reçoit RIEN. C'est la limite du mode test de Resend, pas un bug.

---

## 1. Comment ça marche aujourd'hui

Le site envoie **deux e-mails automatiques** via un service appelé **Resend** :

| E-mail | Quand | Vers qui |
|---|---|---|
| **Nouvelle demande** | un client envoie une demande de location | l'agence (`BOOKING_NOTIFICATION_EMAIL`) |
| **Réservation confirmée** | l'admin clique « Confirmer » dans le back-office | le **client** |

Aujourd'hui, le compte Resend est en **mode test** : le domaine n'est pas encore
vérifié. En mode test, **Resend refuse d'écrire à quelqu'un d'autre que toi**
(`bsb95149@gmail.com`). C'est pour ça que :

- ✅ l'e-mail « nouvelle demande » arrive (il va vers ta boîte) ;
- ❌ l'e-mail « confirmation client » n'arrive pas (il va vers le client → bloqué
  par Resend avec une erreur `403 : you can only send testing emails to your own
  email address`).

**La solution est la même que celle exigée pour la prod : vérifier le domaine.**

---

## 2. Ce que tu dois faire — pas à pas (≈ 15 min + attente DNS)

### Étape A — Vérifier le domaine `prestige-avenue.fr` sur Resend

1. Va sur **resend.com/domains** → bouton **« Add Domain »**.
2. Saisis **`prestige-avenue.fr`** → valide.
3. Resend affiche **3 enregistrements DNS** à ajouter (type `TXT` et `MX`, pour
   « SPF » et « DKIM » — ce sont les preuves que tu as le droit d'envoyer depuis
   ce domaine).

### Étape B — Ajouter ces enregistrements DNS chez OVH

> ⚠️ C'est la **zone DNS** du domaine, **PAS** l'onglet « Emails ». La zone DNS
> est autorisée même si la création de boîte mail t'est bloquée.

1. Manager OVH → **Noms de domaine** → `prestige-avenue.fr` → onglet **« Zone DNS »**.
2. Pour **chaque** ligne donnée par Resend : bouton **« Ajouter une entrée »**,
   choisis le **type** (TXT ou MX), copie-colle **exactement** le nom et la
   valeur fournis par Resend.
3. Enregistre.
4. Retourne sur Resend → bouton **« Verify »**. La vérification peut prendre de
   quelques minutes à quelques heures (propagation DNS). Quand le domaine passe
   au statut **« Verified » ✅**, tu peux envoyer à n'importe qui.

### Étape C — Changer l'adresse d'expéditeur du site

Une fois le domaine vérifié, l'expéditeur doit utiliser **ce domaine** (sinon
Resend refuse). Dans les variables d'environnement de production (voir §3) :

```
EMAIL_FROM="Prestige Avenue <contact@prestige-avenue.fr>"
```

> Tu peux mettre `contact@`, `reservations@`, `no-reply@`… ce que tu veux **du
> moment que ça finit par `@prestige-avenue.fr`**. Cette adresse n'a pas besoin
> d'être une vraie boîte mail : c'est juste l'identité d'envoi.

### Étape D — Régénérer la clé API (sécurité — important)

La clé API actuelle a été enregistrée dans l'historique du code : elle est
**compromise** et doit être remplacée.

1. resend.com → **API Keys** → supprime l'ancienne clé.
2. **« Create API Key »** → permission **« Sending access »** → copie la nouvelle
   clé (commence par `re_`).
3. Mets cette nouvelle valeur dans `RESEND_API_KEY` en production (§3).

---

## 3. Les 3 variables à mettre en production (sur OVH)

Dans l'hébergement OVH, section **variables d'environnement** du site, mets :

```
RESEND_API_KEY="re_..."                                  # la NOUVELLE clé (étape D)
EMAIL_FROM="Prestige Avenue <contact@prestige-avenue.fr>"# domaine vérifié (étape C)
BOOKING_NOTIFICATION_EMAIL="contact@prestige-avenue.fr"  # où l'agence reçoit les demandes
```

> `BOOKING_NOTIFICATION_EMAIL` = l'adresse **que l'agence consulte** pour voir les
> nouvelles demandes. Mets l'e-mail réel de l'agence (ça peut rester une Gmail si
> l'agence préfère ; le client ne le voit jamais).

⚠️ **N'écris jamais ces valeurs dans le code ni dans `.env.example`** (qui est
public). Uniquement dans les variables d'environnement de l'hébergeur.

---

## 4. Vérifier que tout marche (1 min, après mise en prod)

1. Fais une **fausse demande** sur le site avec une adresse e-mail à toi
   (différente de l'agence) → tu dois recevoir **« réservation confirmée »**
   après que l'admin l'a confirmée.
2. L'agence doit recevoir **« nouvelle demande »**.

Si un e-mail n'arrive pas : regarde **resend.com → Logs**. Chaque envoi y figure
avec son statut (`delivered`, `bounced`…). C'est l'endroit de référence pour
diagnostiquer.

---

## 5. Filet de sécurité (déjà en place dans le code)

Un e-mail qui échoue **ne bloque jamais** le site :

- si l'envoi rate, la demande de réservation est **quand même** enregistrée ;
- la confirmation par l'admin **aboutit quand même** ;
- l'erreur est seulement écrite dans les logs du serveur.

Autrement dit : même si Resend a un souci un jour, **aucune réservation n'est
perdue**. La contrepartie est qu'il faut surveiller les logs Resend de temps en
temps après le lancement.

---

## Récapitulatif express

| # | Action | Où |
|---|---|---|
| A | Ajouter le domaine `prestige-avenue.fr` | resend.com/domains |
| B | Coller les 3 enregistrements DNS, puis « Verify » | OVH → Zone DNS |
| C | `EMAIL_FROM` avec une adresse `@prestige-avenue.fr` | env. prod OVH |
| D | Régénérer la clé API et la mettre en prod | resend.com + env. prod OVH |
| E | Renseigner `BOOKING_NOTIFICATION_EMAIL` (e-mail agence) | env. prod OVH |
| F | Tester une demande + une confirmation | le site en ligne |

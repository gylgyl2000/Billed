
## L'architecture du projet :
Ce projet, dit frontend, est connecté à un service API backend que vous devez aussi lancer en local.


### Clonez le projet frontend dans le dossier bill-app :
```
$ git clone https://github.com/gylgyl2000/Billed.git
```

```
billed/
   - Billed-Back
   - Billed-Front
```

## Comment lancer l'application en local ?

### étape 1 - Lancer le backend :

Suivez les indications dans le README du projet backend.

### étape 2 - Lancer le frontend :

Allez au repo cloné :
```
$ cd Billed-Front
```

Installez les packages npm (décrits dans `package.json`) :
```
$ yarn install
```

Installez live-server pour lancer un serveur local :
```
$ yarn global add live-server
```

Lancez l'application :
```
$ live-server
```

Puis allez à l'adresse : `http://127.0.0.1:8080/`


## Comment lancer tous les tests en local avec Jest ?

```
$ yarn run test
```

## Comment lancer un seul test ?

Installez jest-cli :

```
$ yarn global add jest-cli
$ jest src/__tests__/your_test_file.js
```

## Comment voir la couverture de test ?

`http://127.0.0.1:8080/coverage/lcov-report/`

## Comptes et utilisateurs :

Vous pouvez vous connecter en utilisant les comptes:

### administrateur : 
```
utilisateur : admin@test.tld 
mot de passe : admin
```
### employé :
```
utilisateur : employee@test.tld
mot de passe : employee
```

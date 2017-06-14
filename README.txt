Site web prototype données Bluetooth MTQ
Réalisé par:
David St-Pierre, stagiaire MTQ
Yawo Bosso, stagiaire MTQ
Été 2016

Ce site web prototype a pour but de présenter le potentiel des données Bluetooth du MTQ. Le dossier ProjetMTQ représente le  "root" du site web. Le dossier BD présente divers fichiers pouvannt aider a recréer les BD utilisées dans le projet (scripts et autres). 

Le site est séparé en 4 parties:
-Carte
-Données
-Utilitaire distance
-À Propos

***CARTE****
La partie "Carte" du site web présente une petite "single page application". Elle permet de visualiser l'état du traffic actuel à l'aide des cartes et des informations des panneaux de contrôle. Les données sont mises à jour chaque 20sec, et peuvent être mises à jour manuellement à l'aide du bouton "Rafraichir". Les mises à jour ajustent les couleurs des paires sur les cartes et les informations de vitesse et de temps de parcours spécifiques à chaque paires et itinéraires. Les données de vitesses et de temps de parcours sont calculées à partir des données des 5 dernières minutes fournies par le backend qui communique avec les bases de données. Lorsque aucune données n'est disponible pour les 5 dernières minutes pour une paire, 
cette dernière s'affiche en gris sur la carte et présente des vitesse et temps de parcours non-disponible ("ND").À noter que 
les données des base de données sont bidons (elles ne représentent pas des données réelles captées par les capteurs Bluetooth). 

Des requêtes d'itinéraires sont effectuées à Google pour afficher un ligne de couleur spécifique à chaque paire sur les cartes. À noter que les requêtes Google peuvent prendre beaucoup de temps lors du chargement de la page lorsque le nombre de requête a effectuer dépasse 10 (environ 1sec par requête supplémentaire). Ceci est dû à une limite de requête que Google impose à ses utilisateurs (10 requêtes/s). 

L'application est séparée en deux onglets qui présentent chacun leur propre carte et leur propre contenu de panneau de contrôle.

L'onglet "Réseau" permet de visualiser l'ensemble ou une partie des paires de la base de données sur la carte. Un survol de la souris sur les paires  de la carte permet de faire apparaitre une fenetre d'information présentant les caractéristiques de la paire: origine, destination, distance, vitesse médiane et temps de parcours. Le panneau de contrôle permet de désactiver certaines paires pour épurer la carte et consulter ainsi plus facilement les paires qui intéressent l'utilisateur.

L'onglet Itinéraire permet de sauvegarder des itinéraires à partir des itinéraires prédéterminé dans la base de données ou à partir d'itinéraiire construits sur mesure par l'utilisateur. L'utilisateur peut "ajouter" l'itinéraire prédéfini ou sur mesure, ce qui permet sa sauvegarde dans la section "Visualiser les itinéraires ajoutés" ainsi qu'en localStorage (mémoire interne du navigateur). La section "Visualiser les itinéraires ajoutés" permet de consulter et de comparer les données des différents itinéraires ajoutés. L'utilisateur peut aussi y afficher les itinéraire un à un sur la carte. La sauvegarde en 
localStorage permet de conserver les itinéraires ajoutés par l'utilisateur lorsque la page est rechargée.



****DONNÉES***
Présentation de données sauvegardées permettant des analyses approfondies du réseau de transport et génération de rapport.
Non-débuté par manque de temps.



***UTILITAIRE DISTANCE****
Utilitaire permettant de calculer au mètre près la distance entre deux points(latitude, longitude) sur le réseau routier.
Nécessaire pour saisir les données de distance dans les bases de données.


****A PROPOS****
Présentation d'infos diverses sur le site et son utilisation. Devrait être complété d'info pertinentes. Le temps manquait.
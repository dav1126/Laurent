Site web prototype donn�es Bluetooth MTQ
R�alis� par:
David St-Pierre, stagiaire MTQ
Yawo Bosso, stagiaire MTQ
�t� 2016

Ce site web prototype a pour but de pr�senter le potentiel des donn�es Bluetooth du MTQ. Le dossier ProjetMTQ repr�sente le  "root" du site web. Le dossier BD pr�sente divers fichiers pouvannt aider a recr�er les BD utilis�es dans le projet (scripts et autres). 

Le site est s�par� en 4 parties:
-Carte
-Donn�es
-Utilitaire distance
-� Propos

***CARTE****
La partie "Carte" du site web pr�sente une petite "single page application". Elle permet de visualiser l'�tat du traffic actuel � l'aide des cartes et des informations des panneaux de contr�le. Les donn�es sont mises � jour chaque 20sec, et peuvent �tre mises � jour manuellement � l'aide du bouton "Rafraichir". Les mises � jour ajustent les couleurs des paires sur les cartes et les informations de vitesse et de temps de parcours sp�cifiques � chaque paires et itin�raires. Les donn�es de vitesses et de temps de parcours sont calcul�es � partir des donn�es des 5 derni�res minutes fournies par le backend qui communique avec les bases de donn�es. Lorsque aucune donn�es n'est disponible pour les 5 derni�res minutes pour une paire, 
cette derni�re s'affiche en gris sur la carte et pr�sente des vitesse et temps de parcours non-disponible ("ND").� noter que 
les donn�es des base de donn�es sont bidons (elles ne repr�sentent pas des donn�es r�elles capt�es par les capteurs Bluetooth). 

Des requ�tes d'itin�raires sont effectu�es � Google pour afficher un ligne de couleur sp�cifique � chaque paire sur les cartes. � noter que les requ�tes Google peuvent prendre beaucoup de temps lors du chargement de la page lorsque le nombre de requ�te a effectuer d�passe 10 (environ 1sec par requ�te suppl�mentaire). Ceci est d� � une limite de requ�te que Google impose � ses utilisateurs (10 requ�tes/s). 

L'application est s�par�e en deux onglets qui pr�sentent chacun leur propre carte et leur propre contenu de panneau de contr�le.

L'onglet "R�seau" permet de visualiser l'ensemble ou une partie des paires de la base de donn�es sur la carte. Un survol de la souris sur les paires  de la carte permet de faire apparaitre une fenetre d'information pr�sentant les caract�ristiques de la paire: origine, destination, distance, vitesse m�diane et temps de parcours. Le panneau de contr�le permet de d�sactiver certaines paires pour �purer la carte et consulter ainsi plus facilement les paires qui int�ressent l'utilisateur.

L'onglet Itin�raire permet de sauvegarder des itin�raires � partir des itin�raires pr�d�termin� dans la base de donn�es ou � partir d'itin�raiire construits sur mesure par l'utilisateur. L'utilisateur peut "ajouter" l'itin�raire pr�d�fini ou sur mesure, ce qui permet sa sauvegarde dans la section "Visualiser les itin�raires ajout�s" ainsi qu'en localStorage (m�moire interne du navigateur). La section "Visualiser les itin�raires ajout�s" permet de consulter et de comparer les donn�es des diff�rents itin�raires ajout�s. L'utilisateur peut aussi y afficher les itin�raire un � un sur la carte. La sauvegarde en 
localStorage permet de conserver les itin�raires ajout�s par l'utilisateur lorsque la page est recharg�e.



****DONN�ES***
Pr�sentation de donn�es sauvegard�es permettant des analyses approfondies du r�seau de transport et g�n�ration de rapport.
Non-d�but� par manque de temps.



***UTILITAIRE DISTANCE****
Utilitaire permettant de calculer au m�tre pr�s la distance entre deux points(latitude, longitude) sur le r�seau routier.
N�cessaire pour saisir les donn�es de distance dans les bases de donn�es.


****A PROPOS****
Pr�sentation d'infos diverses sur le site et son utilisation. Devrait �tre compl�t� d'info pertinentes. Le temps manquait.
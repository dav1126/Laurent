(function()
 {
    /*use strict permet de détecter et d'afficher plus d'erreurs*/  
    "use strict";
    
    var carteReseau;//Variable qui représente la google map du réseau
    var carteItineraire; // Variable qui représente la google map des itinéraires
    var cartesArray = [];//Array stockant les cartes
    var carteActive;//Indique quelle carte est active (quel onglet est choisi par l'utilisateur)
    
    var directionsService;//sert à faire des requête à Google pour obtenir des itineraires
    
    var reseauDivContent;//Variable conteneur pour recuperer et stocker le contenu du panneau de controle de la carte reseau
    var itinerairesDivContent;//Variable conteneur pour recuperer et stocker le contenu du panneau de controle de la carte itineraire
    
    var requestArray=[];//Array de requete Google d'itineraire (pour les paires)
    var renderArray=[];//Array qui contient les objets Google utilisés pour l'affichage des résultats de requêtes d'itinéraires sur les cartes
    var renderItineraireArray = [];//Array d'affichage d'itineraire sur la carteItineraire
    var renderReseauArray = [];//Array d'affichage d'itineraire suir la carteReseau
    var polylineForSelectSelectedArray = []//Array qui contient les paires sélectionnés par l'utilisateur (par un clic de souris)
    var pairesDeRequeteArray=[];//Array des paires spécifiques utilisées dans chaque requête d'itinéraire à Google. Format JSON. 
    var polylineForHoverArray = [];//Array de polylines utilisés pour simuler les events hover de souris sur les itinéraires
    var polylineForHoverItineraireArray = [] //Array de polylines utilisés pour simuler les events hover de souris sur les itinéraires de la carteItineraire
    var polylineForSelectArray = [];//Array stockage de polylines utilisés pour simuler les events de sélection par un clic de souris sur les itinéraires
    var indexDesPairesDeItineraireSelectionneArray = [];//Sert a stocker les index des paires qui forment l'itinéraire sélectionné par l'utilisateur (prédéfini ou sur mesure)
    var itinChoisiArray = [];//Liste de listes d'index de pairesData formant les itinéraires choisis
    var requestPointer=0;//Pointeur utilisé  pour indiquer la requête actuelle
    var renderPointer=0;//Pointeur utilisé  pour indiquer le render  actuel
    var renderItinerairePointer=0;//Pointeur utilisé pour indiquer le render actuel
    
    var randomVitesse=0; //utilisée pour générer des vitesses bidon, à supprimer lorsque le backend php fournira les vitesses***********************
    
    var requetesGoogleTerminees = false; //Boolean indiquant si les requêtes à l'API de Google sont terminées
    
    var checkboxElementArray = [];
    
    var infoWindowItineraire; //Fenetre d'info qui affiche lorsqu'on hover un itineraire
    
    var delaiAttente = 0;//Temps en milliseconde à attendre avant une prochaine requête à Google lorsque le nombre maximum de requête par seconde est atteint
    var delaiAttenteIncrement = 200; //Valeur d'incrementation du temps d'attente
    
    var date1; //date pour fin de test de performance
    var date2; //date pour fin de test de performance
    
    var originesArray = []; //Liste d'origines d'itineraires possibles
    var destArray = []; //Liste de destinations d'itineraires possibles
    
    var aucunResultatDiv;//Div à ajouter au besoin si le tri fait par l'usager ne donne lieu à aucun résultat
    
    var itinSortedByDescriptionsArray = [];//liste d'itinéraires triée par ordre alphanumérique
    var itinSelectionnePolyForHoverArray = []//Stocke les polylineForHover de l'itinéraire sélectionné par l'utilisateur
    var itinSelectionneRenderArray = []//Stocke les render de paires  sélectionné par l'utilisateur
    var clickDeselectionParUtilisateur = true;//boolean qui indique si le trigger d'un evenement est un click de l'utilisateur (true) ou une fonction click() appelée dans le code (false)
    
    var itinSurMesureData = [];//Sert a stocker les paires que l'utilisateur sélectionne. Même format de données que pairesData
    
    var localStorageDejaCharge = false;//Sert a indiquer que les donnees du programme ont deja été chargées
    
    var intervalleMiseAJour = 10000 //Nombre de milliseconde entre les mises a jour automatique des donnees
    var miseAJourFunction = null; //Variable qui pointe sur la fonction de mise a jour automatique des données
    
    //Liste d'objets JSON qui représente les données des capteurs Bluetooth utilisées pour afficher les capteurs sur les cartes.
    var capteursData = null;
    //Format de données de la variable capteursData (a titre indicatif, donnes bidons)
    /*var capteursData = 
    [ 
        {
           idCapteur:"BT02",
           lat: 46.831392,
           lng: -71.278246,
           description: "40 - Pierre-Bertrand"
        },
        {
           idCapteur:"BT03",
           lat: 46.838589,
           lng: -71.320135,
           description: "740 - Comptoise"  
        },
        {
           idCapteur:"BT04",
           lat: 46.846872,
           lng: -71.274691,
           description: "73 - Lebourgneuf"  
        }    
    ]*/
    
    //Liste d'objets JSON qui représente les paires de markersGoogle qui doivent être utilisés pour générer les requêtes d'itinéraires à Google. Au format JSON.
    var pairesData = null;
    //Format de données de la variable pairesData (a titre indicatif, donnes bidons)
  /*  var pairesData =
      [
        {
           idPaire: 1,    
           orig: {
              lat: 46.831235,
              lng: -71.278209,
              description: "40 O - Pierre-Bertrand",
              idMarker: "1",
              idCapteur:"1",    
           },
           dest: {
              lat: 46.8388,
              lng: -71.3204,
              description: "740 N - Comptoise",
              idMarker: "2",   
              idCapteur:"BT02",
           },
           distance: 2.331, 
           vitesseMed: 90,
           tempsParcours: 0.214    
        },
        {
           idPaire: 2,    
           orig: {
              lat: 46.846917,
              lng: -71.274563,
              description: "73 S - Lebourgneuf",
              idMarker: "16",
              idCapteur:"6",
              noRoute: 40
           },    
           dest: {
              lat: 46.831235,
              lng: -71.278209,
              description: "40 E - Pierre-Bertrand",
              idMarker: "1",
              idCapteur:"1",
              noRoute: 40   
           },
           distance: 1.493, 
           vitesseMed: 45,
           tempsParcours: 0.114    
        },
        .
        .
        .
    ];*/
    
    //Liste d'objets qui représente les itinéraires prédéfinis enregistrés en BD. Au format JSON.
    var itinerairesData = null;
    //Format de données de la variable pairesData (a titre indicatif, donnes bidons)
    /*var itinerairesData = 
    [
        {
            idItineraire: 1,
            description: "Laurentienne sud vers Henri Bourassa Nord",
            vitesseMoy: 84,
            distance: 6.456,
            tempsParcours: 0.234,
            paires: 
            [
                {
                    idPaire: 1,    
                    orig: 
                    {
                      lat: 46.831235,
                      lng: -71.278209,
                      description: "40 O - Pierre-Bertrand",
                      idMarker: "1",
                      idCapteur:"1",    
                    },
                   dest: 
                   {
                      lat: 46.8388,
                      lng: -71.3204,
                      description: "740 N - Comptoise",
                      idMarker: "2",   
                      idCapteur:"BT02",
                   },
                   distance: 2.331,
                   vitesseMed: 86,
                   tempsParcours: 0.167    
                }
                ,
                {
                   idPaire: 2,    
                   orig: {
                      lat: 46.846917,
                      lng: -71.274563,
                      description: "73 S - Lebourgneuf",
                      idMarker: "16",
                      idCapteur:"6",
                      noRoute: 40
                   },    
                   dest: {
                      lat: 46.831235,
                      lng: -71.278209,
                      description: "40 E - Pierre-Bertrand",
                      idMarker: "1",
                      idCapteur:"1",
                      noRoute: 40   
                   },
                   distance: 1.493,
                   vitesseMed: 78,
                   tempsParcours: 0.067    
                }
            ]
        },
        {
            idItineraire: 2,
            description: "740 sud vers 73 Nord vers 40-E",
            vitesseMoy: 82,
            distance: 10.456,
            tempsParcours: 0.456,
            paires: 
            [
                {
                   idPaire: 5,    
                   orig: {
                      lat: 46.831132,
                      lng: -71.278134,
                      description: "40 E- Pierre-Bertrand",
                      idMarker: "19",
                      idCapteur:"19", 
                   },
                   dest: {
                      lat:46.847082,
                      lng: -71.274231,
                      description: "73 N - Atrium",
                      idMarker: "6",    
                      idCapteur:"6",
                   },
                   distance: 4.345,
                   vitesseMed: 50,
                   tempsParcours: 0.123    
                },
                {
                   idPaire: 6,        
                   orig: {
                      lat: 46.838655,
                      lng: -71.320471,
                      description: "Robert-Bourassa - Comptoise",
                      idMarker: "45",
                      idCapteur:"2", 
                   },
                   dest: {
                      lat: 46.831132,
                      lng: -71.278134,
                      description: "40 E - Pierre-Bertrand",
                      idMarker: "19",
                      idCapteur:"19",
                   },
                   distance: 3.833,
                   vitesseMed: 75,
                   tempsParcours: 0.111    
                },
                {
                    idPaire: 3,    
                    orig: {
                      lat:46.843438,
                      lng:-71.250130,
                      description: "40 E - 1ere ave",
                      idMarker: "7",    
                      idCapteur:"7",
                      noRoute: 40    
                   },
                   dest: {
                      lat:46.847082,
                      lng: -71.274231,
                      description: "73 N - Atrium",
                      idMarker: "6",    
                      idCapteur:"6",
                   },
                   distance: 1.856,
                   vitesseMed: 88,
                   tempsParcours: 0.111    
                }
            ] 
        }
            
    ];*/
    
 //lorsque la page est lodée, appeler la methode initialiserMap   
google.maps.event.addDomListener(window, 'load', initialiserMap);  
    
    /*Cette fonction sert à initialiser les cartes et les différetes composantes de la page*/
    function initialiserMap() 
    { 
        var startCoord = new google.maps.LatLng(46.807435, -71.238653);//On utilise ici les coordonnées de la ville de Québec
        
        //objet contenant des propriétés avec des identificateurs prédéfinis dans Google Maps permettant
        //de définir des options d'affichage de notre carte
        var mapOptions = 
        {
            center: startCoord,//coordonnées sur laquelle la carte est centrée lors de son affichage
            zoom: 12,//niveau de zoom de la carte
            mapTypeId: google.maps.MapTypeId.ROADMAP,//type de carte google
            streetViewControl: false,//desactive google street view sur la carte
            mapTypeControl: false,//desactive le choix du type de carte (plan ou satellite)
        };

        //constructeur de la carte qui prend en paramêtre le conteneur HTML
        //dans lequel la carte doit s'afficher et les options
        var mapReseauDiv =  document.querySelector("#carteReseauDiv");
        carteReseau = new google.maps.Map(mapReseauDiv, mapOptions);
        cartesArray.push(carteReseau);
        var mapItineraireDiv =  document.querySelector("#carteItineraireDiv");
        carteItineraire = new google.maps.Map(mapItineraireDiv, mapOptions);
        cartesArray.push(carteItineraire);
        mapItineraireDiv.style.zIndex = "-1";
        carteActive = carteReseau;
        
        //initialiser le service de direction, utilisée pour les faire les requete d'itinéraire entre deux points a Google
        directionsService = new google.maps.DirectionsService();
        
        // Appel de la méthode pour loader les capteurs sur les cartes
        getDonneesCapteurs();
        
        //Appel de la méthode pour loader les donnees initiales des paires et des itinéraires, a partir du backend
        mettreAJourLesDonnees();
        
        //Instancier l'infoWindowItineraire (fenetre)
        infoWindowItineraire = new google.maps.InfoWindow({
            pixelOffset: new google.maps.Size(0,-20),//Pour déplacer la fenêtre d"info vers le haut de quelques pixels, autrement la fenêtre est dans le chemin du curseur lorsqu'on le bouge sur un itineréraire et ca déclenche l'event mouseout des polylines d'itinéraires
            disableAutoPan: true
        });
        
        instancierAucunResultatDiv();
        rafraichirBtn.disabled = true; //Désactiver le bouton tant que les requêtes Google ne sont pas complétées
        rafraichirBtn.onclick = mettreAJourLesDonnees;
        panneauDeControleContentDiv.style.display = "none";//Tant que les requêtes ne sont pas terminées, le contenu du panneau de contrôle est invisible   
    }
    
    //Function qui sert a afficher un message par defaut lorsqu'il n'y a aucun itineraire de trouvé selon les filtres de recherche appliqué par l'utilisateur
    function instancierAucunResultatDiv()
    {
        aucunResultatDiv = document.createElement("div");
        aucunResultatDiv.setAttribute("class", "aucunResultat");
        var texte =  document.createTextNode("Aucun résultat");
        aucunResultatDiv.appendChild(texte);
    }
    
    //Cette fonction sert a créer et afficher les capteurs bluetooth et leurs infosWindows (fenetre d'info qui ouvre lorsqu'on clique sur un marker)
    function afficherCapteursBT()
    {
        //créer l'icone utilisée pour les markers bluetooth
        var image = 
        {
            url:'../../images/bluetoothMarker.png', // url
            scaledSize: new google.maps.Size(20, 20), // scaled size
            origin: new google.maps.Point(0,0), // origin
            anchor: new google.maps.Point(10, 10) // anchor
        };
        
        
        for (let capteur of capteursData)
        {
             //pour chaque carte
            for (var i = 0; i < cartesArray.length; i++)
            {              
               let latlng = new google.maps.LatLng(capteur.lat, capteur.lng);
               let description = capteur.description;
               let idCapteur = capteur.idCapteur;
               let idMarker = capteur.idMarker;   
                
               //créer un marker google pour le capteur    
               let marker = new google.maps.Marker(
               {
                  map: cartesArray[i],
                  position: latlng,
                  title: description,
                  icon: image
               });

               let infoWindow = new google.maps.InfoWindow();
               //Événement qui ferme la fenêtre d'info lorsqu'on clique sur la carte
               google.maps.event.addListener(cartesArray[i], 'click', function() 
               {
                  infoWindow.close();
               });   

               //Evenement de click sur un marker qui fait afficher la fenetre d'information  
               google.maps.event.addListener(marker, 'click', function() 
               {
                    let infoWindowContent = '<div id="infoWindow">' + '<div class="infoWindow_titre">Capteur BT</div>' +
                    '<div class="infoWindow_desc">' + description + '</div>' +
                    '<div class="infoWindow_contenu"> id Capteur BT: ' + idCapteur + '</div></div>';    
                    infoWindow.setContent(infoWindowContent);
                    infoWindow.open(cartesArray[i], marker);
               });      
            }
        }
    }
    
    //Cette fonction sert a préparer les requêtes d'intinéraires pour l'API de google et à les stocker dans une liste
    function genererItineraires()
    {
        //pour toutes les paires
        for (let paire of pairesData)
        {
            //definir l'origine et la destination
            var origine = new google.maps.LatLng(paire.orig.lat, paire.orig.lng);
            var destination = new google.maps.LatLng(paire.dest.lat, paire.dest.lng);
            
            //creer la requete google
            var request = 
            {
              origin: origine,
              destination: destination,
              travelMode: google.maps.TravelMode.DRIVING,
            };
            //ajouter la requete a la liste des requete
            requestArray.push(request);
            //ajouter la paire a la liste des paires
            pairesDeRequeteArray.push(paire);
        }
        //s'il y a au moins une requete dans la liste
        if (requestArray.length > 0)
        {
            //afficher l'heure de debut des requete en console
            date1 = new Date();
            console.log("Début des requêtes d'itinéraires à Google");
            //effectuer la 1ere requete a Google
            directionsService.route(requestArray[requestPointer], afficherItineraire);
        }                
    }
    
    //Fonction recursive qui est utilisée comme callback après une requête Direction à Google. La récursivité et la sauvegarde des objets DirectionsRenderer dans renderArray[] et est nécessaire pour afficher plusieurs paires sur une même carte.
    function afficherItineraire(result, status)   
    {             
        //si la requete d'itineraire a Google s'est déroulée sans problème
        if (status == google.maps.DirectionsStatus.OK) 
        {    
            //pour toutes les cartes
            for (var i = 0; i < cartesArray.length; i++)
            {     
                renderArray[renderPointer] = new google.maps.DirectionsRenderer();//l'objet DirectionsRenderer sert a afficher l'itineraire sur la carte. On le stocke dans un array contenant tous les objets de ce type
                renderArray[renderPointer].setDirections(result);//indiquer le chemin que le directionRenderer doit suivre sur la carte
                
                //si la carte n'est pas la carteItineraire, on n'affiche la paire (on n'affiche pas les paires par defaut sur la carteItineraire)
                if (cartesArray[i] !== carteItineraire)
                {
                    renderArray[renderPointer].setMap(cartesArray[i]);//afficher l'objet renderer sur la carte désirée
                }
                
                //Stocker l'objet renderer dans l'array de la carte correspondant
                if (cartesArray[i] === carteReseau)
                {
                    renderReseauArray.push(renderArray[renderPointer]);
                }
                else if (cartesArray[i] === carteItineraire)
                {
                    renderItineraireArray.push(renderArray[renderPointer]);
                }                
                
                //definir la couleurDuTroncon a partir de la vitesse de la paire
                let vitesseMed = pairesData[requestPointer].vitesseMed;
                let couleurDuTroncon = getCouleurDePaire(vitesseMed);
                
                //option d'affichage du troncon
                renderArray[renderPointer].setOptions(
                {
                    'suppressMarkers':true,//ne pas montrer les markers d'origine et depart
                    preserveViewport: true, 
                    polylineOptions: 
                    {
                        strokeColor: couleurDuTroncon,//couleur du troncon
                        strokeOpacity: 0.8//opacité du troncon
                    }
                });
                
                //si la carte est la carteItineraire
                if (cartesArray[i] === carteItineraire)
                {
                    //creer un polyline qui sert a la selection du troncon lors d'un click utilisateur
                    creerPolylineForSelect(renderArray[renderPointer]);
                }
                
                //creer un polyline (polylineForHover) qui sert a simuler les evenements de hover de souris sur chaque troncon (les ecouteurs d'evenement ne peuvent etre appliqué directement sur les troncons DirectionRenderer de google)
                creerPolylineForHover(renderArray[renderPointer], vitesseMed, couleurDuTroncon, cartesArray[i]);
                //si la carte est carteReseau
                if (cartesArray[i] === carteReseau)
                {
                    //creer un checkbox spécifique au troncon dans le panneau de controle
                    creerCheckboxPanneauDeControle(renderArray[renderPointer], polylineForHoverArray[renderPointer]);
                }
                renderPointer++;
            }
            
            requestPointer++;
            //si le pointer de requete est plus petit que la longueur du array de requete (signifie qu'il reste des requetes d'itineraire a effectuer a Google)
            if (requestPointer<requestArray.length)
            {
                //effectuer la prochaine requete d'itineraire
                directionsService.route(requestArray[requestPointer], afficherItineraire);
            }
            //sinon, les requetes d'itineraires sont terminées
             else
            {
                requetesGoogleTerminees = true;//Indiquer que les requêtes à Google sont terminées
                //affiche le temps de fin des requêtes en console
                date2 = new Date();
                var deltaTime = (date2.getTime() - date1.getTime()) / 1000;
                console.log(requestArray.length + " requêtes Google terminées en: " + deltaTime + "secondes");

                //Faire les changements sur l'interface qui doivent être faits lorsque les requêtes sont terminées
                rafraichirBtn.disabled = false;//activer le bouton rafraichir
                initialiserPanneauDeControle();//initialiser le panneau de controle
                toggleMenuFiltre();//initialiser les menus de filtre pour la carte reseau
                chargerItinChoisiDuLocalstorage();//charger les données d'itineraires choisi qui se trouvent en localstorage
                mettreAJourItinChoisi();//metre à jour les itineraires choisis qui ont pu être loadé a partir du localstorage, a partir des donnees du backend
                demarrerMiseAJourAutomatique();//demarrer la mise a jour automatique des données
                definirMessageDerniereMiseAJour();//afficher le message indiquant l'heure de la derniere mise a jour
            }   
        }
        //Si on atteint le maximum de requête par seconde permises par Google (10requetes/s)
        else if (status == google.maps.DirectionsStatus.OVER_QUERY_LIMIT)
        {
          delaiAttente += delaiAttenteIncrement;//on incrémente le délai d'attente
          //on réessaie la même requête après le délai d'attente déterminé    
          setTimeout(function()
          {
              directionsService.route(requestArray[requestPointer], afficherItineraire);
          }, delaiAttente);
        }
        //Si une requête à Google échoue pour une raison autre que le nombre de requête maximum par seconde atteint, on affiche l'erreur
        else
        {
            console.log("Les requêtes n'ont pu être complétées. Raison: " + status);
            document.querySelector(".spinner").innerHTML = "Les requêtes n'ont pu être complétées. Raison: " + status;
        }
    }
     //Demarre la fonction qui permet la mise a jour automatique des données 
    function demarrerMiseAJourAutomatique()
    {
        //a chaque intervalle de temps defini par la variable intevalleMiseAjour, mettre a jour les donnees 
        miseAJourFunction = setInterval(function()
          {
              console.log("Mise a jour de donnees");
              mettreAJourLesDonnees();
          }, intervalleMiseAJour);
    }
    
    //Formatte et affiche affiche a l'utilisateur la date et l'heure actuelle. Cette fonction est appelé lors des mise a jour pour indiquer a quelle moment la derniere mise a jour a été faite.
    function definirMessageDerniereMiseAJour()
    {
        var now = new Date();
        var dateFormattee = now.toLocaleDateString();
        var tempsFormatte = now.toLocaleTimeString();
        
        tempsMiseAJourSpan.innerHTML = dateFormattee + " " + tempsFormatte;
    }
    
    //Recoit une vitesse en parametre et renvoie la couleur de troncon correspondante
    function getCouleurDePaire(vitesseMed)
    {
        let couleurDuTroncon = "lime";
        if (vitesseMed === 0 || vitesseMed === "ND")
        {
            couleurDuTroncon = "grey";//Si le backend a fourni une vitesse de 0, il y a un problèeme avec les données (pas de données pour la période de temps spécifiée, ou autre) et on affiche un troncon gris
        }
        else if (vitesseMed >=40 &&  vitesseMed <=80)
        {
            couleurDuTroncon = "blue";
        }
        else if (vitesseMed < 40 && vitesseMed > 0)
        {
            couleurDuTroncon = "red";
        } 
        return couleurDuTroncon;
    }
    
    //Création d'une polyline qui sera superposée au render de l'itinéraire passé en paramètre et qui permet les événements de type hover de la souris. Ces événements sont impossibles à appliquer directement sur le render de l'itinéraire fourni par Google, d'où la superposition du polyline.
    function creerPolylineForHover(itineraireRender, vitesseMed, couleurDuTroncon, carte)
    {    
            let path = itineraireRender.getDirections().routes[0].overview_path;//trajet que doit suivre le polyline
            var polylineForHover = new google.maps.Polyline
            ({
                path: path,//trajet que doit suivre le polyline
                strokeWeight: 10,//epaisseur de la ligne
                strokeOpacity: 0,//cette polyline est invisible par defaut,
                zIndex: 1000//Pour être certain qu'elle est par dessus tous les autres éléments de la carte
            });
            polylineForHoverArray.push(polylineForHover);//ajouter le polyline au array de polylineForHover
            
            //Si la carte n'est pas la carteItineraire
            if ((carte !== carteItineraire))
                polylineForHover.setMap(carte);//on ajoute le polylineForHover à la carte (on n'ajoute pas les polylineForHover par defaut sur la carte itineraire)
            else                          
                polylineForHoverItineraireArray.push(polylineForHover);//on ajoute le polylineForHover à l'array de polylineForHover de la carteItineraire
            
            //Déterminer la couleur initiale du polyline
            polylineForHover.setOptions({
                strokeColor: couleurDuTroncon
            });
        
            //Infos spécifique à l'itinéraire que superpose le polylineForHover
            let description_depart = pairesDeRequeteArray[requestPointer].orig.description;
            let description_arrivee = pairesDeRequeteArray[requestPointer].dest.description;
            let idPaire = pairesDeRequeteArray[requestPointer].idPaire;
            let distance = pairesDeRequeteArray[requestPointer].distance;
            let tempsParcours = formatterTempsDeParcours(pairesDeRequeteArray[requestPointer].tempsParcours);
            
            //Ajout des options d'origine et destination aux menus deroulants de filtrage
            if (carte === carteReseau)//pour la carte reseau seulement (il n'y a pas d'option de filtrage sur la carte Itineraire)
            {
                ajouterAuxOptionsDeOrigines(description_depart);
                ajouterAuxOptionsDeDestinations(description_arrivee);
            }
        
            //Ajout des gestionnaires d'événements
            let indice = requestPointer;//Création d'un indice avec "let", ce qui permet de conserver une valeur d'indice spécifique à chaque listener. L'utilisation directe de requestPointer dans les listener entrainerait des erreurs, car c'est une variable globale déclarée avec "var" 
            
            //Mouseover = affichage du polyline et de l'infoWindow itinéraire avec les infos de l'itinéraire
            let mouseoverEventHandler = ajouterPolylineForHoverMouseoverEventHandler(polylineForHover, indice, description_depart, description_arrivee, idPaire, distance, vitesseMed, tempsParcours, carte);
        
            //Mouseout = disparition du polyline et de l'infoWindow
            let mouseoutEventHandler = ajouterPolylineForHoverMouseoutEventHandler(polylineForHover, carte, indice);       
            
            //Dans le cas de la carte itineraire, on ajoute un listener de click pour permettre la sélection du polylineForHover (simule une selection de l'itineraire). La désselection du polylineForSelect entraine un déselection automatique de ce polyline et de tous ceux qui suivaient dans l'itinéraire. Ensuite, en repartant du polylineForSelect précédant celui qui a été cliqué, on réaffiche les polylines constituant une suite d'itinéraire possible.
            if (carte === carteItineraire) //(les polylineForHover ne sont pas selectionnable sur la carteReseau)
            {
                polylineForHover.clickable = true;//L'ajout de cette propriété (clickable) permet de contrôler l'activation/désactivation de l'event handler de click facilement
                //click = affichage du polylineForSelect correspondant
                google.maps.event.addListener(polylineForHover, 'click', function(event)
                {
                    if (polylineForHover.clickable === true)
                    {
                        /*Si le polylineForSelect n'est pas affiché (signifie que ce polylineForHover n'est pas sélectionné)*/
                        if (polylineForSelectArray[indice].getMap() === null || polylineForSelectArray[indice].getMap() === undefined)
                        {
                            //on desactive les events de mouseover et mouseout du polylineForHover
                            google.maps.event.clearListeners(polylineForHover, 'mouseover');
                            google.maps.event.clearListeners(polylineForHover, 'mouseout');

                            //on affiche le polylineForSelect correspondant
                            polylineForSelectArray[indice].setMap(carte);

                            //Rendre le polylineForHover visible
                            polylineForHover.setOptions({
                                strokeOpacity: 0.6
                            })
                            infoWindowItineraire.close();

                            //On ajoute les polylines aux listes de polylines sélectionnés
                            itinSelectionneRenderArray.push(itineraireRender);
                            itinSelectionnePolyForHoverArray.push(polylineForHover);   polylineForSelectSelectedArray.push(polylineForSelectArray[indice]);
                            
                            //garder en memoire la position (indice) du polylineForSelect dans la liste des polylineForSelect selectionnes
                            let indicePositionDansListeSelectionne = polylineForSelectSelectedArray.length-1;                          
                            
                            //Ajouter la paire correspondante au polylineForHover cliqué à itinSurMesureData
                            ajouterItinSurMesureData(indice);
                            
                            
                            //faire disparaitre de la carte les paires qui ne constituent pas une suite possible pour l'itineraire
                            faireDisparaitrePairesImpossibles(indice);
                            
                            //Gérer l'activation/désactivation des éléments de l'interface
                            toggleRecommencerBtn();
                            toggleAjouterBtn();
                            //gérer l'affichage des infos d'itinéraire sur mesure
                            changerAffichageOrigDest(indice);
                            
                            //Supprimer les events de clicks sur le polylineForSelectArray[indice] (autrement ils s'accumulent à chaque clicks sur le polylineForHover)
                            google.maps.event.clearListeners(polylineForSelectArray[indice], 'click');
                            //Event handler de click sur le polylineForSelect qui superpose le polylineForHover (pour le déselectionner)
                            google.maps.event.addListener(polylineForSelectArray[indice], 'click', function(event)
                             {
                                //on réactive les events de mouseover et mouseout du polylineForHover (pour pouvoir le selectionner a nouveau)
                                ajouterPolylineForHoverMouseoutEventHandler(polylineForHover, carte, indice);
                                ajouterPolylineForHoverMouseoverEventHandler(polylineForHover, indice, description_depart, description_arrivee, idPaire, distance, vitesseMed, tempsParcours, carte);

                                //si le trigger du event est un click de l'utilisateur (un click peut aussi etre simulé par le code)
                                if (clickDeselectionParUtilisateur)
                                {
                                    //garder les polylineForSelect et polylineForHover qui precede celui qui vient d'être cliqué en mémoire
                                    var polylineForSelectPrecedent = polylineForSelectSelectedArray[indicePositionDansListeSelectionne-1];
                                    var polylineForHoverPrecedent = itinSelectionnePolyForHoverArray[indicePositionDansListeSelectionne-1];
                                    //on fait disparaitre tout les polylineForSelect qui suivent dans l'itinéraire sur mesure (pour les déselectionner)
                                    clearNextSelectedPolyForHover(polylineForHover);
                                    clickDeselectionParUtilisateur = true;//remettre l'indicateur de click par utilisateur a true
                                    //si le polylineForSelect qui vient d'être cliqué n'est pas le 1er de l'itinéraire sur mesure
                                    if (indicePositionDansListeSelectionne-1 >= 0)
                                    {   
                                        //enlever les polylines (render, forHover, forSelect) correspondant au polylineForSelect qui vient d'être cliqué des listes de polylines sélectionnés (car ce polyline lui même est retiré de la carte, il a été désélectionné)
                                        itinSelectionnePolyForHoverArray.splice(itinSelectionnePolyForHoverArray.length-1, 1);
                                        itinSelectionneRenderArray.splice(itinSelectionneRenderArray.length-1, 1);
                                        polylineForSelectSelectedArray.splice(polylineForSelectSelectedArray.length-1, 1);
                                        itinSurMesureData.splice(itinSurMesureData.length-1, 1);
                                        
                                        //retirer le polylineForSelect qui vient d'être cliqué de la carte
                                        polylineForSelectPrecedent.setMap(null);
                                        //simuler un click de souris sur le polylineForHover precedent (pour réafficher les prochaines polylines pouvant constituer une suite à l'itinéraire sur mesure)
                                        google.maps.event.trigger(polylineForHoverPrecedent, 'click', {});
                                    }
                                    //si le polylineForSelect qui vient d'être cliqué était le 1er de l'itinéraire sur mesure
                                    else
                                    {
                                       //on remontre toutes les paires de la carte (l'utilisateur peut commencer un nouveal itinéraire sur mesure)    
                                       showAllPairesRender();
                                        //gérer les boutons 
                                       toggleRecommencerBtn();
                                       toggleAjouterBtn();
                                        //gérer l'affichage des infos de l'itinéraire sur mesure
                                       changerAffichageOrigDest(indice);    
                                    }
                                }
                            });
                        }
                    }   
                });
            }
    }
    
    //ajouter la paire de pairesData de l'indice passé en paramètre à itinSurMesureData
    function ajouterItinSurMesureData(indice)
    {
        itinSurMesureData.push(pairesData[indice]);     
    }
    
    //Cette fonction récursive sert a supprimer toutes les paires sélectionnées qui suivent la paire sélectionnée sur laquelle l'utilisateur a cliqué lors de la construction d'un itinéraire sur mesure. 
    function clearNextSelectedPolyForHover(polyForHover, index)
    {
       //Si l'index du polyForHover à supprimer n'est pas spécifié, c'est que cette fonction est appellée pour la première fois suite a un clic de déselection fait par l'utilisateur (car le 1er appel a cette methode lors d'un clic de l'utilisateur n'envoie pas de parametre index, contrairement aux appels suivants). On doit trouver l'index de depart du polyline cliqué dans itinSelectionnePolyForHoverArray
       var indexASupprimer;
       if (index === undefined)
       {
           clickDeselectionParUtilisateur = false;
           //Trouver l'index à partir duquel supprimer les polylines    
           for (var i=0; i<itinSelectionnePolyForHoverArray.length ; i++)
           {
               if (itinSelectionnePolyForHoverArray[i] === polyForHover)
               {
                   indexASupprimer = i; 
               }
               if (indexASupprimer !== undefined)
               {   
                  google.maps.event.trigger(polylineForSelectSelectedArray[i], 'click', {});
                  google.maps.event.trigger(itinSelectionnePolyForHoverArray[i], 'mouseout', {});   
                  polylineForSelectSelectedArray[i].setMap(null);
                  itinSelectionnePolyForHoverArray[i].setMap(null); 
               }
           }
           //Supprimer la paire qui a été cliquée des listes de stockages, ainsi que toutes les paires suivantes                 
           itinSelectionnePolyForHoverArray.splice(indexASupprimer, itinSelectionnePolyForHoverArray.length - indexASupprimer);
           itinSelectionneRenderArray.splice(indexASupprimer, itinSelectionneRenderArray.length - indexASupprimer);
           polylineForSelectSelectedArray.splice(indexASupprimer, polylineForSelectSelectedArray.length - indexASupprimer);           
           itinSurMesureData.splice(indexASupprimer, itinSurMesureData.length-indexASupprimer);
       }
    }
    
   //Cette fonction permet de faire disparaitre les autres paires affichées sur la carteItineraire qui ne constitue pas un choix potentiel pour la suite de l'itinéraire
   function faireDisparaitrePairesImpossibles(indice)
   {
          showAllPairesRender();//afficher toutes les paires
          for (var i=0; i<renderItineraireArray.length; i++)
          {          
              //s'assurer de ne pas traiter un itineraire qui est deja sélectionné
              let dejaSelectionne = false;
              for (var itinRender of itinSelectionnePolyForHoverArray)
              {
                  if (polylineForHoverItineraireArray[i] === itinRender)
                  {
                      dejaSelectionne = true;
                  }
              }
              //si le polyline n'est pas déja sélectionné
              if(!dejaSelectionne)
              {
                  /*si la destination du polyline qui vient d'être sélectionné ne correspondant pas à l'origine du polyline du renderArray*/   
                  if (pairesDeRequeteArray[indice].dest.idMarker !== pairesDeRequeteArray[i].orig.idMarker)
                  {
                      //on fait disparaitre l'itineraire de la carteItineraire, car il ne constitue pas un choix possible pour la suite de l'itineraire
                      renderItineraireArray[i].setMap(null);
                      //On enleve aussi le polyline qui superpose l'itineraire enlevé
                      polylineForHoverItineraireArray[i].setMap(null);    
                  }
              }         
          }
    }         
    
    //Ajoute le event handler de mouseout  sur un polylineForHover.
    //Le event handler gere la disparition du polyline et de l'infoWindowItineraire lorsque la souris ne survole plus le polyline
    function ajouterPolylineForHoverMouseoutEventHandler(polylineForHover, carte, indice, persistent)
    {
        //le paramètre persistent est facultatif et false par défaut (lorsque true, il permet d'afficher les polylineForHover de manière permanente lors de la consultation des itinéraires prédéfinis)
        if (persistent === undefined)
        {
            persistent = false;
        }
        //Mouseout = rend le polyline invisible
        var eventHandler = google.maps.event.addListener(polylineForHover, 'mouseout', function()
        {
            //si le polylineForHover n'est pas persistent
            if (!persistent)
            {
                 polylineForHover.setOptions(
                {
                   //Rendre le polyline à nouveau invisible    
                   strokeOpacity: 0
                });
                polylineForHover.setMap(carte);//Sert a réafficher le polyline avec les nouvelles options
            }
            
            //dans le cas de la carteReseau, gérer le checkbox correspondant à l'itinéraire
            if (carte === carteReseau)
            {
                //Rendre le checkbox correpondant au polyline sans caractere gras
                document.querySelectorAll('.checkboxDiv')[indice].style.fontWeight = "";
            }

            //Fermer l'infoWindowItineraire
            infoWindowItineraire.close();
        });
        return eventHandler;
    }
    
    //Ajoute le event handler de mouseover sur un polylineForHover.
    //Le event handler gere l'apparition du polyline et de l'infoWindowItineraire.
    function ajouterPolylineForHoverMouseoverEventHandler(polylineForHover, indice, description_depart, description_arrivee, idPaire, distance, vitesseMed, tempsParcours, carte)
    {
        //attribution de propriétés au polylineForHover, permet de changer les infos présentée dans l'infoWindowItineraire ailleurs dans le code suite à une mise a jour des données
        polylineForHover.idPaire = idPaire;
        polylineForHover.description_depart = description_depart;
        polylineForHover.description_arrivee = description_arrivee;
        polylineForHover.vitesseMed = vitesseMed;
        polylineForHover.tempsParcours = tempsParcours;
        
        var eventHandler = google.maps.event.addListener(polylineForHover, 'mouseover', function(event)
            {
                if ((polylineForHover.getMap() === carteReseau && checkboxElementArray[indice].querySelector("input").checked) || polylineForHover.getMap() !== carteReseau)
                {
                    //si le tempsParcours = 0, c'est que le backend n'a renvoyé aucune donnée de temps pour cette paire
                    if (tempsParcours === 0 || tempsParcours === 'ND')
                    {
                        //les temps de parcours et la vitesse med sont indisponibles
                        tempsParcours = "ND";
                        vitesseMed = "ND";
                    }
                    
                    //Afficher l'infoWindowItineraire à l'endroit du curseur de souris                    
                    polylineForHover.infoWindowContent = '<div id="infoWindowItineraire"><div class="infoWindow_titre">idPaire: ' + polylineForHover.idPaire + '</div><span class="infoWindow_desc">' + polylineForHover.description_depart + '<img src="../../images/fleche.png" class="imgFlecheInfoWindow">' + polylineForHover.description_arrivee + '</span>' + '<div class="infoWindow_desc">Distance: ' + distance + '</div><div class="infoWindow_desc">Vitesse médiane: ' + polylineForHover.vitesseMed + '</div><div class="infoWindow_desc">Temps parcours: ' + polylineForHover.tempsParcours + '</div>';
                    infoWindowItineraire.setContent(polylineForHover.infoWindowContent);
                    infoWindowItineraire.setPosition(event.latLng);
                    infoWindowItineraire.open(carte);

                    polylineForHover.setOptions(
                    {
                        //Rendre le polyline visible
                        strokeOpacity: 0.6,
                    });

                    polylineForHover.setMap(carte);//Sert a réafficher le polyline avec les nouvelles options
                    
                    //dans le cas de la carteReseau, gérer le checkbox correspondant à l'itinéraire
                    if (carte === carteReseau)
                    {
                        //Rendre le checkbox correpondant au polyline en caractere gras
                        document.querySelectorAll('.checkboxDiv')[indice].style.fontWeight = "bold";
                    }
                }
            });
        return eventHandler;
    }
       
    //Ajout d'une option au menu déroulant des origines, si elle n'est pas déjà présente
    function ajouterAuxOptionsDeOrigines(description_depart)
    {
        let origineExisteDeja = false;
        for (let i = 0; i<originesArray.length; i++)
         {
            if (description_depart === originesArray[i])
            {
                origineExisteDeja = true;
            }
         }
        if (!origineExisteDeja)
        {
          originesArray.push(description_depart);      
        }
    }
    
    //Ajout d'une option au menu déroulant des origines, si elle n'est pas déjà présente
    function ajouterAuxOptionsDeDestinations(description_arrivee)
    {
        let destExisteDeja = false;
        for (let i = 0; i<destArray.length; i++)
         {
            if (description_arrivee === destArray[i])
            {
                destExisteDeja = true;
            }
         }
        if (!destExisteDeja)
        {
          destArray.push(description_arrivee);      
        }
    }
    
    //creer un checkbox correspondant au render d'itineraire passé en parametre.
    //Des event handlers sont aussi ajouté au polylineForHover (parametre polyline) qui superpose le render d'itinéraire.
    function creerCheckboxPanneauDeControle(itineraireRender, polyline)
    {
       let description_depart = pairesDeRequeteArray[requestPointer].orig.description;
       let description_arrivee = pairesDeRequeteArray[requestPointer].dest.description;    
       let checkboxDiv = document.createElement("div");
       checkboxDiv.setAttribute("class", "checkboxDiv");
       checkboxDiv.setAttribute("data-origine", description_depart);
       checkboxDiv.setAttribute("data-dest", description_arrivee);
       let checkbox = document.createElement("input");
       checkbox.setAttribute("type", "checkbox");
       checkbox.checked = true;
       let checkboxTextSpan = document.createElement("span");   
       checkboxTextSpan.innerHTML = description_depart + '<img src="../../images/fleche.png"/ class="imgFlecheCheckbox">' + description_arrivee;
       checkboxDiv.appendChild(checkbox);
       checkboxDiv.appendChild(checkboxTextSpan);
        
       //Event handlers sur le checkbox qui rend visible le polyline correspondant à l'itinéraire décrit dans le chexbox lors d'un mouseover et invisible lors d'un mouseout
       checkboxDiv.onmouseover = function()
       {
           polyline.setOptions(
            {
                //Rendre le polyline visible, plus gros et de la même couleur que le troncon qu'il superpose
                strokeOpacity: 0.6
            });
            
            polyline.setMap(carteReseau);//Sert a réafficher le polyline avec les nouvelles options
       }
       
       checkboxDiv.onmouseout = function(){
           polyline.setOptions(
            {
                //Rendre le polyline visible, plus gros et de la même couleur que le troncon qu'il superpose
                strokeOpacity: 0.0
            });
           if (polyline.getMap() === carteReseau)//Condition nécessaire pour empêcher de reafficher le polyline lors d'un mouseout lorsque le polyline n'est plus affiché (c-a-d lorsque getMap === null)
            polyline.setMap(carteReseau);//Sert a réafficher le polyline avec les nouvelles options 
       }
       
       //Event handlers qui ajoutent ou elevent de la carte les troncons correpondant au checkbox quand on coche/décoche le checkbox
       checkbox.onclick = function(){
           if (checkbox.checked === false)
           {
               polyline.setMap(null);
               itineraireRender.setMap(null);
           }
           else
           {
               polyline.setMap(carteReseau);
               itineraireRender.setMap(carteReseau);
           }
       }   
       checkboxElementArray.push(checkboxDiv);    
    }
    
    //Function qui crée un polyline qui s'affiche lorsque l'utilisateur clique sur un polylineForHover pour indiquer qu'il est sélectionné
    function creerPolylineForSelect(itineraireRender)
    {
        let path = itineraireRender.getDirections().routes[0].overview_path;
        //définir un symbole spécial pour indiquer de manièr visuelle que le polyline est sélectionné (constitué de pointillés gris)
        var lineSymbol = 
        {
            path: 'M 0,-1 0,1',
            strokeOpacity: 0.8,
            scale: 4
        };
        var polylineForSelect = new google.maps.Polyline
        ({
            path: path,
            strokeWeight: 10,
            strokeOpacity: 0.2,
            zIndex: 1001,//Pour être certain qu'elle est par dessus tous les autres éléments de la carte, sauf le polylineForHover (qui a un z-index de 1000);
            strokeColor: "white",
            icons: [{ //attribuer le symbole spécial de sélection au polyline
                icon: lineSymbol,
                offset: '0',
                repeat: '20px'
              }],
        });       
        polylineForSelectArray.push(polylineForSelect);
    }
    
    //Cette fonction load les données de capteurs à partir du backend avec une requete AJAX
    function getDonneesCapteurs()
    {
        $.ajax
        ({
            url: "../../php/capteursData.php",
            error: function(msg1, msg2, msg3)
            {
                console.log("La mise a jour des données a échoué");
                console.log(msg1 + " " + msg2 + " " + msg3);
            },
            success: function(backendData)
            {
                capteursData = backendData;
                afficherCapteursBT();
            },
        });
    }
    
    //Cette fonction fait une requete AJAX au server web pour obtenir les donnees de pairesData et itinerairesData
    function mettreAJourLesDonnees()
    {       
        var date = new Date();
        var currentTime = date.getTime()/1000; // divisé par 1000 car getTime() donne des millisecondes, on veut des secondes
        currentTime = currentTime.toFixed(0);
        $.ajax
        ({
            type: 'POST',
            url: "../../php/itinerairesData.php",
            error: function(msg1, msg2, msg3)
            {
                console.log("La mise a jour des données a échoué");
                console.log(msg1 + " " + msg2 + " " + msg3);
            },
            data: {time: currentTime},
            success: function(backendData)
            {
                itinerairesData = backendData;
            }
        });
        
        $.ajax
        ({
            type: 'POST',
            url: "../../php/pairesData.php",
            error: function(msg1, msg2, msg3)
            {
                console.log("La mise a jour des données a échoué");
                console.log(msg1 + " " + msg2 + " " + msg3);
            },
            data: {time: currentTime},
            success: function(backendData)
            {
                //console.log(pairesData);
                pairesData = backendData;
                if (requetesGoogleTerminees)//si les requetes google sont deja faites
                {
                    //changer les couleurs des polylines des cartes selon les nouvelles données de paires
                    rafraichirLesCartes();
                    //changer les infos des itinéraires choisis sauvegardés selon les nouvelles données de paires
                    mettreAJourItinChoisi();
                    clearInterval(miseAJourFunction);//Arreter la fonction de mise a jour automatique
                    demarrerMiseAJourAutomatique();//Redemarrer la fonction de mise a jour automatique
                }
                else//si les requetes Google ne sont pas encore faites (la page vient d'être chargée)
                {
                    //Appel de la méthode qui génère les itinéraires Google entre les orig et dest des paires
                    genererItineraires();
                }
            }
        });
        definirMessageDerniereMiseAJour();//Mettre a jour le message de mise a jour
    }
    
    //Cette fonction sert à changer les couleurs des paires sur la carte suite à la mise a jour des données. 
    //Les requêtes d'itinéraires ne sont pas refaites à Google, seul la couleur des itinéraires déjà obtenus est changée. 
    function rafraichirLesCartes()
    {  
        if (requetesGoogleTerminees)
        {   
            let indexDuRender = 0;
            for (let i=0; i<(renderArray.length)/2; i++)
            {                 
                for (let j=0; j<cartesArray.length; j++)
                {   
                    let vitesseMed = pairesData[i].vitesseMed;
                    let tempsParcours = pairesData[i].tempsParcours;
                    let couleurDuTroncon = getCouleurDePaire(vitesseMed);
                    
                    renderArray[indexDuRender].setOptions(
                    {
                        'suppressMarkers':true,
                        polylineOptions: 
                        {
                            strokeColor: couleurDuTroncon,
                            strokeOpacity: 0.8 
                        }
                    });
                    if (renderArray[indexDuRender].getMap() !== null)//Condition nécessaire pour empêcher de reafficher l'itineraire lorsque le polyline n'est plus affiché (c-a-d lorsque getMap === null)
                        renderArray[indexDuRender].setMap(renderArray[indexDuRender].getMap());//Sert a réafficher l'intinéraire avec la nouvelle couleur

                    changerCouleurDePolylinesItineraires(couleurDuTroncon, indexDuRender);
                    
                    //ajuster la vitesse moyenne et le temps de parcours de l'infoWindow
                    if (tempsParcours === 0 || tempsParcours === 'ND')
                    {
                        tempsParcours = "ND";
                        vitesseMed = "ND";
                    }
                    tempsParcours = formatterTempsDeParcours(tempsParcours);
                    polylineForHoverArray[indexDuRender].tempsParcours = tempsParcours; 
                    polylineForHoverArray[indexDuRender].vitesseMed = vitesseMed; 
                    
                    indexDuRender++;
                }
            }
        }
        else
        {
            window.alert("Les requetes d'itineraires à l'API de Google n'ont pas été complétées. Rafraichissement impossible.");    
        }
    }
    
    //Met a jour les infos des itineraires choisis suite a un update des données de base (pairesData)
    function mettreAJourItinChoisi()
    {
        //Sauvegarder l'index de l'itineraire selectionné par l'utilisateur, s'il y en a un
        //si l'onglet itineraire n'est pas affiché
        var radioButtons;
        if (typeof itinChoisisDiv !== "undefined")
           radioButtons = itinChoisisDiv.querySelectorAll("input");    
        else
           radioButtons = itinerairesDivContent.querySelectorAll("#itinChoisisDiv input");
        
        var indexDuChoisi = null;
        for (var i=0; i<radioButtons.length; i++)
        {
            if (radioButtons[i].checked)
            {
                indexDuChoisi = i;
                break;
            }
        }     
        
        //Vider le div présentant les itinéraires choisi
        //si l'itinChoisiDiv est présentement affiché (si l'onglet itineraire est sélectionné)
        if (typeof itinChoisisDiv !== "undefined")
        {
            itinChoisisDiv.innerHTML = "";
        }
        //sinon, itinChoisisDiv est sauvegardé dans itinerairesDivContent
        else
        {
            itinerairesDivContent.querySelector("#itinChoisisDiv").innerHTML = "";
        }
        
        //mettre a jour les itineraires
        //pour chaque itineraire deja choisi
        for (var itinChoisi of itinChoisiArray)       
        {
            //pour chaque itineraire mis a jour
            for (var itinAJour of itinerairesData)
            {
                //si le id des deux itineraires match 
                if (itinChoisi.idItineraire === itinAJour.idItineraire)
                {
                    //Remplacer l'itinéraire choisi par l'itinéraire à jour
                    itinChoisi = itinAJour;
                    //recréer le div présentant l'info de l'itinéraire choisi (pour à jour les données de vitesse et de temps Parcours)
                    creerItinChoisiRadioDiv(itinChoisi);
                    //sortir de cette loop et passer au prochain itinChoisi
                    break;
                }
                
                //si itinChoisi.idItineraire est undefined, ca indique que c'est un itineraire sur mesure
                else if (itinChoisi.idItineraire === undefined)
                {
                //recalculer les infos d'itinéraires nécessaires à partir des nouvelles données de paires 
                    //Créer un itinéaire à partir des index de paires sélectionnés.
                    var indexDesPairesDeItineraireChoisi = itinChoisi.listeIndexPaires;
                    var itinAJour = {};
                    var itinPairesArray = [];
                    itinAJour.description = itinChoisi.description;
                    var distanceTotale = 0;
                    var tempsParcoursTotal = 0;
                    var donneesNonDisponible = false;
                    //Trouver la distance totale et le temps de parcours total
                    for (var i=0; i<indexDesPairesDeItineraireChoisi.length; i++)
                    {
                      var paire = pairesData[indexDesPairesDeItineraireChoisi[i]];    
                      distanceTotale += paire.distance;  
                      tempsParcoursTotal += paire.tempsParcours;
                      itinPairesArray.push(paire);
                      if (paire.tempsParcours === 0)//si la paire ne présente aucune donnée de temps de parcours en BD
                      {
                         donneesNonDisponible = true;
                      }
                    }
                    var vitesseMoyenne = null;
                    if (donneesNonDisponible)//si des données manquait pour une paire, on remet le temps de parcours et la vitesse a ND
                    {
                        vitesseMoyenne = "ND";
                        tempsParcoursTotal = "ND";
                    }
                    else
                    {
                        //Trouver la vitesse moyenne
                        vitesseMoyenne = distanceTotale/tempsParcoursTotal;
                        //forcer 0 chiffre apres la virgule pour la vitesse
                        vitesseMoyenne = vitesseMoyenne.toFixed(0);
                    }
                    
                    distanceTotale = distanceTotale.toFixed(3);
                    

                    itinAJour.vitesseMoy = vitesseMoyenne;
                    itinAJour.distance = distanceTotale;
                    itinAJour.tempsParcours = tempsParcoursTotal;
                    itinAJour.paires = itinPairesArray;
                    
                    //Remplacer l'itinéraire choisi par l'itinéraire à jour
                    itinChoisi = itinAJour;
                    //recréer le div présentant l'info de l'itinéraire choisi (pour à jour les données de vitesse et de temps Parcours)
                    creerItinChoisiRadioDiv(itinChoisi);
                    //sortir de cette loop et passer au prochain itinChoisi
                    break;                  
                }
            }
        }
        
        //remettre a jour le localStorage
         localStorage.itinChoisiArray = JSON.stringify(itinChoisiArray);
        
        //reselectionner l'itineraire qui etait choisi
        if (indexDuChoisi !== null)
        {
            var radioButtons;
            if (typeof itinChoisisDiv !== "undefined")
               radioButtons = itinChoisisDiv.querySelectorAll("input");    
            else
               radioButtons = itinerairesDivContent.querySelectorAll("#itinChoisisDiv input");
            radioButtons[indexDuChoisi].checked = true;
        }
    }
    
    
    //Fonction qui ajuste la couleur du polyline qui superpose un itinéraire. Appelée lorsque la couleur de l'itinéraire change suite à un rafraichissement de la carte.
    function changerCouleurDePolylinesItineraires(couleurDuTroncon, indexItineraire)
    {
        polylineForHoverArray[indexItineraire].setOptions(
        {
            //on ajuste la couleur du polyline
            strokeColor: couleurDuTroncon
        });
    }
    
    //Methode qui initialise le panneau de controle une fois les requêtes terminées
    function initialiserPanneauDeControle()
    {
        //Enlever le message et l'animation de loading
        panneauDeControle.querySelector('.spinner').outerHTML = "";
        
        //Créer les conteneur de contenu de panneau de controle
        reseauDivContent = reseauTemplate.content.firstElementChild;
        itinerairesDivContent = itinerairesTemplate.content.firstElementChild;
        
        //Initialiser le contenu de itineraireDivContent
        initialiserMenuDeroulantItineraires();
        var itinButtons = itinerairesDivContent.querySelectorAll("button");
        for (var i=0; i<itinButtons.length; i++)
        {
            itinButtons[i].disabled=true;
        }
        itinerairesDivContent.querySelector("#sousOngletAjouter").disabled = false;
        itinerairesDivContent.querySelector("#sousOngletVisualiser").disabled=false;
        
        //cacher le contenu des deux sousOnglet (ajouter un itineraire et visualiser itineraire ajoutés)
        var sousSections2 = itinerairesDivContent.querySelectorAll(".sousSection2");
        for (let i=0; i<sousSections2.length; i++)
        {
            sousSections2[i].style.display = "none";
        }
        itinerairesDivContent.querySelector("#sousOngletAjouter").onclick = toggleOngletAjouter;
        itinerairesDivContent.querySelector("#sousOngletVisualiser").onclick = toggleOngletVisualiser;
        
        //event handlers des cases à cocher
        itinerairesDivContent.querySelector("#itinStandardChkBox").onclick = toggleItinStandard;
        itinerairesDivContent.querySelector("#itinSurMesureChkBox").onclick = toggleItinSurMesure;
        
        //event handler des boutons
        itinerairesDivContent.querySelector("#btnRecommencer").onclick = reinitialiserItineraireSurMesure;
        itinerairesDivContent.querySelector("#btnAjouterItin").onclick = 
        ajouterItineraireSelectionne;
        itinerairesDivContent.querySelector("#supprimerItinChoisiBtn").onclick = supprimerToutItinChoisi;
        
        //Initialiser le contenu de reseauDivContent
        initialiserCheckboxReseau();
        initialiserSelectOrigineDestination();
        reseauDivContent.querySelector('#filtrerCheckbox').onclick = toggleMenuFiltre;//Listener qui active/désactive le menu de filtrage des origine et destinations
        panneauDeControleContentDiv.appendChild(reseauDivContent);
        updateStyleForPanneauControleTitle();
        panneauDeControleContentDiv.style.display = "";//Afficher le contenu du panneauDeControle
        
        
        //Mettre des event de click sur les onglets
        panneauDeControle.querySelectorAll('.onglet')[0].onclick = changerOnglet;
        panneauDeControle.querySelectorAll('.onglet')[1].onclick = changerOnglet;
        //idealement, faire une boucle pour attribuer ce event a tous les onglets***********************
    }
    
    //Supprime tous les itinéraires choisi de la liste du panneau de controle de la carte Itineraire et du localStorage
    function supprimerToutItinChoisi()
    {
        itinChoisiArray = [];
        localStorage.removeItem("itinChoisiArray");
        //vider le contenu des itineraire choisi
        itinChoisisDiv.innerHTML = "";
        supprimerItinChoisiBtn.disabled = true;
        updateItinChoisisMessage();
        
        //enlever les render de paire et les polylineForHover de la carte
        for (var i=0; i<renderItineraireArray.length; i++)
        {
            renderItineraireArray[i].setMap(null);
            polylineForHoverArray[i].setMap(null);
        }
    }
    
    //gere l'activation/desactivation du sous onglet Ajouter (panneau de controle de la carte Itineraire)
    function toggleOngletAjouter()
    {  
        hideAllPairesRender();  
        var sousSections2 = ajouterItinDiv.querySelectorAll(".sousSection2");
        for (let i=0; i<sousSections2.length; i++)
        {
            sousSections2[i].style.display = "";
        }
         
        var sousSections2 = itinChoisi.querySelectorAll(".sousSection2");
        for (let i=0; i<sousSections2.length; i++)
        {
            sousSections2[i].style.display = "none";
        } 
        itinChoisi.querySelector("#itinChoisisMessage").style.display=""; 
        sousOngletAjouter.classList.add("ongletActif");
        sousOngletVisualiser.classList.remove("ongletActif");  
    }
    
    //gere l'activation/desactivation du sous onglet "Visualiser les itinéraires ajoutés" (panneau de controle de la carte Itineraire)
    function toggleOngletVisualiser()
    {
        if (itinSurMesureChkBox.checked)
        {
           itinSurMesureChkBox.click(); 
        }
        
        if (itinStandardChkBox.checked)
        {
           itinStandardChkBox.click(); 
        }
        
        //empecher l'utilisateur de pouvoir clicker sur les polylineForHover
        for (var polylineForHover of polylineForHoverItineraireArray)
        {
           polylineForHover.clickable = false;
        }
        
        var sousSections2 = itinChoisi.querySelectorAll(".sousSection2");
        for (let i=0; i<sousSections2.length; i++)
        {
            sousSections2[i].style.display = "";
        }
        itinChoisi.querySelector("#itinChoisisMessage").style.display="none";
        
        var sousSections2 = ajouterItinDiv.querySelectorAll(".sousSection2");
        for (let i=0; i<sousSections2.length; i++)
        {
            sousSections2[i].style.display = "none";
        }
        
        sousOngletVisualiser.classList.add("ongletActif");
        sousOngletAjouter.classList.remove("ongletActif");
        
        //afficher l'itinéraire préalablement sélectionné par l'utilisateur
        afficherItinChoisi();
        gererSupprimerButton();
    }
    
    //gerer l'activation du bouton supprimer
    function gererSupprimerButton()
    {
       if (itinChoisiArray.length >0)
            supprimerItinChoisiBtn.disabled = false;
       else
           supprimerItinChoisiBtn.disabled = true;
    }
      
    //Cette fonction ajoute l'itinéraire sélectionné par l'utilisateur (prédéfini ou sur mesure) à la section des itinéraires choisis dans le panneau de controle de la carte Itineraire dans le sous onglet "Visualiser les itinéraires ajoutés".
    function ajouterItineraireSelectionne()
    {
        var defaultLabel;
        if (itinStandardChkBox.checked)
            defaultLabel = itinSelectMenu.value;
        else if (itinSurMesureChkBox.checked)
            defaultLabel = itinPairesSelectionneesDiv.querySelector(".surMesureOrigine").innerHTML + " " + itinPairesSelectionneesDiv.querySelector(".surMesureDest").innerHTML;   
        var description = window.prompt("Entrer une description pour cet itinéraire", defaultLabel);
        
        if (description !== null)
        {
            var itineraire = ajouterItineraireAItinChoisiArray(description);
            updateItinChoisisMessage();
            creerItinChoisiRadioDiv(itineraire); 
        }        
    }
    
    //Ajouter l'itinéraire (prédéfini ou sur mesure) aux itinéraires choisis
    function ajouterItineraireAItinChoisiArray(description)
    {
        //Si c'est un itinéraire sur mesure qui est ajouté
        if (itinSurMesureChkBox.checked)
        {
            //populer la liste indexDesPairesDeItineraireSelectionneArray
           indexDesPairesDeItineraireSelectionneArray = [];
           for (let i=0; i<itinSelectionnePolyForHoverArray.length; i++)
           {
               for (let j=0; j<polylineForHoverItineraireArray.length; j++)
               {
                    if (itinSelectionnePolyForHoverArray[i] === polylineForHoverItineraireArray[j])
                    {
                        indexDesPairesDeItineraireSelectionneArray.push(j);
                        break;
                    }
               }
           }
            //Créer un itinéaire à partir des index de paires sélectionnés. L'itinéraire est créé selon le même format JSON que itinarairesData avec l'ajout d'une propriété pour la liste des index de paires (listeIndexPaires). Cette propriété permet une recherche des polylines à afficher plus performante lorsqu'on veut afficher les itineraires choisis.
            var itineraire = {};
            var itinPairesArray = [];
            itineraire.description = description;
            var distanceTotale = 0;
            var tempsParcoursTotal = 0;
            var donneesNonDisponible = false;
            //Trouver la distance totale et le temps de parcours total
            for (var i=0; i<indexDesPairesDeItineraireSelectionneArray.length; i++)
            {
              var paire = pairesData[indexDesPairesDeItineraireSelectionneArray[i]];    
              distanceTotale += paire.distance;    
              tempsParcoursTotal += paire.tempsParcours;
              itinPairesArray.push(paire);
              if (paire.tempsParcours === 0)//si la paire ne présente aucune donnée de temps de parcours en BD
              {
                 donneesNonDisponible = true;
              }
            }
            var vitesseMoyenne = null;
            if (donneesNonDisponible)//si des données manquait pour une paire, on remet le temps de parcours et la vitesse a ND
            {
                vitesseMoyenne = "ND";
                tempsParcoursTotal = "ND";
            }
            else
            {
                //Trouver la vitesse moyenne
                vitesseMoyenne = distanceTotale/tempsParcoursTotal;
                //forcer 0 chiffre apres la virgule pour la vitesse
                vitesseMoyenne = vitesseMoyenne.toFixed(0);
            }
            distanceTotale = distanceTotale.toFixed(3);
                     
            itineraire.vitesseMoy = vitesseMoyenne;
            itineraire.distance = distanceTotale;
            itineraire.tempsParcours = tempsParcoursTotal;
            itineraire.paires = itinPairesArray;
            //Conserver aussi les index des paires. 
            itineraire.listeIndexPaires = indexDesPairesDeItineraireSelectionneArray;
        }
        
        //si c'est un itinéraire prédéfini qui est ajouté
        else if (itinStandardChkBox.checked)
        {
            var indexOption = itinSelectMenu.selectedIndex;
            itineraire = itinSortedByDescriptionsArray[indexOption];
            //Conserver aussi les index des paires.
            itineraire.listeIndexPaires = indexDesPairesDeItineraireSelectionneArray;
        }
        itinChoisiArray.push(itineraire);
        
        //sauvegarder la liste d'itinéraire choisi en localstorage
        localStorage.itinChoisiArray = JSON.stringify(itinChoisiArray);
        return itineraire;
    }
    
    //Mettre a jour le message indiquant le nombre d'itinéraire ajoutés par l'utilisateur
    function updateItinChoisisMessage()
    {
        if (typeof itinChoisisMessage !== "undefined")
        {
            var nbreItin = itinChoisiArray.length;
            if (nbreItin === 0)
                itinChoisisMessage.innerHTML = "";
            else
                itinChoisisMessage.innerHTML = nbreItin + " itinéraires ajoutés";
        }
        else
        {
           var nbreItin = itinChoisiArray.length;
            if (nbreItin === 0)
                itinerairesDivContent.querySelector("#itinChoisisMessage").innerHTML = "";
            else
                itinerairesDivContent.querySelector("#itinChoisisMessage").innerHTML = nbreItin + " itinéraires ajoutés"; 
        }
    }
    
    //Créer et ajouter un petit tableau présentant des informations pour chaque itinéraires ajoutés. Comprend aussi un radio button permettant d'afficher l'itinéraire ajouté sur la carteItinéraire.
    function creerItinChoisiRadioDiv(itineraire)
    {        
        //créer le radio button et les textNode nécessaires
        var radioDiv = document.createElement("div");
        radioDiv.classList.add("radioDivItinChoisi");
        var radioBtn = document.createElement("input");
        radioBtn.setAttribute("type", "radio");
        radioBtn.setAttribute("name", "itinChoisi");
        radioBtn.setAttribute("class", "radioBtn");
        var descriptionSpan = document.createElement("span");
        descriptionSpan.setAttribute("class", "bold");
        descriptionSpan.innerHTML = itineraire.description;
        var tempsParcoursFormatte = formatterTempsDeParcours(itineraire.tempsParcours); 
        var tempsParcoursText = document.createTextNode("Temps parcours: " + tempsParcoursFormatte);
        var vitesseMoyText = null;
        if (itineraire.vitesseMoy === "ND" || itineraire.vitesseMoy === 0)//si les donnees de vitesse ne sont pas disponible
        {
            var vitesseND = "ND";
            vitesseMoyText = document.createTextNode("Vitesse moy: " + vitesseND);
        }
        else
            vitesseMoyText = document.createTextNode("Vitesse moy: " + itineraire.vitesseMoy + "km/h");
        var distanceTotaleText = document.createTextNode("Distance: " + itineraire.distance + "km");
        
        //créer le tableau qui contient les textNode
        var tableau = document.createElement("table");
        
        //ligne 0 (description)
        var tr0 = document.createElement("tr");
        var td01 = document.createElement("td");
        td01.setAttribute("colspan", 3);
        td01.appendChild(descriptionSpan);
        tr0.appendChild(td01);
        tableau.appendChild(tr0);
        
        //ligne 1 (temps, vitesse, distance)
        var tr1 = document.createElement("tr");
        var td10 = document.createElement("td");
        td10.appendChild(tempsParcoursText);
        tr1.appendChild(td10);
        var td11 = document.createElement("td");
        td11.appendChild(vitesseMoyText);
        tr1.appendChild(td11);
        var td12 = document.createElement("td");
        td12.appendChild(distanceTotaleText);
        tr1.appendChild(td12);
        tableau.appendChild(tr1);
        
        radioDiv.appendChild(radioBtn);
        radioDiv.appendChild(tableau);
        if (typeof itinChoisisDiv !== "undefined")
            itinChoisisDiv.appendChild(radioDiv);
        else
            itinerairesDivContent.querySelector("#itinChoisisDiv").appendChild(radioDiv); 
        
        //listener sur le radio button pour afficher l'itinéraire correspondant
        radioBtn.onclick = afficherItinChoisi;
    }
    
    //affiche l'itinéraire choisi par l'utilisateur
    function afficherItinChoisi()
    {
        hideAllPairesRender();
        var radioBtns = document.querySelectorAll(".radioBtn");
        for (var i=0; i<radioBtns.length; i++)
        {
            if (radioBtns[i].checked)
            {
                //Utiliser l'itinChoisiArray pour pogner les index de paires et les afficher sur la carte
                for (var indexPaire of itinChoisiArray[i].listeIndexPaires)
                {
                    renderItineraireArray[indexPaire].setMap(carteItineraire);    polylineForHoverItineraireArray[indexPaire].setMap(carteItineraire);
                }
                break;
            }    
        }
    }                
    
    //Cette fonction crée les options du menu déroulant du panneau de controle itinéraire, à partir des itinéraires prédéfini de itinerairesData
    function initialiserMenuDeroulantItineraires()
    {
        //Trier par ordre alphanum les itineraireData selon la description 
        itinSortedByDescriptionsArray = itinerairesData.sort(function(itin1, itin2)
        {
            if (itin1.description > itin2.description)
            {
                return 1;
            }
            else
            {
                return -1;
            }
        });
        
        //Ajouter les descriptions triées aux options du menu déroulant
        for (let itin of itinSortedByDescriptionsArray)
        {
            var option = document.createElement("option");
            option.setAttribute("value", itin.description);
            option.innerHTML = itin.description;
            itinerairesDivContent.querySelector("#itinSelectMenu").appendChild(option);
        }
        
        //Désactiver les sections desactivable, car les cases à cocher correspondant ne sont pas cochées au chargement de la page
        var divDesactivables = itinerairesDivContent.querySelectorAll(".desactivable");
        for (let i=0; i<divDesactivables.length; i++)
        {       
            divDesactivables[i].classList.add("desactive");//permet de mettre le texte de couleur gris
        }
        itinerairesDivContent.querySelector("#itinSelectMenu").disabled = "true";//permet de désactiver le menu déroulant
        
        //Ajouter des event handlers qui gère la sélection d'un itinéraire prédéfini dans le menu déroulant
        itinerairesDivContent.querySelector("#itinSelectMenu").onchange = afficherItinStandardSelectionne;
    }
    
    //Fonction qui gère les actions à effectuer lorsque l'utilisateur clique sur la checkbox d'itinéraire prédéfini
    function toggleItinStandard()
    {  
       var desactivableDiv = this.parentNode.parentNode.querySelector(".desactivable");
       if (this.checked)
       {
           if (itinSurMesureChkBox.checked)
               itinSurMesureChkBox.click();
           //Lors du premier clic sur le checkbox
           if (itinSelectionneRenderArray.length === 0)
               afficherItinStandardSelectionne();//Permet d'afficher l'itinéraire qui est sélectionné par défaut
           
            desactivableDiv.classList.remove("desactive");
            if (desactivableDiv.querySelector("select") !== null)
                desactivableDiv.querySelector("select").disabled = false;
           
           //desactiver les event de click sur les polylinForHover (les paires ne doivent pas etre sélectionnables lors de leur affichage dans itineraire prédéfini)
           for (var polylineForHover of polylineForHoverItineraireArray)
           {
               polylineForHover.clickable = false;
           }
       }
       else
       {
            gererAncienItinSelectionne();//Permet de faire disparaitre l'ancien itinéraire
            desactivableDiv.classList.add("desactive");
            if (desactivableDiv.querySelector("select") !== null)
                desactivableDiv.querySelector("select").disabled = true;
       }
       toggleAjouterBtn();    
    }
    
    //Fonction qui gère les actions à effectuer lorsque l'utilisateur clique sur la checkbox d'itinéraire sur mesure
    function toggleItinSurMesure()
    {
        var desactivableDiv = this.parentNode.parentNode.querySelector(".desactivable");
        if (this.checked)
        {
            if (itinStandardChkBox.checked)
                itinStandardChkBox.click();
            
            desactivableDiv.classList.remove("desactive");
            showAllPairesRender();
            //activer les event de click sur les polylinForHover
           for (var polylineForHover of polylineForHoverItineraireArray)
           {
               polylineForHover.clickable = true;
           }
        }
        else
        {
            if (polylineForSelectSelectedArray.length > 0)
                reinitialiserItineraireSurMesure();
            for (var itin of renderItineraireArray)
            {
                itin.setMap(null);
            }
            desactivableDiv.classList.add("desactive");
        } 
        toggleAjouterBtn();
    }
    
    //Reset de l'itineraire sur mesure
    function reinitialiserItineraireSurMesure()
    {
        if (polylineForSelectSelectedArray.length > 0)
            google.maps.event.trigger(polylineForSelectSelectedArray[0], 'click', {});//simule un click de souris sur la premiere paire de l'itinéraire sur mesure
        else
            console.log("Erreur: aucune paire sélectionnée");
    }
    
    //gere l'activation du boutton permettant de recommencer l'itineraire sur mesure
    function toggleRecommencerBtn()
    {
        if (polylineForSelectSelectedArray.length > 0)
            btnRecommencer.disabled = false;    
        else
            btnRecommencer.disabled = true;
    }
    
    //Fonction qui sert a afficher tous les render et les polylineForHover de paire sur la carteItineraire (pour debuter un itineraire sur mesure)
    function showAllPairesRender()
    {
        for (var i=0; i<renderItineraireArray.length; i++)
        {
            renderItineraireArray[i].setMap(carteItineraire);
            polylineForHoverItineraireArray[i].setMap(carteItineraire);
        }
    }
    
    //Fonction qui sert a faire disparaitre tous les render et les polylineForHover de paire de la carteItineraire
    function hideAllPairesRender()
    {
        for (var i=0; i<renderItineraireArray.length; i++)
        {
            renderItineraireArray[i].setMap(null);
            polylineForHoverItineraireArray[i].setMap(null);
        }
    }
    
    //Affiche l'itineraire prédéfini choisi par l'utilisateur das le menu déroulant
    function afficherItinStandardSelectionne()
    {
        //Si un ancien itinéraire est sélectionné
        if (itinSelectionneRenderArray.length > 0)
           gererAncienItinSelectionne();
          
       var indexOption = itinSelectMenu.selectedIndex;
       var pairesDeItineraireListe = itinSortedByDescriptionsArray[indexOption].paires;
       for (var i=0; i<pairesDeItineraireListe.length; i++)
       {       
           for (var j=0; j<pairesData.length; j++)
           {
               if (pairesDeItineraireListe[i].idPaire === pairesData[j].idPaire)
               {
                   itinSelectionneRenderArray.push(renderItineraireArray[j]);
                   itinSelectionnePolyForHoverArray.push(polylineForHoverItineraireArray[j]);
                   polylineForHoverItineraireArray[j].setOptions({
                        strokeOpacity: 0.6     
                   });
                   google.maps.event.clearListeners(polylineForHoverItineraireArray[j], 'mouseout');
                   //google.maps.event.clearListeners(polylineForHoverItineraireArray[j], 'click');
                   ajouterPolylineForHoverMouseoutEventHandler(polylineForHoverItineraireArray[j], carteItineraire, null, true);
                   polylineForHoverItineraireArray[j].setMap(carteItineraire);
                   
                   //Ajouter l'index de pairesData à la liste des index de paire qui forment l'itinéraire
                   indexDesPairesDeItineraireSelectionneArray.push(j);
                   break;
               }
           }
       } 
    }
    
    //Gerer l'activation du bouton Ajouter du panneau de controle de la carte Itineraire
    function toggleAjouterBtn()
    {
       //s'il y a un itinéraire prédéfini de choisi ou au moins une paire de choisie pour un itineraire sur mesure     
       if (itinStandardChkBox.checked || (itinSurMesureChkBox.checked && polylineForSelectSelectedArray.length > 0))
       {
          btnAjouterItin.disabled = false; 
       }
       else
       {
          btnAjouterItin.disabled = true; 
       }
    }
    
    //changer les infos d'itineraire qui affichent quand l'utilisateur click sur une paire lors de la construction d'un itineraire sur mesure
    function changerAffichageOrigDest(indice)
    {
        //si aucune paire n'est sélectionnée
        if (polylineForSelectSelectedArray.length === 0)
        {
            itinPairesSelectionneesDiv.innerHTML = "";//on affiche rien
        }
        else
        {
            //affichage de l'origine et de la destination
            itinPairesSelectionneesDiv.innerHTML = "";   
            let origineDiv = document.createElement("div");
            origineDiv.classList.add("surMesureOrigine");
            let origineText = document.createTextNode("Origine: " + itinSurMesureData[0].orig.description);
            origineDiv.appendChild(origineText);
            let destDiv = document.createElement("div");
            destDiv.classList.add("destSurMesure");
            destDiv.classList.add("surMesureDest");
            let destText = document.createTextNode("Destination: " + itinSurMesureData[itinSurMesureData.length-1].dest.description);
            destDiv.appendChild(destText);
            itinPairesSelectionneesDiv.appendChild(origineDiv);
            itinPairesSelectionneesDiv.appendChild(destDiv);
            
            //calcul distance totale et du temps de parcours total
            var distanceTotale = 0;
            var tempsParcoursTotal = 0;
            var donneesNonDisponible = false;
            for (var paire of itinSurMesureData)
            {
                distanceTotale += paire.distance;
                tempsParcoursTotal += paire.tempsParcours;
                //si une des paires présentent un tempsParcours de 0, c aveut dire qu'aucune donnees n'etaient disponible pour cette paire en bd, on ne pas pas calculer le tempsParcours et la vitesseMoyenne de l'itineraire
                if (paire.tempsParcours === 0)
                {
                    donneesNonDisponible = true;
                }
            }
            //calculer la vitesse moyenne
            var vitesseMoyenne = null;
            if (donneesNonDisponible)//s'il manquait de donnees pour au moins une des paires
            {
                vitesseMoyenne = "ND";
                tempsParcoursTotal = "ND";
            }
            else
            {
                vitesseMoyenne = distanceTotale/tempsParcoursTotal;
                //forcer 0 decimales a la vitesse
                vitesseMoyenne = vitesseMoyenne.toFixed(0);
            }
            distanceTotale = distanceTotale.toFixed(3);
                       
            //formatter le temps de parcours, s'il est egale a 0, la fonction renvoie ND
            let tempsParcoursFormatte = formatterTempsDeParcours(tempsParcoursTotal);
            let tempsParcoursTextNode = document.createTextNode("Temps de parcours: " + tempsParcoursFormatte);
            
            //affichage du temps de parcours
            let tempsParcoursDiv = document.createElement("div");
            tempsParcoursDiv.appendChild(tempsParcoursTextNode);
            itinPairesSelectionneesDiv.appendChild(tempsParcoursDiv);
            
            //affichage de la vitesse moyenne
            var vitesseMoyDiv = document.createElement("div");
            var vitesseMoyText = null;
            if (vitesseMoyenne === "ND")
                vitesseMoyText = document.createTextNode("Vitesse moyenne: " + vitesseMoyenne);
            else
                vitesseMoyText = document.createTextNode("Vitesse moyenne: " + vitesseMoyenne + " km/h");
            vitesseMoyDiv.appendChild(vitesseMoyText);            
            itinPairesSelectionneesDiv.appendChild(vitesseMoyDiv);
            
            //affichage de la distance
            var distanceDiv = document.createElement("div");
            var distanceText = document.createTextNode("Distance totale: " + distanceTotale + "km");
            distanceDiv.appendChild(distanceText);
            itinPairesSelectionneesDiv.appendChild(distanceDiv);
        }  
    }
    
    //Prend un temps exprimé en heure et renvoie une version formattée pour l'affichage sous la forme XhXXmXXs.
    //Si le tempsParcours =0, des données manquaient en BD pour évaluer le temps de parcours, on renvoie donc ND.
    function formatterTempsDeParcours(tempsParcoursEnHeure)
    {
        if (tempsParcoursEnHeure !== "ND" && tempsParcoursEnHeure !== 0)//si le temps de parcours est superieur a 0
        {
            var heures = Math.floor(tempsParcoursEnHeure);
            var min = Math.floor((tempsParcoursEnHeure-heures)*60);
            var sec = Math.floor((((tempsParcoursEnHeure-heures)*60) - min) *60);
            var tempsParcoursFormatte = null;    
            //formatter l'affichage du temps de parcours
            if (heures > 0)
            {
                if (min<10)
                    min = "0"+min;
                if (sec<10)
                    sec = "0"+sec;
                tempsParcoursFormatte = heures+ "h" + min + "m" + sec + "s";
            }
            else
            {
                if (sec<10)
                    sec = "0"+sec;
                tempsParcoursFormatte = min + "m" + sec + "s";
            }
            return tempsParcoursFormatte;
        }
        else//si le temps de parcours est inferieur a 0. ca veut dire qu'aucune donnees n'a été trouvée dans la bd par le backend
            return "ND";
        
    }
    
    //Faire disparaitre de la carteItineraire l'ancien itinéraire prédéfini sélectionné par l'utilisateur et reinitialiser les event handlers de son polylineForHover
    function gererAncienItinSelectionne()
    {
        //pour tous les éléments qui font partie de l'ancien itineraire prédéfini selectionné
       for (var i=0; i<itinSelectionneRenderArray.length; i++)
       {
           itinSelectionneRenderArray[i].setMap(null);//faire disparaitre le render
           itinSelectionnePolyForHoverArray[i].setMap(null);//faire disparaitre le polylineForHover de la carte
           itinSelectionnePolyForHoverArray[i].setOptions({
               strokeOpacity: 0//Remettre l'opacité du polylineForHover à 0
           })
           //Réinitialiser le mouseout Event handler sans persistence    
           ajouterPolylineForHoverMouseoutEventHandler(itinSelectionnePolyForHoverArray[i], carteItineraire, null, false);
       }
       itinSelectionneRenderArray = [];
       itinSelectionnePolyForHoverArray = [];
       indexDesPairesDeItineraireSelectionneArray = [];
    }
    
    //gérer la sélection des onglet "Réseau" et "Itinéraire"
    function changerOnglet()
    {
        //Si c'est la carte reseau qui est actuellement affichée
        if (typeof reseauDiv !== 'undefined')
        {
           //On copie le contenu du panneau de controle de reseau
            reseauDivContent = reseauDiv;
           
            //On change le panneau de controle pour celui de la carte itineraire
            panneauDeControleContentDiv.removeChild(panneauDeControleContentDiv.lastChild);
            panneauDeControleContentDiv.appendChild(itinerairesDivContent);
            
            //On fait disparaitre la carte de reseau et on affiche celle d'itineraire
            carteItineraireDiv.style.zIndex = "1";
            carteReseauDiv.style.zIndex = "-1";
            
            chargerItinChoisiDuLocalstorage();
        }
        
        //Si c'est la carte itineraire qui est affichée
        else if (typeof itinerairesDiv !== 'undefined')
        {
            //On copie le contenu du panneau de controle d'itineraire
            itinerairesDivContent = itinerairesDiv;
            
           //On change le panneau de controle pour celui de la carte reseau
            panneauDeControleContentDiv.removeChild(panneauDeControleContentDiv.lastChild);
            panneauDeControleContentDiv.appendChild(reseauDivContent);
            
            //On affiche la carte reseau et fait disparaitre la carte itineraire
            carteReseauDiv.style.zIndex = "1";
            carteItineraireDiv.style.zIndex = "-1";
        }
        //changer le style (css) de l'onglet sélectionné pour montrer qu'il est sélectionné
        updateStyleForPanneauControleTitle();
    }
    
    //chargler les itineraires choisis sauvegardés en localstorage
    function chargerItinChoisiDuLocalstorage()
    {
        //loader itinChoisiArray a partir du localStorage
            //si le localStorage contient une propriété itinChoisiArray 
            if (localStorage.itinChoisiArray !== null && localStorage.itinChoisiArray !== undefined)
            {
                //si les données du localStorage n'ont pas deja été chargées
                if (!localStorageDejaCharge)
                {
                    //charger le contenu JSON de localStorage.itinChoisiarray dans }itinChoisiArray
                    itinChoisiArray = JSON.parse(localStorage.itinChoisiArray);
                    localStorageDejaCharge = true;
                    
                    //Créer les radio buttons d'itinéraires choisis
                    for (var itineraire of itinChoisiArray)
                    {
                        creerItinChoisiRadioDiv(itineraire);
                    }
                    //on update le message indiquant le nbre d'itineraire choisi, car des itineraires deja choisi peuvent avoir été chargé a partir du localStorage
                    updateItinChoisisMessage();
                }
            }
    }
    
    //Attribuer le style CSS de sélection à l'onglet sélectionné
    function updateStyleForPanneauControleTitle()
    {
        if (panneauDeControle.querySelector('.ongletActif') !== null)
            panneauDeControle.querySelector('.ongletActif').classList.remove("ongletActif");
        if (carteActive === carteReseau)
            {
                panneauDeControle.querySelectorAll('.onglet')[0].classList.add("ongletActif");
                carteActive = carteItineraire;
            }
        else if (carteActive === carteItineraire)
            {
                panneauDeControle.querySelectorAll('.onglet')[1].classList.add("ongletActif");
                carteActive = carteReseau;
            }
    }
    
    //Affiche les div de checkbox de chaque itineraire dans le panneau de controle de la carteReseau 
    function initialiserCheckboxReseau()
    {     
        for (let i = 0; i < checkboxElementArray.length; i++)
        {
            reseauDivContent.querySelector("#allCheckboxsDiv").appendChild(checkboxElementArray[i]);   
        }
    }
    
    //Ajouter les options entreposées dans les liste originesArray et destArray aux options de origines et de destination des menu déroulant utilisé pour le filtre des paires
    function initialiserSelectOrigineDestination()
    {
        var originesArrayTrie = originesArray.sort();
        var destArrayTrie = destArray.sort();
        
        for (let i = 0; i < originesArrayTrie.length; i++)
        {   
            var option = document.createElement("option");
            option.setAttribute("value", originesArrayTrie[i]);
            option.innerHTML = originesArrayTrie[i];
            reseauDivContent.querySelector("#origineSelect").appendChild(option);
        }
        
        var option = document.createElement("option");
        option.setAttribute("value", "toutes");
        option.setAttribute("selected", "selected");
        option.innerHTML = "Toutes";
        reseauDivContent.querySelector("#origineSelect").insertBefore(option, reseauDivContent.querySelector("#origineSelect").firstChild);
        
        for (let i = 0; i < destArrayTrie.length; i++)
        {   
            var option = document.createElement("option");
            option.setAttribute("value", destArrayTrie[i]);
            option.innerHTML = destArrayTrie[i];
            reseauDivContent.querySelector("#destinationSelect").appendChild(option);
        }
        
        var option = document.createElement("option");
        option.setAttribute("value", "toutes");
        option.setAttribute("selected", "selected");
        option.innerHTML = "Toutes";
        reseauDivContent.querySelector("#destinationSelect").insertBefore(option, reseauDivContent.querySelector("#destinationSelect").firstChild);
        
        //Event handler qui gère la sélection d'origine ou de destination par l'utilisateur
        reseauDivContent.querySelector("#origineSelect").onchange = filtrerListeItineraires;
        reseauDivContent.querySelector("#destinationSelect").onchange = filtrerListeItineraires;
    }
    
    //Filter la liste des paires en fonction des options de filtre choisi par l'utilisateur
    function filtrerListeItineraires()
    {
        if (reseauDiv.querySelector('.aucunResultat') !== null)
        {
          reseauDiv.querySelector('.aucunResultat').outerHTML = "";  
        }
        var checkboxDivs = document.querySelectorAll(".checkboxDiv");
        var aucunResultat = true;
        for (var i = 0; i < checkboxDivs.length; i++)
        {
            var checkbox = checkboxDivs[i].querySelector("input");
            if 
            (
            (checkboxDivs[i].getAttribute("data-origine") == origineSelect.value ||
            origineSelect.value == "toutes" ||
            filtrerCheckbox.checked == false 
            )
            && 
            (checkboxDivs[i].getAttribute("data-dest") == destinationSelect.value ||
             destinationSelect.value == "toutes" ||
            filtrerCheckbox.checked == false )
            )
            {   
                if (checkbox.checked === false)
                    checkbox.click();
                checkboxDivs[i].style.display = "";
            }
            else
            {
                if (checkbox.checked)
                    checkbox.click();
                checkboxDivs[i].style.display = "none";
            }
            if (checkboxDivs[i].getAttribute("style") === null)
                aucunResultat = false;
        }
        
        if (aucunResultat)
        {
            reseauDiv.appendChild(aucunResultatDiv);
        }
    }
    
    //Gerer l'activation du menu de filtre du panneau de controle de la carteReseau
    function toggleMenuFiltre()
    {
        if (filtrerCheckbox.checked)
        {
            document.querySelectorAll(".optionsFiltreDesactive")[0].classList.add("optionsFiltre");
            document.querySelectorAll(".optionsFiltreDesactive")[1].classList.add("optionsFiltre");
            document.querySelectorAll(".optionsFiltre")[0].classList.remove("optionsFiltreDesactive");
            document.querySelectorAll(".optionsFiltre")[1].classList.remove("optionsFiltreDesactive");
            origineSelect.disabled = false;
            destinationSelect.disabled = false;  
        }
        else
        {
            document.querySelectorAll(".optionsFiltre")[0].classList.add("optionsFiltreDesactive");
            document.querySelectorAll(".optionsFiltre")[1].classList.add("optionsFiltreDesactive");
            document.querySelectorAll(".optionsFiltre")[0].classList.remove("optionsFiltre");
            document.querySelectorAll(".optionsFiltre")[0].classList.remove("optionsFiltre");
            origineSelect.disabled = true;
            destinationSelect.disabled = true;         
        }
        filtrerListeItineraires();
    }
})();



    
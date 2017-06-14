<?php
try {
	header('Content-type: application/json; charset=utf-8');
//DB info
	$servername = "localhost";
	$username = "root";
	$password = "adminsadvh";
	$dbProjetBT ="Projet_Bluetooth";
	$dbDonnees="DonneesFiltres";

// Create first connection
	$conxDBProjetBT = new mysqli($servername, $username, $password, $dbProjetBT);
	$conxDBProjetBT->query("SET NAMES 'utf8'");
// Check connection 
// if($conxDBProjetBT->connect_errno > 0)
	// die('Unable to connect to database' . $conxDBProjetBT->connect_error);
// else
	// echo "La base de donn�e est connect�e.";

//Create second connection
	$conxDBDonnees = new mysqli($servername, $username, $password, $dbDonnees);
	$conxDBDonnees->query("SET NAMES 'utf8'");
// check connection
// if($conxDBDonnees->connect_errno > 0)
	// die('Unable to connect to database' . $conxDBDonnees->connect_error);
// else
	// echo "la deuxieme base de donn�es est  connect�.";

//Preparation de la requete de BD d'itineraire
	$queryItineraires = "select Itineraire.IDItineraire, Itineraire.Description from Itineraire";
//Execution de la requete
	$queryItinResult = $conxDBProjetBT->query($queryItineraires);
//Traitement du resultat
//si le resultat contient au moins 1 ligne
	if ($queryItinResult->num_rows > 0) {

		$itinArray = array();//Liste globae des itineraire, à renvoyer au front-end
		$donneesManquantes = false; //boolean qui indique si des données sont manquantes pour calculer le temps de parcours et la vitesse moyenne de l'itineraire
		//Pour chaque itineraire
		while ($rowItin = $queryItinResult->fetch_assoc()) {
			$idItin = $rowItin['IDItineraire'];

			$tempsParcoursTotal = 0;//temps de parcours de l'itineraire
			$distanceTotale = 0;//distance de l'itineraire
			//aller chercher toute les paires faisant parties de l'itinéraire
			$queryIDPaires = "SELECT Assoc_paire_itin.IDPaire FROM Assoc_paire_itin where IDItineraire=" . $idItin;
			$queryIDPairesResult = $conxDBProjetBT->query($queryIDPaires);
			//Pour  chaque paire, sortir l'information n�cessaire
			$pairesArray = array();
			while ($rowIDPaire = $queryIDPairesResult->fetch_assoc()) {
				//calcul du temps de parcours median
				//aller chercher la distance specifique a la paire
				$queryDistancePaire = "Select Paire_Markers.Distance_km from Paire_Markers
									   where Paire_Markers.IDPaire = " . $rowIDPaire['IDPaire'];
				$queryDistancePaireResult = $conxDBProjetBT->query($queryDistancePaire);
				$rowDistancePaire = $queryDistancePaireResult->fetch_assoc();
				$distancePaire = floatval($rowDistancePaire['Distance_km']);

				//aller chercher les donn�es de temps de parcours sp�cifique � la paire pour les 5 derni�res minutes
				// temps en UTC, donc 4 heures plus tard que l'heure du Qu�bec
				//Calcul de temps sup�rieur pour les donn�es bidons de la base de donn�es DonneesFiltres qui sont toutes simul�es pour le 1er janvier 2016
				$dateDesDonneesBidons = 1451606400;//UTC epoch time du 1er janvier 2016 � 12h00am
				$time = $_POST['time'];//aller chercher le temps envoyé par la requête Ajax du javascript
				//$time = time(); //pour debug
				$dateDifference = $time - $dateDesDonneesBidons;
				$nbreJourDifference = floor($dateDifference / (60 * 60 * 24));
				$tempsSupperieur = $time - ($nbreJourDifference * 86400);
				$tempsInferieur = $tempsSupperieur - 300;

				//aller chercher le nom de la table dans la db DonneesFiltres qui correspond � la paire
				$queryNomTable = "select NomTableDonnees from Paire_Markers where IDPaire = " . $rowIDPaire['IDPaire'];
				$queryNomTableResult = $conxDBProjetBT->query($queryNomTable);
				$rowNomTable = $queryNomTableResult->fetch_assoc();
				$nomTable = $rowNomTable['NomTableDonnees'];

				//aller chercher les temps de parcours des 5 dernieres minutes
				$queryTravelTime = "SELECT TravelTime FROM " . $nomTable . " WHERE Times BETWEEN $tempsInferieur AND $tempsSupperieur ORDER BY TravelTime";
				$queryTravelTimeResult = $conxDBDonnees->query($queryTravelTime);

				$num_row = $queryTravelTimeResult->num_rows;
				//Faire la m�diane des temps de parcours des paires
				//Array containing the query results
				$travelTimeArray = array();
				//Display last 5 minutes data ordered
				if ($num_row > 0) {
					// output data of each row
					while ($rowTravelTime = $queryTravelTimeResult->fetch_assoc()) {
						$travelTimeArray[] = floatval($rowTravelTime["TravelTime"]);
					}
				}

				//Compute median
				//  Assuming the array x is sorted and is of length n:
				//	If n is odd then the median is x[(n-1)/2].
				//	If n is even than the median is ( x[n/2] + x[(n/2)-1] ) / 2.
				$travelTimeMedian = 0;
				$vitessePaire = 0;
				if ($num_row > 0) {
					if (($num_row % 2) == 0) {
						$travelTimeMedian = ($travelTimeArray[$num_row / 2] + $travelTimeArray[$num_row / 2 - 1]) / 2;
					} else {
						$travelTimeMedian = $travelTimeArray[($num_row - 1) / 2];
					}
					$travelTimeMedian = $travelTimeMedian / 3600;//transformer la mediane (qui est en seconde), en heure
					$vitessePaire = $distancePaire / $travelTimeMedian;//Calculer la vitesse spécifique à la paire
					$vitessePaire = round($vitessePaire, 0);//arrondir à l'unité
					$tempsParcoursTotal += $travelTimeMedian;
				}
				else
				{
					$donneesManquantes = true;
				}

				$distanceTotale += $distancePaire;

				//aller chercher les infos du marker constituant l'origine de la paire
				$queryPaireInfoOri = "select MarkerGoogle.Latitude, MarkerGoogle.Longitude, Route.Numero, MarkerGoogle.Direction, CapteurBT.Description, MarkerGoogle.IDMarker, CapteurBT.IDCapteur from MarkerGoogle 
								join Paire_Markers on MarkerGoogle.IDMarker = Paire_Markers.IDMarker_Orig
								join CapteurBT on MarkerGoogle.IDCapteur = CapteurBT.IDCapteur
								join Route on CapteurBT.IDRoute = Route.IDRoute
								where Paire_Markers.IDPaire = " . $rowIDPaire['IDPaire'];
				$queryPaireInfoOriResult = $conxDBProjetBT->query($queryPaireInfoOri);
				$rowOriInfo = $queryPaireInfoOriResult->fetch_assoc();
				//cr�er une liste avec les infos de l'origine
				$oriInfoArray['lat'] = $rowOriInfo['Latitude'];
				$oriInfoArray['lng'] = $rowOriInfo['Longitude'];
				$oriInfoArray['description'] = $rowOriInfo['Numero'] . " " . $rowOriInfo['Direction'] . " - " . $rowOriInfo['Description'];
				$oriInfoArray['idMarker'] = $rowOriInfo['IDMarker'];
				$oriInfoArray['idCapteur'] = $rowOriInfo['IDCapteur'];

				//aller chercher les infos du marker constituant la destination de la paire
				$queryPaireInfoDest = "select MarkerGoogle.Latitude, MarkerGoogle.Longitude, Route.Numero, MarkerGoogle.Direction, CapteurBT.Description, MarkerGoogle.IDMarker, CapteurBT.IDCapteur from MarkerGoogle 
								join Paire_Markers on MarkerGoogle.IDMarker = Paire_Markers.IDMarker_Dest
								join CapteurBT on MarkerGoogle.IDCapteur = CapteurBT.IDCapteur
								join Route on CapteurBT.IDRoute = Route.IDRoute
								where Paire_Markers.IDPaire = " . $rowIDPaire['IDPaire'];
				$queryPaireInfoDestResult = $conxDBProjetBT->query($queryPaireInfoDest);
				$rowDestInfo = $queryPaireInfoDestResult->fetch_assoc();
				//cr�er une liste avec les infos de la destination
				$destInfoArray['lat'] = $rowDestInfo['Latitude'];
				$destInfoArray['lng'] = $rowDestInfo['Longitude'];
				$destInfoArray['description'] = $rowDestInfo['Numero'] . " " . $rowDestInfo['Direction'] . " - " . $rowDestInfo['Description'];
				$destInfoArray['idMarker'] = $rowDestInfo['IDMarker'];
				$destInfoArray['idCapteur'] = $rowDestInfo['IDCapteur'];

				//créer la liste cotenant les infos de la paire
				$paireInfo = array();
				$paireInfo['idPaire'] = $rowIDPaire['IDPaire'];
				$paireInfo['orig'] = $oriInfoArray;
				$paireInfo['dest'] = $destInfoArray;
				$paireInfo['distance'] = $distancePaire;
				$paireInfo['vitesseMed'] = $vitessePaire;
				$paireInfo['tempsParcours'] = $travelTimeMedian;

				//ajouter la paire et ses infos à la liste d'objet "paires" de l'itinéraire
				$pairesArray[] = $paireInfo;
			}

			//Obtenir la vitesse moyenne � partir de vitesse pond�r�e
			if (!$donneesManquantes) {
				$vitesseMoyenne = $distanceTotale / $tempsParcoursTotal;
				$vitesseMoyenne = round($vitesseMoyenne, 0);//arrondir à l'unité
			}
			else
			{
				$tempsParcoursTotal = 0;//si on renvoie 0 au front-end, ce dernier comprend qu'il manque de donnnées et affichera ND pour le temps de parcours et la vitesse une culeur grise pour le troncon
				$vitesseMoyenne = 0;
			}

			//creer chaque liste d'info d'itineraire
			$itinInfo = array();
			$itinInfo['idItineraire'] = $idItin;
			$itinInfo['description'] = $rowItin['Description'];
			$itinInfo['vitesseMoy'] = $vitesseMoyenne;
			$itinInfo['distance'] = $distanceTotale;
			$itinInfo['tempsParcours'] = $tempsParcoursTotal;
			$itinInfo['paires'] = $pairesArray;

			//ajouter l'itineraire a la liste globale
			$itinArray[] = $itinInfo;
		}
		echo json_encode($itinArray);
	}
}
catch (Exception $e){
	echo $e->getMessage();
}
 ?>



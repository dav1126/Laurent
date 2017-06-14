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

//preparation de la requete de BD pour aller chercher les paires
	$queryPaires = "select * from Paire_Markers";
//Execution de la requete
	$queryPairesResult = $conxDBProjetBT->query($queryPaires);

//Traitement du resultat
//si le resultat contient au moins 1 ligne
	$pairesData = array();
	if ($queryPairesResult->num_rows > 0) {
		while ($rowPaire = $queryPairesResult->fetch_assoc()) {
			$idPaire = $rowPaire['IDPaire'];

			//aller chercher les donn�es de temps de parcours sp�cifique � la paire pour les 5 derni�res minutes
			// temps en UTC, donc 4 heures plus tard que l'heure du Qu�bec
			//Calcul de temps sup�rieur pour les donn�es bidons de la base de donn�es DonneesFiltres qui sont toutes simul�es pour le 1er janvier 2016
			$dateDesDonneesBidons = 1451606400;//UTC epoch time du 1er janvier 2016 � 12h00am
			//$time = time(); //pour debug
			$time = $_POST['time'];//aller chercher le temps envoyé par la requête Ajax du javascript
			$dateDifference = $time - $dateDesDonneesBidons;
			$nbreJourDifference = floor($dateDifference / (60 * 60 * 24));
			$tempsSupperieur = $time - ($nbreJourDifference * 86400);
			$tempsInferieur = $tempsSupperieur - 300;

			//aller chercher le nom de la table dans la db DonneesFiltres qui correspond � la paire
			$nomTable = $rowPaire['NomTableDonnees'];

			//aller chercher les temps de parcours des 5 dernieres minutes
			$queryTravelTime = "SELECT TravelTime FROM " . $nomTable . " WHERE Times BETWEEN $tempsInferieur AND $tempsSupperieur ORDER BY TravelTime";
			$queryTravelTimeResult = $conxDBDonnees->query($queryTravelTime);

			$num_row = $queryTravelTimeResult->num_rows;
			//Faire la m�diane des temps de parcours de la paire
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
			$tempsParcours = 0;
			$vitessePaire = 0;
			$distancePaire = floatval($rowPaire['Distance_km']);
			if ($num_row > 0) //si des resultats de temps de parcours ont été trouvés dans la bd, on calcul le tempsParcours et vitessePaire, sinon, ils restent a 0
			{
				if (($num_row % 2) == 0) {
					$tempsParcours = ($travelTimeArray[$num_row / 2] + $travelTimeArray[$num_row / 2 - 1]) / 2;
				} else {
					$tempsParcours = $travelTimeArray[($num_row - 1) / 2];
				}
				$tempsParcours = $tempsParcours / 3600;//transformer la mediane (qui est en seconde), en heure
				$vitessePaire = $distancePaire / $tempsParcours;//Calculer la vitesse spécifique à la paire
				$vitessePaire = round($vitessePaire, 0);//arrondir à l'unité
			}

			//aller chercher les infos du marker constituant l'origine de la paire
			$queryPaireInfoOri = "select MarkerGoogle.Latitude, MarkerGoogle.Longitude, Route.Numero, MarkerGoogle.Direction, CapteurBT.Description, MarkerGoogle.IDMarker, CapteurBT.IDCapteur from MarkerGoogle 
								join Paire_Markers on MarkerGoogle.IDMarker = Paire_Markers.IDMarker_Orig
								join CapteurBT on MarkerGoogle.IDCapteur = CapteurBT.IDCapteur
								join Route on CapteurBT.IDRoute = Route.IDRoute
								where Paire_Markers.IDPaire = " . $idPaire;
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
								where Paire_Markers.IDPaire = " . $idPaire;
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
			$paireInfo['idPaire'] = $idPaire;
			$paireInfo['orig'] = $oriInfoArray;
			$paireInfo['dest'] = $destInfoArray;
			$paireInfo['distance'] = $distancePaire;
			$paireInfo['vitesseMed'] = $vitessePaire;
			$paireInfo['tempsParcours'] = $tempsParcours;

			//ajouter la paire et ses infos à la liste pairesData
			$pairesData[] = $paireInfo;
		}

	}
	echo json_encode($pairesData);
}
catch (Exception $e){
	echo $e->getMessage();
}

//******************************************************************************************************************
?>



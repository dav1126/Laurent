<?php
header('Content-type: application/json; charset=utf-8');
//DB info
$servername = "localhost";
$username = "root";
$password = "adminsadvh";
$dbProjetBT ="Projet_Bluetooth";
$dbDonnees="DonneesFiltres";

// Create first connection
$conxDBProjetBT = new mysqli($servername, $username, $password,$dbProjetBT);
$conxDBProjetBT->query("SET NAMES 'utf8'");
// Check connection 
// if($conxDBProjetBT->connect_errno > 0)
	// die('Unable to connect to database' . $conxDBProjetBT->connect_error);
// else
	// echo "La base de donn�e est connect�e.";

//Create second connection
//$conxDBDonnees = new mysqli($servername, $username, $password,$dbDonnees);

// check connection
// if($conxDBDonnees->connect_errno > 0)
    // die('Unable to connect to database' . $conxDBDonnees->connect_error);
// else
    // echo "la deuxieme base de donn�es est  connect�.";

//Preparation de la requete de BD
$queryCapteurs = "select CapteurBT.IDCapteur, CapteurBT.Latitude, CapteurBT.Longitude, CapteurBT.Description, Route.Numero from CapteurBT join Route on CapteurBT.IDRoute = Route.IDRoute";
//Execution de la requete
$queryResult = $conxDBProjetBT->query($queryCapteurs);
//Traitement du resultat
//si le resultat contient au moins 1 ligne
if ($queryResult->num_rows >0)
 {
	 $capteurstArray = array();
	 $capteurInfoArray = [];
	 //Tant qu'il y a des lignes a traiter, traiter chaque ligne ($row)
	 while ($row = $queryResult -> fetch_assoc())
	 {	
		 //recuperer les infos du capteur
		 /* $capteurstArray[] = array('idCapteur' => $row['IDCapteur'], 'lat' => $row['Latitude'], 'lng' => $row['Longitude'], 'description' => $row['Numero'] . ' - ' . $row['Description']); */
		 
		 $capteursInfoArray['idCapteur'] = $row['IDCapteur'];
		 $capteursInfoArray['lat'] = $row['Latitude'];
		 $capteursInfoArray['lng'] = $row['Longitude'];
		 $capteursInfoArray['description'] = $row['Numero'] . ' - ' . $row['Description'];
		 //ajouter le capteur � la liste
		 array_push($capteurstArray, $capteursInfoArray);
	 }
	 //Encoder la liste de capteurs sous format JSON. Le echo permet de renvoyer le r�sultat � la requ�te AJAX du front-end.
	 echo json_encode($capteurstArray);
	 //var_dump($capteurstArray); //afficher le r�sultat
 }
 ?> 



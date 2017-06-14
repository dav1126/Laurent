(function(){
  "use strict"; 

    
  
  btclik.onclick=function donnees(){
      //
         var latOrig = document.querySelector("#latitude").value;
      var longOrig = document.querySelector("#longitude").value;
     var latDest = document.querySelector("#latitude2").value;
  var longDest = document.querySelector("#longitude2").value;
      
 // on envoi une requête pour activer le service d'itinéraire     
var directionsService = new google.maps.DirectionsService();

      // origine
      var Origine = new google.maps.LatLng(latOrig,longOrig);
      var Destination = new google.maps.LatLng(latDest,longDest);
      var request = {
          origin: Origine,
         destination: Destination,
          // on denifie le mode de tranport pour cette  ittineraire 
          travelMode: google.maps.DirectionsTravelMode.DRIVING
        };
      directionsService.route(request, function(response, status) {
          if (status == google.maps.DirectionsStatus.OK) {
//            directionsDisplay.setDirections(response);
            calcudistance(response);
          }
          else{
             alert("erreur de coordonnées") 
          }
        });
      // les quatres input sont vider apres avoir cliquer sur le button valider
      
        document.querySelector("#latitude").value="";
       document.querySelector("#longitude").value="";
       document.querySelector("#latitude2").value="";
       document.querySelector("#longitude2").value="";
    }
  
  function calcudistance(result)
  {   
//var distanceKm = google.maps.geometry.spherical.computeDistanceBetween(Origine, Destination);
//    distanceKm = distanceKm/1000;
//      distanceKm = Math.round(distanceKm*100)/100;
      var DistanceKm = 0;
      var tempsParcours = 0;
      var myroute = result.routes[0];
      for ( var i = 0; i < myroute.legs.length; i++) {
        DistanceKm += myroute.legs[i].distance.value;
        console.log(myroute.legs[i].distance.value);
          console.log("test");
        tempsParcours +=myroute.legs[i].duration.value;
      }
      DistanceKm = DistanceKm / 1000;
      var DistanceKmFormatte = DistanceKm.toFixed(3);
   document.querySelector("#resultDistance").innerHTML = "La distance est: " + DistanceKmFormatte + " Kilometre";  
  }
  
  
})();


	

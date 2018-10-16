      let map, infoWindow, pos;
      let global_map_radius = 2000;
      
      function getZoomLevel() {

        let radius = global_map_radius
        let scale = radius / 500;
        let zoomLevel = Math.round(16 - Math.log(scale) / Math.log(2));
        
        return zoomLevel;
        }
      
      //piirretään kartta
      function initMap() {
        
        let zoomLevel = getZoomLevel();
        
        
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: -34.397, lng: 150.644},
          zoom: zoomLevel
        });
        infoWindow = new google.maps.InfoWindow;

      // etsitään sijainti Geolocationilla
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(setAndSavePosition, handleLocationError(true, infoWindow, map.getCenter()))
         
        }else {
          handleLocationError(false, infoWindow, map.getCenter());
        }
      }
      
      function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);
      }
      
      
      //Jos sijainti löytyy kohdistetaan kartta ja tallennetaan koordinaatit.
      function setAndSavePosition(position) {
            pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            let myLocationMarker = new google.maps.Marker({
              map: map,
              position: new google.maps.LatLng(pos.lat, pos.lng) 
            });
            
            //vihreä ikoni => oma sijainti
            myLocationMarker.setIcon('https://maps.google.com/mapfiles/ms/icons/green-dot.png');
            myLocationMarker.setMap(map);
            infoWindow.setPosition(pos);
            infoWindow.setContent('Your current location.');
            infoWindow.open(map);
            map.setCenter(pos);
            //searchPlaces(pos);
          }
      
      
      
      let onFailure_local //muuttuja on failure callbackin handlea varten
      //etsitään valittuja palveluita
       async function searchPlaces(serviceType, radius,onFailureCallback) {
        onFailure_local = onFailureCallback
        /*määritetään haun ominaisuudet*/
        let request = {
            location: pos,
            radius: radius,
            type: serviceType
        };
        
        let service = new google.maps.places.PlacesService(map);
        
        service.nearbySearch(request, callback);
        
      }
      
      //haetaan lähellä olevat palvelut
      function callback(results, status) {
          if(status == google.maps.places.PlacesServiceStatus.OK) {
            
              
              for(var i = 0; i < results.length; i++) {
                  createMarker(results[i]);
              }
          }else {
                // jos tuloksia 0 palautetaan viite onFailureCallback funktioon
                onFailure_local()

          }
      }
      
      
      //luodaan googleMarker kartalle palvelun kordinaatteihin
      function createMarker(place) {
        
        let marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
        });
        
        //klikattaessa markeria näytetään palvelun tiedot
        google.maps.event.addListener(marker, 'click', function() {

         let url = "\"https://www.google.com/maps/search/?api=1&query=Google&query_place_id=" + place.reference +"\"";
          
          //luodaan string jossa palvelun tiedot
          let contentString = "<h3>" + place.name + "</h3>Address: " + place.vicinity + "<br></br>Keywords: ";
          place.types.forEach(type => {
            
            type = type.replace(/_/g, ' ');
            contentString += type + ", ";
          });
          //poistetaan ylimääräinen ", ":
          contentString = contentString.slice(0, -2);
          
          //luodaan linkki avautumaan popup ikkunaan
          contentString += "<br></br><a href=" + url + " target=\"popup\"  onclick=\"makePopUpWindow(this.href)\">Open Link</a>";
          infoWindow.setContent(contentString);
          infoWindow.open(map, this);
        
      });
      }
      
      function getAsyncPosInfo(location) {
        var geocoder = new google.maps.Geocoder;
        return new Promise(function(resolve, reject) {
          geocoder.geocode(location, resolve);
        });
      }
  
      //get address and other info for database
      async function getPositionInformation(){
        
        var latlng = {lat: parseFloat(pos.lat), lng: parseFloat(pos.lng)};
        var geocoder = new google.maps.Geocoder;
        
  
        
        
        const result = await getAsyncPosInfo({'location': latlng})
        
        return handleLocationResults(result)   
        
      }
      
      function handleLocationResults(results) {
          if (results[0]) {
              console.log('address', results[0])
              return results[0];
          } else {
            return -1;
          }
        }
        
      function makePopUpWindow(url) {
         window.open(url,'popUpWindow','height=800,width=800,left=100,top=100,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no, status=yes');
      }
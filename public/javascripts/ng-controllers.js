"use strict";

var RRRSControllers = angular.module('rrrs.Controllers', []);

RRRSControllers.controller('RealTimeStreamingController', ['$scope', '$http', 'uiGmapGoogleMapApi', function($scope, $http, GoogleMapApi) {
    var directionsDisplay;
    var directionsService;
    var maxtime = 0;
    var mintime = 0;
    var curtime = 0;
    var icons = ["/images/restaurant1.png","/images/restaurant2.png","/images/restaurant3.png","/images/restaurant4.png"]
    GoogleMapApi.then(function(maps) {
        maps.visualRefresh = true;
        $scope.defaultBounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(40.82148, -73.66450),
          new google.maps.LatLng(40.66541, -74.31715)
        );
        
        
        $scope.map.bounds = {
          northeast: {
            latitude:$scope.defaultBounds.getNorthEast().lat(),
            longitude:$scope.defaultBounds.getNorthEast().lng()
          },
          southwest: {
            latitude:$scope.defaultBounds.getSouthWest().lat(),
            longitude:-$scope.defaultBounds.getSouthWest().lng()
          }
        };

        directionsDisplay = new google.maps.DirectionsRenderer();
        directionsService = new google.maps.DirectionsService();
        $scope.searchbox.options.bounds = new google.maps.LatLngBounds($scope.defaultBounds.getNorthEast(), $scope.defaultBounds.getSouthWest());
    });
    
    $scope.data = {};

    var userLongitude;
    var userLatitude;

    $scope.searchbox = {
      template:'searchbox.tpl.html',
      position:'top-left',
      options: {
        bounds: {} 
      },
      //parentdiv:'searchBoxParent',
      events: {
        places_changed: function (searchBox) {
          var places = searchBox.getPlaces();
          if (places.length == 0) {
            return;
          }
          
          var bounds = new google.maps.LatLngBounds();
          var place = places[0];
                
          userLongitude = place.geometry.location.lng();
          userLatitude = place.geometry.location.lat();

            cleanUp();
            // set up the map center and zoom level
            $scope.map.center = {
                longitude: place.geometry.location.lng(),
                latitude: place.geometry.location.lat()
            };
            $scope.map.zoom = 10;
            var marker = {
                id: 0,
                icon: "/images/user.png",
                geometry: {
                    latitude: place.geometry.location.lat(),
                    longitude: place.geometry.location.lng()
                },
                name: place.name,
                fulladdress: place.formatted_address,
                review_count: 0,
                show: false
                };
                marker.onClick = function() {
                    marker.show = !marker.show;
                };
                $scope.map.markers.push(marker);
        }
      }   
    };

  $scope.map = {
        control: {},
        center: {
            latitude: 40.74349,
            longitude: -73.990822
        },
        zoom: 3,
        dragging: false,
        bounds: {},
        markers: [],
        markersControl: {},
        events: {
            idle: function (map) {
                var bounds = map.getBounds();
                var ne = bounds.getNorthEast(); // LatLng of the north-east corner
                //console.log("ne bounds " + ne.lat() + ", " + ne.lng());
                var sw = bounds.getSouthWest(); // LatLng of the south-west corder
                //console.log("sw bounds " + sw.lat() + ", " + sw.lng());
            }
        }
        };

  var count = 1;
    var destLatitude;
    var destLongitude;

    $scope.sendKeyWord = function() {
        var Rstyle = $scope.Rstyle;
        var Rreviews = $scope.Rreviews;
        console.dir(userLatitude);
        console.dir(userLongitude);

        var keyWord = Rstyle.concat(',', Rreviews, ',', userLatitude, ',', userLongitude);
        if(keyWord) {
            $http.post('/sendKeyWord', {msg : keyWord}).
            success(function(data) {
                console.dir(data);
                $scope.data = data;
                getTime();
                console.log($scope.data);
                data.forEach(function(v) {
                    if(v.full_address != null) {
                        var marker = {
                            id: count,
                            icon: "/images/restaurant.png",
                            geometry: {
                                latitude: v.latitude,
                                longitude: v.longitude
                            },
                            name: v.name,
                            fulladdress: v.full_address,
                            review_count: v.review_count,
                            show: false
                        };
                        marker.icon = icons[v.expense-1]
                        marker.onClick = function() {
                            marker.show = !marker.show;
                            destLatitude = marker.geometry.latitude;
                            destLongitude = marker.geometry.longitude;
                            calcRoute();
                        };
                        //console.log(marker);
                        count++;
                        $scope.map.markers.push(marker);
                    }
                });
                
            }).
            error(function(err) {
                console.log(err);
            });
        } else {
            alert('You must enter a valid meaningful streaming keyWord');
        }
        
    };

    var pathColor = function( time ){
        var option = {
            polylineOptions: {
              strokeColor: "blue"
            }
        };
        if(time-mintime<(maxtime-mintime)/3){
            option.polylineOptions.strokeColor = "blue";
            return option;
        }
        if(time-mintime<2*(maxtime-mintime)/3){
            option.polylineOptions.strokeColor = "yellow";
            return option;
        } else {
            option.polylineOptions.strokeColor = "red";
            return option;
        }
    };

    var cleanUp = function() {
        $scope.map.markersControl.getGMarkers().forEach(function(marker) {
            marker.setMap(null);
        });
        $scope.map.markers = [];
        directionsDisplay.setMap(null);
    };

    $scope.cleanMarkers = cleanUp;

    

    var calcRoute = function () {
        console.log("cal " + typeof(userLatitude) + userLatitude);
        var routePoints = {
        //start: new google.maps.LatLng(userLatitude, userLongitude),
        //end: new google.maps.LatLng(destLatitude, destLongitude)
        start: userLatitude + "," + userLongitude,
        end: destLatitude + "," + destLongitude
        };
        //var trafficLayer = new google.maps.TrafficLayer();
        //trafficLayer.setMap($scope.map.control.getGMap());
        directionsDisplay.setMap($scope.map.control.getGMap());
        var request = {
          origin: routePoints.start,
          destination: routePoints.end,
          travelMode: google.maps.TravelMode.DRIVING
        };
        directionsService.route(request, function(response, status) {
          if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setOptions(pathColor(curtime));
            directionsDisplay.setDirections(response);
            showDetail(response);
          }
        });
    };

    var showDetail = function(directionResult) {
        var myRoute = directionResult.routes[0].legs[0];
        $scope.distance = myRoute.distance.text;
        $scope.duration = myRoute.duration.text;
    };

    // Chen's code
    var getTime = function(){
        var timeRoutePoints = {
        //start: new google.maps.LatLng(userLatitude, userLongitude),
        //end: new google.maps.LatLng(destLatitude, destLongitude)
            start: userLatitude + "," + userLongitude,
            end: ""//destLatitude + "," + destLongitude
        };
        $scope.data.forEach(function(v){
            timeRoutePoints.end = v.latitude+","+v.longitude;
            var request = {
                origin: timeRoutePoints.start,
                destination: timeRoutePoints.end,
                travelMode: google.maps.TravelMode.DRIVING
            };
            directionsService.route(request, function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    var myRoute = response.routes[0].legs[0];
                    v.time = myRoute.duration.value;
                    maxtime = Math.max(v.time,maxtime);
                    mintime = Math.min(v.time,mintime);
                    v.duration = myRoute.duration.text;
                }
            });

        });
    };
    $scope.toGo = function(detailData) {
        destLatitude = detailData.latitude;
        destLongitude = detailData.longitude;
        curtime = detailData.time;
        calcRoute();
    };
}]);
"use strict";

var rrrs = angular.module('rrrs', ['ngRoute', 'ngResource', 'rrrs.Controllers', 'rrrs.Services', 'ui.bootstrap', 'uiGmapgoogle-maps']);

rrrs.config(['uiGmapGoogleMapApiProvider', function (GoogleMapApi) {
  GoogleMapApi.configure({
//    key: 'your api key',
    key: 'AIzaSyDCdwlKea2jiNxYLXVlpS9GwGUrUBJPCT4',
    v: '3.17',
    libraries: 'places'
  });
}]);

rrrs.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
  when('/real_time_streaming', {
    templateUrl: 'partials/real_time_streaming.htm',
    controller: 'RealTimeStreamingController'
  }).
  otherwise({
    redirectTo: '/'
  });
}]);

rrrs.run(['$templateCache', function ($templateCache) {
  $templateCache.put('searchbox.tpl.html', '<input id="pac-input" class="pac-controls" type="text" placeholder="Search Box">');
}]);

rrrs.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});

rrrs.filter('reverse', function() {
  return function(items) {
    return (items != null ? items.slice().reverse() : []);
  };
});




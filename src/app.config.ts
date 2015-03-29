module todo {
  'use strict';

  angular.module('todo')
    .config(config);

  config.$inject = ['$routeProvider', '$locationProvider'];

  function config($routeProvider: ng.route.IRouteProvider,
                  $locationProvider: ng.ILocationProvider): void {
    $routeProvider.otherwise('/');

    $locationProvider.html5Mode(true);
  }
}

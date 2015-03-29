module todo {
  'use strict';

  angular.module('todo')
    .config(config);

  config.$inject = ['$routeProvider'];

  function config($routeProvider: ng.route.IRouteProvider): void {
    var routeConfig: ng.route.IRoute = {
      templateUrl: 'todo/todos.todo.tpl.html',
      controller: 'TodoCtrl',
      controllerAs: 'vm'
    };

    $routeProvider
      .when('/', routeConfig)
      .when('/:status', routeConfig);
  }
}

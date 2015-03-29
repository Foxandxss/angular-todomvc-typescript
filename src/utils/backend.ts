module todo {
  'use strict';

  angular.module('todo')
    .config(decorateHttp)
    .run(setBackend);

  decorateHttp.$inject = ['$provide'];

  function decorateHttp($provide: ng.auto.IProvideService): void {
    $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
  }

  setBackend.$inject = ['$httpBackend'];

  function setBackend($httpBackend : ng.IHttpBackendService): void {
    var things: ITodo[] = [
      {
        id: 0,
        title: 'Finish fake backend',
        completed: true
      },
      {
        id: 1,
        title: 'Make some cool stuff',
        completed: false
      },
      {
        id: 2,
        title: 'Brainstorm new projects',
        completed: false
      }
    ];

    $httpBackend.whenGET('/api/todos').respond(200, things);

    $httpBackend.whenPOST('/api/todos').respond((method, url, data, headers) => {
      var newItem: ITodo = JSON.parse(data);
      newItem.id = things.length;
      things.push(newItem);

      return [201, newItem];
    });

    $httpBackend.whenPUT(/^\/api\/todos\/\d+$/).respond((method, url, data, headers) => {
      var item: ITodo = JSON.parse(data);
      for (var i = 0, l = things.length; i < l; i++) {
        if (things[i].id === item.id) {
          things[i] = item;
          break;
        }
      }

      return [200, item];
    });

    $httpBackend.whenDELETE(/^\/api\/todos\/\d+$/).respond((method, url, data, headers) => {
      var regex = /^\/api\/todos\/(\d+)/g;

      var id: number = parseInt(regex.exec(url)[1], 10); // First match on the second item.

      for (var i = 0, l = things.length; i < l; i++) {
        if (things[i].id === id) {
          var index = things.indexOf(things[id]);
          things.splice(index, 1);
          break;
        }
      }

      return [204];
    });

    $httpBackend.whenGET(/\.html/).passThrough();
  }
}

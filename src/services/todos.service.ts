module todo {
  'use strict';

  export interface ITodosStoreService {
    todos: ITodo[];

    get: () => ng.IPromise<ITodo[]>;
    insert: (todo: ITodo) => ng.IPromise<ITodo[]>;
    clearCompleted: () => ng.IPromise<ITodo[]>;
    put: (todo: ITodo) => ng.IPromise<ITodo[]>;
    delete: (todo: ITodo) => ng.IPromise<ITodo[]>;
  }

  export interface ITodo {
    id?: number;
    title: string;
    completed: boolean;
  }

  class TodosService implements ITodosStoreService {
    todos: ITodo[];
    foo: number;

    static $inject = ['$http'];
    constructor(private $http: ng.IHttpService) {
      this.todos = [];
    }

    get(): ng.IPromise<ITodo[]> {
      return this.$http.get('/api/todos')
        .then((response: ng.IHttpPromiseCallbackArg<ITodo[]>): ITodo[] => {
          angular.copy(response.data, this.todos);
          return this.todos;
        });
    }

    insert(todo: ITodo): ng.IPromise<ITodo[]> {
      var originalTodos: ITodo[] = this.todos.slice(0);

      return this.$http.post('/api/todos', todo)
        .then((response: ng.IHttpPromiseCallbackArg<ITodo>): ITodo[] => {
          todo.id = response.data.id;
          this.todos.push(todo);
          return this.todos;
        }, (): ITodo[] => {
          angular.copy(originalTodos, this.todos);
          return originalTodos;
        });
    }

    put(todo: ITodo): ng.IPromise<ITodo[]> {
      var originalTodos: ITodo[] = this.todos.slice(0);

      return this.$http.put('/api/todos/' + todo.id, todo)
        .then((): ITodo[] => {
          return this.todos;
        }, (): ITodo[] => {
          angular.copy(originalTodos, this.todos);
          return originalTodos;
        });
    }

    delete(todo: ITodo): ng.IPromise<ITodo[]> {
      var originalTodos: ITodo[] = this.todos.slice(0);

      this.todos.splice(this.todos.indexOf(todo), 1);

      return this.$http.delete('/api/todos/' + todo.id)
        .then((): ITodo[] => {
          return this.todos;
        }, (): ITodo[] => {
          angular.copy(originalTodos, this.todos);
          return originalTodos;
        });
    }

    clearCompleted(): ng.IPromise<ITodo[]> {
      var originalTodos: ITodo[] = this.todos.slice(0);

      var completeTodos: ITodo[];
      var incompleteTodos: ITodo[];
      this.todos.forEach((todo: ITodo) => {
        if (todo.completed) {
          completeTodos.push(todo);
        } else {
          incompleteTodos.push(todo);
        }
      });

      angular.copy(incompleteTodos, this.todos);

      return this.$http.delete('/api/todos')
        .then((): ITodo[] => {
          return this.todos;
        }, (): ITodo[] => {
          angular.copy(originalTodos, this.todos);
          return originalTodos;
        })
    }
  }

  angular.module('todo')
    .service('todos', TodosService);
}

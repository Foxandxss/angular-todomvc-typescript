module todo {
  'use strict';

  interface ITodoScope {
    todos: ITodo[];
    newTodo: string;
    editedTodo: ITodo;
    originalTodo: ITodo;
    remainingCount: number;
    completedCount: number;
    allChecked: boolean;
    status: string;
    saving: boolean;
    saveEvent: string;
    reverted: boolean;
    statusFilter: { completed: boolean};

    addTodo: () => void;
    editTodo: (todo: ITodo) => void;
    saveEdits: (todo: ITodo, event: string) => void;
    revertEdits: (todo: ITodo) => void;
    removeTodo: (todo: ITodo) => void;
    saveTodo: (todo: ITodo) => void;
    toggleCompleted: (todo: ITodo, completed: boolean) => void;
    clearCompletedTodos: () => void;
    markAll: (completed: boolean) => void;
  }

  interface IRouteParams extends ng.route.IRouteParamsService {
    status: string;
  }

  class TodoCtrl implements ITodoScope {
    todos:ITodo[];
    newTodo:string;
    editedTodo:ITodo;
    originalTodo: ITodo;
    remainingCount: number;
    completedCount: number;
    allChecked: boolean;
    status: string;
    saving: boolean;
    saveEvent: string;
    reverted: boolean;
    statusFilter: { completed: boolean};

    static $inject = ['$scope', '$routeParams', '$filter', 'todos'];
    constructor(private $scope:ng.IScope,
                private $routeParams:IRouteParams,
                private $filter:ng.IFilterService,
                private todosStore:ITodosStoreService) {
      this.todos = todosStore.todos;

      this.$scope.$watch(() => this.todos, () => {
        this.remainingCount = this.$filter('filter')(this.todos, { completed: false }).length;
        this.completedCount = this.todos.length - this.remainingCount;
        this.allChecked = !this.remainingCount;
      }, true);

      this.$scope.$on('$routeChangeSuccess', () => {
        this.status = this.$routeParams.status || '';

        this.statusFilter = (status === 'active') ?
          { completed: false } : (status === 'completed') ?
          { completed: true } : null;
      });

      todosStore.get();
    }

    addTodo(): void {
      var newTodo: ITodo = {
        title: this.newTodo.trim(),
        completed: false
      };

      if (!newTodo.title) return;

      this.saving = true;

      this.todosStore.insert(newTodo)
        .then(() => {
          this.newTodo = '';
        }).finally(() => {
          this.saving = false;
        });
    }

    editTodo(todo: ITodo): void {
      this.editedTodo = todo;
      // Clone the original todo to restore it on demand.
      this.originalTodo = angular.extend({}, todo);
    }

    saveEdits(todo: ITodo, event: string): void {
      // Blur events are automatically triggered after the form submit event.
      // This does some unfortunate logic handling to prevent saving twice.
      if (event === 'blur' && this.saveEvent === 'submit') {
        this.saveEvent = null;
        return;
      }

      this.saveEvent = event;

      if (this.reverted) {
        // Todo edits were reverted-- don't save.
        this.reverted = null;
        return;
      }

      todo.title = todo.title.trim();

      if (todo.title === this.originalTodo.title) {
        return;
      }

      this.todosStore[todo.title ? 'put' : 'delete'](todo)
        .then(() => {}, () => {
          todo.title = this.originalTodo.title;
        }).finally(() => {
          this.editedTodo = null;
        });
    }

    revertEdits(todo: ITodo): void {
      this.todos[this.todos.indexOf(todo)] = this.originalTodo;
      this.editedTodo = null;
      this.originalTodo = null;
      this.reverted = true;
    }

    removeTodo(todo: ITodo): void {
      this.todosStore.delete(todo);
    }

    saveTodo(todo: ITodo): void {
      this.todosStore.put(todo);
    }

    toggleCompleted(todo: ITodo, completed: boolean): void {
      if (angular.isDefined(completed)) {
        todo.completed = completed;
      }

      this.todosStore.put(todo)
        .then(() => {}, () => {
          todo.completed = !todo.completed;
        });
    }

    clearCompletedTodos(): void {
      this.todosStore.clearCompleted();
    }

    markAll(completed: boolean): void {
      this.todos.forEach((todo: ITodo) => {
        if (todo.completed !== completed) {
          this.toggleCompleted(todo, completed);
        }
      });
    }
  }

  angular.module('todo')
    .controller('TodoCtrl', TodoCtrl);
}

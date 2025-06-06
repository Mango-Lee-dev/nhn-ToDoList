import { State, Subscriber, Selector, Action, TodoFilter } from "@/types/state";
import { TodoItem } from "@/types/items";

export default class StateManager {
  private state: State;
  private subscribers: Map<string, Subscriber>;
  private selectors: Map<string, Selector<any>>;

  constructor() {
    this.state = {
      todoList: [],
      currentFilter: "all",
    };
    this.subscribers = new Map();
    this.selectors = new Map();

    this.registerSelector("todoList", (state) => state.todoList);
    this.registerSelector("currentFilter", (state) => state.currentFilter);

    this.registerSelector("allTodos", (state) =>
      state.todoList.filter((todo) => !todo.isDeleted)
    );
    this.registerSelector("pendingTodos", (state) =>
      state.todoList.filter((todo) => !todo.isDeleted && !todo.isDone)
    );
    this.registerSelector("completedTodos", (state) =>
      state.todoList.filter((todo) => !todo.isDeleted && todo.isDone)
    );
    this.registerSelector("deletedTodos", (state) =>
      state.todoList.filter((todo) => todo.isDeleted)
    );

    this.registerSelector("activeTodos", (state) => {
      const allTodos = state.todoList.filter((todo) => !todo.isDeleted);

      switch (state.currentFilter) {
        case "pending":
          return allTodos.filter((todo) => !todo.isDone);
        case "completed":
          return allTodos.filter((todo) => todo.isDone);
        case "all":
        default:
          return allTodos;
      }
    });
    this.registerSelector("filterCounts", (state) => {
      const allTodos = state.todoList.filter((todo) => !todo.isDeleted);
      return {
        all: allTodos.length,
        pending: allTodos.filter((todo) => !todo.isDone).length,
        completed: allTodos.filter((todo) => todo.isDone).length,
      };
    });
  }

  getState(): State {
    return { ...this.state };
  }

  select<T>(selectorName: string): T {
    const selector = this.selectors.get(selectorName);
    if (!selector) {
      throw new Error(`Selector '${selectorName}' not found`);
    }
    return selector(this.state);
  }

  registerSelector<T>(name: string, selector: Selector<T>): void {
    this.selectors.set(name, selector);
  }

  subscribe(id: string, subscriber: Subscriber): () => void {
    this.subscribers.set(id, subscriber);

    return () => {
      this.subscribers.delete(id);
    };
  }

  private setState(newState: State): void {
    this.state = { ...newState };
    this.notifySubscribers();
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((subscriber) => {
      subscriber(this.getState());
    });
  }

  dispatch(action: Action): void {
    const newState = this.reducer(this.state, action);
    this.setState(newState);
  }

  private reducer(state: State, action: Action): State {
    switch (action.type) {
      case "SET_FILTER":
        return {
          ...state,
          currentFilter: action.payload.filter,
        };

      case "CLEAR_COMPLETED":
        return {
          ...state,
          todoList: state.todoList.map((todo) =>
            todo.isDone && !todo.isDeleted
              ? {
                  ...todo,
                  isDeleted: true,
                  updatedAt: new Date().toISOString(),
                }
              : todo
          ),
        };

      case "ADD_TODO":
        return {
          ...state,
          todoList: [
            ...state.todoList,
            {
              id: this.generateId(),
              title: action.payload.title,
              isDone: false,
              isDeleted: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        };

      case "TOGGLE_TODO":
        const updatedTodos = state.todoList.map((todo) =>
          todo.id === action.payload.id
            ? {
                ...todo,
                isDone: !todo.isDone,
                updatedAt: new Date().toISOString(),
              }
            : todo
        );

        const pendingTodos = updatedTodos.filter(
          (todo) => !todo.isDone && !todo.isDeleted
        );
        const completedTodos = updatedTodos.filter(
          (todo) => todo.isDone && !todo.isDeleted
        );
        const deletedTodos = updatedTodos.filter((todo) => todo.isDeleted);

        return {
          ...state,
          todoList: [...pendingTodos, ...completedTodos, ...deletedTodos],
        };

      case "DELETE_TODO":
        return {
          ...state,
          todoList: state.todoList.map((todo) =>
            todo.id === action.payload.id
              ? {
                  ...todo,
                  isDeleted: true,
                  updatedAt: new Date().toISOString(),
                }
              : todo
          ),
        };

      case "UPDATE_TODO":
        return {
          ...state,
          todoList: state.todoList.map((todo) =>
            todo.id === action.payload.id
              ? {
                  ...todo,
                  title: action.payload.title,
                  updatedAt: new Date().toISOString(),
                }
              : todo
          ),
        };

      case "RESTORE_TODO":
        return {
          ...state,
          todoList: state.todoList.map((todo) =>
            todo.id === action.payload.id
              ? {
                  ...todo,
                  isDeleted: false,
                  updatedAt: new Date().toISOString(),
                }
              : todo
          ),
        };

      default:
        return state;
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getTodoById(id: string): TodoItem | undefined {
    return this.state.todoList.find((todo) => todo.id === id);
  }

  setFilter(filter: TodoFilter): void {
    this.dispatch({
      type: "SET_FILTER",
      payload: { filter },
    });
  }

  clearCompleted(): void {
    this.dispatch({
      type: "CLEAR_COMPLETED",
    });
  }

  getCurrentFilter(): TodoFilter {
    return this.state.currentFilter;
  }

  debug(): void {
    console.log("Current State:", this.state);
    console.log("Subscribers:", Array.from(this.subscribers.keys()));
    console.log("Selectors:", Array.from(this.selectors.keys()));
  }
}

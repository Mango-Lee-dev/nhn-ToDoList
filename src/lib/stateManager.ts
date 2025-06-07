import { State, Subscriber, Selector, Action, TodoFilter } from "@/types/state";
import { TodoItem } from "@/types/items";

type SelectorReturnType =
  | TodoItem[]
  | TodoFilter
  | { all: number; pending: number; completed: number };

export default class StateManager {
  private state: State;
  private subscribers: Map<string, Subscriber>;
  private selectors: Map<string, Selector<SelectorReturnType>>;

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

  select<T extends SelectorReturnType>(selectorName: string): T {
    const selector = this.selectors.get(selectorName);
    if (!selector) {
      throw new Error(`Selector '${selectorName}' not found`);
    }
    return selector(this.state) as T;
  }

  registerSelector(name: string, selector: Selector<SelectorReturnType>): void {
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
        const newTodo = {
          id: this.generateId(),
          title: action.payload.title,
          isDone: false,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const pendingTodos = state.todoList.filter(
          (todo) => !todo.isDone && !todo.isDeleted
        );
        const completedTodos = state.todoList.filter(
          (todo) => todo.isDone && !todo.isDeleted
        );
        const deletedTodos = state.todoList.filter((todo) => todo.isDeleted);

        return {
          ...state,
          todoList: [
            newTodo,
            ...pendingTodos,
            ...completedTodos,
            ...deletedTodos,
          ],
        };

      case "TOGGLE_TODO":
        const todoIndex = state.todoList.findIndex(
          (todo) => todo.id === action.payload.id
        );
        if (todoIndex === -1) return state;

        const updatedTodo = {
          ...state.todoList[todoIndex],
          isDone: !state.todoList[todoIndex].isDone,
          updatedAt: new Date().toISOString(),
        };

        const newTodoList = [...state.todoList];
        newTodoList[todoIndex] = updatedTodo;

        const pendingItems = newTodoList.filter(
          (todo) => !todo.isDone && !todo.isDeleted
        );
        const completedItems = newTodoList.filter(
          (todo) => todo.isDone && !todo.isDeleted
        );
        const deletedItems = newTodoList.filter((todo) => todo.isDeleted);

        let finalPendingItems, finalCompletedItems;

        if (updatedTodo.isDone) {
          finalPendingItems = pendingItems;
          finalCompletedItems = [
            ...completedItems.filter((todo) => todo.id !== updatedTodo.id),
            updatedTodo,
          ];
        } else {
          const otherPendingItems = pendingItems.filter(
            (todo) => todo.id !== updatedTodo.id
          );
          const sortedByCreatedAt = [...otherPendingItems, updatedTodo].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          finalPendingItems = sortedByCreatedAt;
          finalCompletedItems = completedItems;
        }

        return {
          ...state,
          todoList: [
            ...finalPendingItems,
            ...finalCompletedItems,
            ...deletedItems,
          ],
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

      case "REORDER_TODOS":
        const { newOrder } = action.payload;
        const reorderedTodos = newOrder
          .map((id) => state.todoList.find((todo) => todo.id === id)!)
          .filter(Boolean);
        const deletedTodoList = state.todoList.filter((todo) => todo.isDeleted);
        return {
          ...state,
          todoList: [...reorderedTodos, ...deletedTodoList],
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

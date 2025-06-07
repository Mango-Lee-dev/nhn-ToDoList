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

    this.registerSelector("pendingTodos", (state) =>
      state.todoList.filter((todo) => !todo.isDone)
    );
    this.registerSelector("completedTodos", (state) =>
      state.todoList.filter((todo) => todo.isDone)
    );

    this.registerSelector("activeTodos", (state) => {
      switch (state.currentFilter) {
        case "pending":
          return state.todoList.filter((todo) => !todo.isDone);
        case "completed":
          return state.todoList.filter((todo) => todo.isDone);
        case "all":
        default:
          return state.todoList;
      }
    });

    this.registerSelector("filterCounts", (state) => {
      const pendingTodos = state.todoList.filter((todo) => !todo.isDone);
      const completedTodos = state.todoList.filter((todo) => todo.isDone);

      return {
        all: state.todoList.length,
        pending: pendingTodos.length,
        completed: completedTodos.length,
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
          todoList: state.todoList.filter((todo) => !todo.isDone),
        };

      case "ADD_TODO":
        const newTodo = {
          id: this.generateId(),
          title: action.payload.title,
          isDone: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const pendingTodos = state.todoList.filter((todo) => !todo.isDone);
        const completedTodos = state.todoList.filter((todo) => todo.isDone);

        return {
          ...state,
          todoList: [newTodo, ...pendingTodos, ...completedTodos],
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

        const pendingItems = newTodoList.filter((todo) => !todo.isDone);
        const completedItems = newTodoList.filter((todo) => todo.isDone);

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
          todoList: [...finalPendingItems, ...finalCompletedItems],
        };

      case "DELETE_TODO":
        return {
          ...state,
          todoList: state.todoList.filter(
            (todo) => todo.id !== action.payload.id
          ),
        };

      case "REORDER_TODOS":
        const { newOrder } = action.payload;
        const reorderedTodos = newOrder
          .map((id) => state.todoList.find((todo) => todo.id === id)!)
          .filter(Boolean);
        return {
          ...state,
          todoList: [...reorderedTodos],
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
}

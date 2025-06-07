import { TodoItem } from "./items";

export type TodoFilter = "all" | "pending" | "completed";

export interface State {
  todoList: TodoItem[];
  currentFilter: TodoFilter;
}

export type Subscriber = (state: State) => void;

export type Selector<T> = (state: State) => T;

export type Action =
  | AddTodoAction
  | ToggleTodoAction
  | DeleteTodoAction
  | SetFilterAction
  | ClearCompletedAction
  | ReorderTodosAction;

export interface AddTodoAction {
  type: "ADD_TODO";
  payload: {
    title: string;
  };
}

export interface ToggleTodoAction {
  type: "TOGGLE_TODO";
  payload: {
    id: string;
  };
}

export interface DeleteTodoAction {
  type: "DELETE_TODO";
  payload: {
    id: string;
  };
}

export interface SetFilterAction {
  type: "SET_FILTER";
  payload: {
    filter: TodoFilter;
  };
}

export interface ClearCompletedAction {
  type: "CLEAR_COMPLETED";
}

export interface ReorderTodosAction {
  type: "REORDER_TODOS";
  payload: {
    newOrder: string[];
  };
}

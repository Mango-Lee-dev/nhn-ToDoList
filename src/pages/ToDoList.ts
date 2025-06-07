import "@/styles/style.css";
import TodoListItem from "@/components/TodoListItem";
import stateManager from "@/lib";
import { TodoItem } from "@/types/items";
import { TodoFilter } from "@/types/state";
import ToDoListFilters from "@/components/TodoListFilters";

interface FilterCounts {
  all: number;
  completed: number;
  pending: number;
}

export default function ToDoList() {
  const todoList = stateManager.select<TodoItem[]>("activeTodos");
  const currentFilter = stateManager.select<TodoFilter>("currentFilter");
  const filterCounts = stateManager.select<FilterCounts>("filterCounts");

  return `
    <div class="todo-list-container">
      <div class="todo-list-header">
        <h1 class="todo-list-header-title">ToDo List</h1>
      </div>
      <div class="todo-list-input">
        <input class="todo-list-input-text" type="text" placeholder="할 일을 입력하세요" />
        <button class="todo-list-input-button">추가</button>
      </div>
      <ul class="todo-list-items">
        ${todoList
          .map((todo) =>
            TodoListItem({
              id: todo.id,
              title: todo.title,
              isDone: todo.isDone,
            })
          )
          .join("")}
      </ul>
      ${ToDoListFilters({
        allTodoListNumber: filterCounts.all,
        completedTodoListNumber: filterCounts.completed,
        pendingTodoListNumber: filterCounts.pending,
        currentFilter: currentFilter,
      })}
    </div>
  `;
}

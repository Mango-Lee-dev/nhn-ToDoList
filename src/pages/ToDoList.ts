import TodoListItem from "@/components/TodoListItem";
import "@/styles/style.css";
import stateManager from "@/lib";
import { TodoItem } from "@/types/items";
import ToDoListFooter from "@/components/TodoListFooter";

interface FilterCounts {
  all: number;
  completed: number;
  pending: number;
}

export default function ToDoList() {
  const todoList = stateManager.select<TodoItem[]>("activeTodos");
  const currentFilter = stateManager.select<string>("currentFilter");
  const filterCounts = stateManager.select<FilterCounts>("filterCounts");

  const sortedTodoList = [...todoList].sort((a, b) => {
    if (a.isDone !== b.isDone) {
      return a.isDone ? 1 : -1;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return `
    <div class="todo-list-container">
      <div class="todo-list-header">
        <h1>ToDo List</h1>
      </div>
      <div class="todo-list-input">
        <input class="todo-list-input-text" type="text" placeholder="할 일을 입력하세요" />
        <button class="todo-list-input-button">추가</button>
      </div>
      <ul class="todo-list-items">
        ${sortedTodoList
          .map((todo) =>
            TodoListItem({
              id: todo.id,
              title: todo.title,
              isDone: todo.isDone,
            })
          )
          .join("")}
      </ul>
      ${ToDoListFooter({
        allTodoListNumber: filterCounts.all,
        completedTodoListNumber: filterCounts.completed,
        pendingTodoListNumber: filterCounts.pending,
        currentFilter: currentFilter,
      })}
    </div>
  `;
}

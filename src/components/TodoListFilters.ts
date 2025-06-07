interface ToDoListFooterProps {
  allTodoListNumber: number;
  completedTodoListNumber: number;
  currentFilter: string;
  pendingTodoListNumber: number;
}

export default function ToDoListFilters({
  allTodoListNumber,
  completedTodoListNumber,
  currentFilter,
  pendingTodoListNumber,
}: ToDoListFooterProps) {
  const handleGetSelectedFilterLeft = () => {
    switch (currentFilter) {
      case "all":
        return `${allTodoListNumber} items left`;
      case "pending":
        return `${pendingTodoListNumber} items left`;
      case "completed":
        return `${completedTodoListNumber} items left`;
    }
  };
  return `
    <div class="todo-list-filter">
      <div class="todo-list-filter-left">
        ${handleGetSelectedFilterLeft()}
      </div>
      <div class="todo-list-filter-center">
        <button 
          class="todo-list-filter-button ${
            currentFilter === "all" ? "selected" : ""
          }" 
          data-filter="all"
        >
          All
        </button>
        <button 
          class="todo-list-filter-button ${
            currentFilter === "pending" ? "selected" : ""
          }" 
          data-filter="pending"
        >
          Active
        </button>
        <button 
          class="todo-list-filter-button ${
            currentFilter === "completed" ? "selected" : ""
          }" 
          data-filter="completed"
        >
          Completed
        </button>
      </div>
      <div class="todo-list-filter-right">
        <button 
          class="todo-list-filter-clear-completed ${
            completedTodoListNumber === 0 ? "disabled" : ""
          }"
          ${completedTodoListNumber === 0 ? "disabled" : ""}
        >
          Clear completed${
            completedTodoListNumber > 0 ? ` (${completedTodoListNumber})` : ""
          }
        </button>
      </div>
    </div>
  `;
}

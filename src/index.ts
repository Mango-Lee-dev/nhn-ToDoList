import ToDoList from "@/pages/ToDoList";
import stateManager from "./lib";

const app = document.querySelector("#app")!;

function render() {
  app.innerHTML = ToDoList();
  attachEventListeners();
}

function attachEventListeners() {
  const addButton = document.querySelector(".todo-list-input-button");
  const inputField = document.querySelector(
    ".todo-list-input-text"
  ) as HTMLInputElement;

  if (addButton && inputField) {
    addButton.addEventListener("click", () => {
      const title = inputField.value.trim();
      if (title) {
        stateManager.dispatch({
          type: "ADD_TODO",
          payload: {
            title,
          },
        });
        inputField.value = "";
      }
    });

    inputField.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const title = inputField.value.trim();
        if (title) {
          stateManager.dispatch({
            type: "ADD_TODO",
            payload: {
              title,
            },
          });
          inputField.value = "";
        }
      }
    });
  }

  const checkboxes = document.querySelectorAll(".check-mark");
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const target = e.target as HTMLInputElement;
      const id = target.getAttribute("data-id");

      if (id) {
        stateManager.dispatch({
          type: "TOGGLE_TODO",
          payload: { id },
        });
      }
    });
  });

  const deleteButtons = document.querySelectorAll(".delete-button");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const target = e.target as HTMLElement;
      const id =
        target.getAttribute("data-id") ||
        target.closest(".delete-button")?.getAttribute("data-id");

      if (id) {
        stateManager.dispatch({
          type: "DELETE_TODO",
          payload: { id },
        });
      }
    });
  });

  const filterButtons = document.querySelectorAll(".todo-list-filter-button");
  filterButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const filter = target.getAttribute("data-filter");

      console.log("Filter clicked:", filter);

      if (filter) {
        stateManager.setFilter(filter as any);
      }
    });
  });

  const clearCompletedButton = document.querySelector(
    ".todo-list-filter-clear-completed"
  );
  clearCompletedButton?.addEventListener("click", () => {
    const completedTodos = stateManager
      .getState()
      .todoList.filter((todo) => todo.isDone);
    completedTodos.forEach((todo) => {
      stateManager.dispatch({
        type: "DELETE_TODO",
        payload: { id: todo.id },
      });
    });
  });
}

stateManager.subscribe("app", render);
render();

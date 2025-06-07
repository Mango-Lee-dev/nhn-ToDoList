import StateManager from "@/lib/stateManager";

export function setupInputHandlers(stateManager: StateManager) {
  const addButton = document.querySelector(".todo-list-input-button");
  const inputField = document.querySelector(
    ".todo-list-input-text"
  ) as HTMLInputElement;

  if (!addButton || !inputField) return;

  const addTodo = () => {
    const title = inputField.value.trim();

    if (title === "") return;

    stateManager.dispatch({
      type: "ADD_TODO",
      payload: {
        title,
      },
    });
    inputField.value = "";
  };

  addButton.addEventListener("click", addTodo);
  inputField.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      addTodo();
    }
  });
}

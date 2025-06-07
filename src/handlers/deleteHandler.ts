import StateManager from "@/lib/stateManager";

export function setupDeleteHandlers(stateManager: StateManager) {
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
}

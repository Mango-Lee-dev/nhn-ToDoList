import StateManager from "@/lib/stateManager";

export function setupCheckboxHandlers(stateManager: StateManager) {
  const checkboxes = document.querySelectorAll(".check-mark");

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", (e: Event) => {
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
}

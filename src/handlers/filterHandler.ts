import StateManager from "@/lib/stateManager";
import { TodoFilter } from "@/types/state";

export function setupFilterHandlers(stateManager: StateManager) {
  const filterButtons = document.querySelectorAll(".todo-list-filter-button");

  filterButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const target = e.target as HTMLButtonElement;
      const filter = target.getAttribute("data-filter") as TodoFilter;

      if (filter) {
        stateManager.setFilter(filter);
      }
    });
  });
}

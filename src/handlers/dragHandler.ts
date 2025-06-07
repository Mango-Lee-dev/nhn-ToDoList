import { DragManager } from "@/lib/dragManager";
import StateManager from "@/lib/stateManager";

export function setupDragHandlers(stateManager: StateManager) {
  const todoItems = document.querySelectorAll(".todo-item");
  const dragManager = new DragManager(stateManager);

  todoItems.forEach((item) => {
    item.addEventListener("mousedown", (e) => {
      const mouseEvent = e as MouseEvent;
      const target = e.target as HTMLElement;

      if (dragManager.shouldPreventDrag(target)) return;

      const todoItem = target.closest(".todo-item") as HTMLElement;
      if (!todoItem) return;

      dragManager.startDrag(todoItem, mouseEvent);
    });
  });
}

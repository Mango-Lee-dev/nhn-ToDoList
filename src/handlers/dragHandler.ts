import { dragManager } from "@/lib";

export function setupDragHandlers() {
  const todoItems = document.querySelectorAll(".todo-item");

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

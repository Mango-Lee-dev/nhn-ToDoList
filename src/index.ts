import ToDoList from "@/pages/ToDoList";
import stateManager from "./lib";
import { setupInputHandlers } from "./handlers/inputHandler";
import { setupCheckboxHandlers } from "./handlers/checkboxHandler";
import { setupDeleteHandlers } from "./handlers/deleteHandler";
import { setupFilterHandlers } from "./handlers/filterHandler";
import { setupDragHandlers } from "./handlers/dragHandler";

const app = document.querySelector("#app")!;

function render() {
  app.innerHTML = ToDoList();
  attachEventListeners();
}

function attachEventListeners() {
  setupInputHandlers(stateManager);
  setupCheckboxHandlers(stateManager);
  setupDeleteHandlers(stateManager);
  setupFilterHandlers(stateManager);
  setupDragHandlers(stateManager);
}

stateManager.subscribe("app", render);
render();

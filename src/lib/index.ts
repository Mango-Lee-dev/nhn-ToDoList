import StateManager from "./stateManager";
import DragManager from "./dragManager";

export const stateManager = new StateManager();
export const dragManager = new DragManager(stateManager);

import StateManager from "./stateManager";

export class DragManager {
  private stateManager: StateManager;
  private draggedElement: HTMLElement | null = null;
  private placeholder: HTMLElement | null = null;
  private originalNextSibling: Element | null = null;
  private isPreviewing: boolean = false;
  private previewTimeout: number | null = null;
  private lastMousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private previewElement: HTMLElement | null = null;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
    this.isPreviewing = false;
  }

  private showPreview() {
    if (
      !this.draggedElement ||
      !this.placeholder ||
      this.isPreviewing ||
      this.isOutsideDropZone({
        clientX: this.lastMousePosition.x,
        clientY: this.lastMousePosition.y,
      } as MouseEvent)
    )
      return;
    this.isPreviewing = true;

    this.previewElement = this.draggedElement.cloneNode(true) as HTMLElement;
    this.previewElement.className =
      this.draggedElement.className + " preview-element";

    Object.assign(this.previewElement.style, {
      position: "static",
      zIndex: "auto",
      opacity: "0.7",
      cursor: "default",
      boxShadow: "inset 0 0 10px rgba(0,128,255,0.5)",
      backgroundColor: "rgba(173, 216, 230, 0.3)",
      border: "2px dashed #0080ff",
      pointerEvents: "none",
      maxWidth: "none",
      transform: "scale(1.02)",
      transition: "all 0.3s ease",
    });

    const container = this.placeholder.parentElement;
    if (container) {
      try {
        container.insertBefore(this.previewElement, this.placeholder);

        this.placeholder.style.display = "none";

        this.draggedElement.style.opacity = "0.3";
      } catch (error) {
        this.previewElement.remove();
        this.previewElement = null;
        this.isPreviewing = false;
      }
    }
  }

  private hidePreview() {
    if (!this.isPreviewing) return;

    this.isPreviewing = false;

    if (this.previewElement && this.previewElement.parentNode) {
      this.previewElement.remove();
      this.previewElement = null;
    }

    if (this.placeholder) {
      this.placeholder.style.display = "flex";
    }

    if (this.draggedElement) {
      this.draggedElement.style.opacity = "0.8";
    }
  }

  private resetPreviewTimer(x: number, y: number) {
    if (this.previewTimeout) {
      clearTimeout(this.previewTimeout);
      this.previewTimeout = null;
    }

    if (this.isPreviewing) {
      this.hidePreview();
    }
    this.lastMousePosition = { x, y };

    this.previewTimeout = window.setTimeout(() => {
      this.showPreview();
    }, 2000);
  }

  shouldPreventDrag(target: HTMLElement) {
    const isCompletedTodo = target
      .closest(".todo-text")
      ?.classList.contains("completed");
    const isInteractiveElement =
      target.classList.contains("check-mark") ||
      target.classList.contains("delete-button") ||
      target.closest(".delete-button");

    return !!(isCompletedTodo || isInteractiveElement);
  }

  startDrag(element: HTMLElement, mouseEvent: MouseEvent) {
    this.draggedElement = element;
    this.originalNextSibling = element.nextElementSibling;

    this.createPlaceholder();
    this.setupDragStyles();
    this.setupEventListeners();

    this.moveAt(mouseEvent.pageX, mouseEvent.pageY);
  }

  private createPlaceholder() {
    if (!this.draggedElement) return;

    this.placeholder = document.createElement("li");
    this.placeholder.className = "todo-item-placeholder";

    Object.assign(this.placeholder.style, {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px",
      borderBottom: "1px solid #ccc",
      width: "100%",
      height: this.draggedElement.offsetHeight + "px",
      backgroundColor: "#f0f0f0",
      opacity: "0.5",
    });

    this.draggedElement.parentNode?.insertBefore(
      this.placeholder,
      this.draggedElement.nextSibling
    );
  }

  private setupDragStyles() {
    if (!this.draggedElement) return;

    Object.assign(this.draggedElement.style, {
      position: "absolute",
      zIndex: "1000",
      opacity: "0.8",
      cursor: "grabbing",
      boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
      pointerEvents: "none",
      maxWidth: "1000px",
    });
  }

  private setupEventListeners() {
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp);
    document.addEventListener("keydown", this.onKeyDown);
  }

  private removeEventListeners() {
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
    document.removeEventListener("keydown", this.onKeyDown);
  }

  private onMouseMove = (e: MouseEvent) => {
    this.moveAt(e.pageX, e.pageY);
    const oldPlaceholderPosition = this.placeholder?.nextElementSibling;
    this.updatePlaceholderPosition(e.clientY);
    const newPlaceholderPosition = this.placeholder?.nextElementSibling;

    const hasMovedSignificantly =
      Math.abs(e.pageX - this.lastMousePosition.x) > 5 ||
      Math.abs(e.pageY - this.lastMousePosition.y) > 5;

    if (
      oldPlaceholderPosition !== newPlaceholderPosition ||
      hasMovedSignificantly
    ) {
      this.resetPreviewTimer(e.pageX, e.pageY);
    }
  };

  private onMouseUp = (e: MouseEvent) => {
    if (!this.draggedElement || !this.placeholder) return;

    if (this.previewTimeout) {
      clearTimeout(this.previewTimeout);
      this.previewTimeout = null;
    }

    if (this.isPreviewing) {
      this.hidePreview();
    }

    if (this.isOutsideDropZone(e)) {
      this.cancelDrag();
      return;
    }

    this.completeDrag();
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      if (this.previewTimeout) {
        clearTimeout(this.previewTimeout);
        this.previewTimeout = null;
      }
      if (this.isPreviewing) {
        this.hidePreview();
      }
      this.cancelDrag();
    }
  };

  private moveAt(pageX: number, pageY: number) {
    if (!this.draggedElement) return;

    this.draggedElement.style.left =
      pageX - this.draggedElement.offsetWidth / 2 + "px";
    this.draggedElement.style.top =
      pageY - this.draggedElement.offsetHeight / 2 + "px";
  }

  private updatePlaceholderPosition(y: number) {
    const container = this.placeholder?.parentElement;
    if (!container || !this.placeholder) return;

    const afterElement = this.getDragAfterElement(y);

    if (this.isPreviewing && this.previewElement) {
      this.previewElement.remove();

      if (afterElement === null) {
        container.appendChild(this.placeholder);
        container.appendChild(this.previewElement);
      } else {
        container.insertBefore(this.placeholder, afterElement);
        container.insertBefore(this.previewElement, this.placeholder);
      }
      this.placeholder.style.display = "none";
    } else {
      if (afterElement == null) {
        container.appendChild(this.placeholder);
      } else {
        container.insertBefore(this.placeholder, afterElement);
      }
    }
  }

  private getDragAfterElement(y: number): HTMLElement | null {
    const draggableElements = [
      ...document.querySelectorAll(".todo-item:not(.todo-item-placeholder)"),
    ];

    return draggableElements.reduce<{
      offset: number;
      element: HTMLElement | null;
    }>(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child as HTMLElement };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY, element: null }
    ).element;
  }

  private isOutsideDropZone(e: MouseEvent): boolean {
    const todoList = document.querySelector(".todo-list-items");
    const rect = todoList?.getBoundingClientRect();

    return !!(
      rect &&
      (e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom)
    );
  }

  private resetElementStyles() {
    if (!this.draggedElement) return;

    Object.assign(this.draggedElement.style, {
      position: "",
      zIndex: "",
      opacity: "",
      cursor: "",
      left: "",
      top: "",
      boxShadow: "",
      pointerEvents: "",
      maxWidth: "",
    });
  }

  private cancelDrag() {
    if (!this.draggedElement || !this.placeholder) return;

    this.resetElementStyles();

    if (this.originalNextSibling) {
      this.originalNextSibling.parentNode?.insertBefore(
        this.draggedElement,
        this.originalNextSibling
      );
    } else {
      this.placeholder.parentNode?.appendChild(this.draggedElement);
    }

    this.cleanup();
  }

  private completeDrag() {
    if (!this.draggedElement || !this.placeholder) return;

    this.resetElementStyles();

    if (this.isPreviewing && this.previewElement) {
      this.previewElement.parentNode?.insertBefore(
        this.draggedElement,
        this.previewElement
      );
    } else {
      this.placeholder.parentNode?.insertBefore(
        this.draggedElement,
        this.placeholder
      );
    }

    this.cleanup();
    this.updateTodoOrder();
  }

  private cleanup() {
    if (this.previewElement) {
      this.previewElement.remove();
      this.previewElement = null;
    }

    if (this.previewTimeout) {
      clearTimeout(this.previewTimeout);
      this.previewTimeout = null;
    }

    this.placeholder?.remove();
    this.removeEventListeners();

    this.draggedElement = null;
    this.placeholder = null;
    this.originalNextSibling = null;
    this.isPreviewing = false;
  }

  private updateTodoOrder() {
    const todoItems = document.querySelectorAll(
      ".todo-item:not(.todo-item-placeholder)"
    );
    const newOrder = Array.from(todoItems)
      .map((item) => item.getAttribute("data-id"))
      .filter((id): id is string => id !== null);

    this.stateManager.dispatch({
      type: "REORDER_TODOS",
      payload: { newOrder },
    });
  }
}

import ToDoList from "../pages/ToDoList";
import { stateManager } from "../lib";
import { dragManager } from "../lib";

describe("DragNDrop 테스트", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    stateManager.resetState();
    stateManager.dispatch({
      type: "ADD_TODO",
      payload: {
        title: "test todo 1",
      },
    });
    stateManager.dispatch({
      type: "ADD_TODO",
      payload: {
        title: "test todo 2",
      },
    });
    stateManager.dispatch({
      type: "ADD_TODO",
      payload: {
        title: "test todo 3",
      },
    });

    const todos = stateManager.select("todoList");
    if (todos.length > 0) {
      stateManager.dispatch({
        type: "TOGGLE_TODO",
        payload: {
          id: todos[0].id,
        },
      });
    }
    const todoListHTML = ToDoList();
    document.body.innerHTML = todoListHTML;
  });

  test("초기 상태 확인", () => {
    const completedTodos = stateManager.select("completedTodos");
    const pendingTodos = stateManager.select("pendingTodos");

    expect(completedTodos).toHaveLength(1);
    expect(pendingTodos).toHaveLength(2);
    expect(completedTodos[0].title).toBe("test todo 3");
  });

  test("할일 순서 변경 (REORDER_TODOS 액션 테스트)", () => {
    const todos = stateManager.select("todoList");
    const originalOrder = todos.map((todo) => todo.id);

    const newOrder = [originalOrder[2], originalOrder[1], originalOrder[0]];

    stateManager.dispatch({
      type: "REORDER_TODOS",
      payload: {
        newOrder: newOrder,
      },
    });

    const reorderedTodos = stateManager.select("todoList");
    expect(reorderedTodos[0].id).toBe(originalOrder[2]);
    expect(reorderedTodos[1].id).toBe(originalOrder[1]);
    expect(reorderedTodos[2].id).toBe(originalOrder[0]);
  });

  test("완료된 할일은 드래그가 불가능해야 함 (DOM 테스트)", () => {
    const todoListHTML = ToDoList();
    document.body.innerHTML = todoListHTML;

    const completedTodos = stateManager.select("completedTodos");
    const pendingTodos = stateManager.select("pendingTodos");

    expect(completedTodos).toHaveLength(1);
    expect(pendingTodos).toHaveLength(2);

    const todoItems = document.querySelectorAll(".todo-list-items li");

    const completedTodoElement = Array.from(todoItems).find((item) => {
      const checkbox = item.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;
      return checkbox?.checked;
    });

    expect(completedTodoElement).toBeTruthy();

    const draggableAttr = completedTodoElement?.getAttribute("draggable");
    expect(draggableAttr).toBe("false");
  });

  test("미완료 할일만 드래그 가능해야 함", () => {
    const todoListHTML = ToDoList();
    document.body.innerHTML = todoListHTML;

    const todoItems = document.querySelectorAll(".todo-item");

    expect(todoItems.length).toBeGreaterThan(0);

    Array.from(todoItems).forEach((item) => {
      const checkbox = item.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;
      const draggable = item.getAttribute("draggable");

      if (checkbox?.checked) {
        expect(draggable).toBe("false");
      } else {
        expect(draggable).toBe("true");
      }
    });
  });

  test("드래그 앤 드롭 이벤트 시뮬레이션", () => {
    const todoListHTML = ToDoList();
    document.body.innerHTML = todoListHTML;

    const todoItems = document.querySelectorAll(".todo-item");
    const todos = stateManager.select("todoList");

    todoItems.forEach((item, index) => {
      if (todos[index]) {
        item.setAttribute("data-id", todos[index].id);
      }
    });

    expect(todoItems).toHaveLength(3);

    const draggableItems = Array.from(todoItems).filter((item) => {
      const checkbox = item.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;
      return !checkbox?.checked;
    });
    expect(draggableItems).toHaveLength(2);

    if (draggableItems.length >= 2) {
      const sourceItem = draggableItems[0] as HTMLElement;
      const targetItem = draggableItems[1] as HTMLElement;

      const shouldPrevent = dragManager.shouldPreventDrag(targetItem);
      expect(shouldPrevent).toBe(false);

      const initialTodos = stateManager.select("todoList");
      const initialOrder = initialTodos.map((todo) => todo.id);

      // 1. 드래그 시작
      const sourceRect = sourceItem.getBoundingClientRect();
      const mouseDownEvent = new MouseEvent("mousedown", {
        bubbles: true,
        cancelable: true,
        clientX: sourceRect.left + sourceRect.width / 2,
        clientY: sourceRect.top + sourceRect.height / 2,
      });

      dragManager.startDrag(sourceItem, mouseDownEvent);

      const placeholder = document.querySelector(
        ".todo-item-placeholder"
      ) as HTMLElement;
      expect(placeholder).toBeTruthy();

      const targetRect = targetItem.getBoundingClientRect();
      const mouseMoveEvent = new MouseEvent("mousemove", {
        bubbles: true,
        cancelable: true,
        clientX: targetRect.left + targetRect.width / 2,
        clientY: targetRect.top + targetRect.height / 2,
      });

      document.dispatchEvent(mouseMoveEvent);

      const mouseUpEvent = new MouseEvent("mouseup", {
        bubbles: true,
        cancelable: true,
        clientX: targetRect.left + targetRect.width / 2,
        clientY: targetRect.top + targetRect.height / 2,
      });

      document.dispatchEvent(mouseUpEvent);

      const finalTodos = stateManager.select("todoList");
      const finalOrder = finalTodos.map((todo) => todo.id);

      console.log("Initial order:", initialOrder);
      console.log("Final order:", finalOrder);

      expect(finalOrder).not.toEqual(initialOrder);
    }
  });

  test("체크박스와 삭제 버튼은 드래그가 방지되어야 함", () => {
    const todoListHTML = ToDoList();
    document.body.innerHTML = todoListHTML;

    const checkbox = document.querySelector(".check-mark") as HTMLElement;
    expect(checkbox).toBeTruthy();
    expect(dragManager.shouldPreventDrag(checkbox)).toBe(true);

    const deleteButton = document.querySelector(
      ".delete-button"
    ) as HTMLElement;
    expect(deleteButton).toBeTruthy();
    expect(dragManager.shouldPreventDrag(deleteButton)).toBe(true);
  });

  test("완료된 할일에 드롭하려고 할 때 무시되어야 함", () => {
    const completedTodos = stateManager.select("completedTodos");
    const pendingTodos = stateManager.select("pendingTodos");

    expect(completedTodos).toHaveLength(1);
    expect(pendingTodos).toHaveLength(2);

    const completedTodoId = completedTodos[0].id;

    const isDropAllowed = (targetTodoId: string) => {
      const targetTodo = stateManager.getTodoById(targetTodoId);
      return targetTodo ? !targetTodo.isDone : false;
    };

    expect(isDropAllowed(completedTodoId)).toBe(false);

    pendingTodos.forEach((todo) => {
      expect(isDropAllowed(todo.id)).toBe(true);
    });
  });
});

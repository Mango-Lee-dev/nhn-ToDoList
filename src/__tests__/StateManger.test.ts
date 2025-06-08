import StateManager from "../lib/stateManager";
import { TodoItem } from "../types/items";

describe("StateManager 테스트", () => {
  let stateManager: StateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  test("초기 상태가 올바르게 설정되어야 함", () => {
    const state = stateManager.getState();
    expect(state.todoList).toEqual([]);
  });

  test("Todo 아이템을 추가 할 수 있어야 함.", () => {
    stateManager.dispatch({
      type: "ADD_TODO",
      payload: {
        title: "아침밥 먹고 운동하러 가기",
      },
    });

    const state = stateManager.getState();
    expect(state.todoList).toHaveLength(1);
    expect(state.todoList[0].title).toBe("아침밥 먹고 운동하러 가기");
    expect(state.todoList[0].isDone).toBe(false);
  });

  test("Todo 아이템을 완료 처리 할 수 있어야 함.", () => {
    stateManager.dispatch({
      type: "ADD_TODO",
      payload: {
        title: "점심밥 먹고 운동하러 가기",
      },
    });
    const todoId = stateManager.getState().todoList[0].id;

    stateManager.dispatch({
      type: "TOGGLE_TODO",
      payload: {
        id: todoId,
      },
    });

    const state = stateManager.getState();
    expect(state.todoList[0].isDone).toBe(true);
  });

  test("Todo 아이템을 삭제 할 수 있어야 함.", () => {
    stateManager.dispatch({
      type: "ADD_TODO",
      payload: {
        title: "점심밥 먹고 운동하러 가기",
      },
    });

    const todoId = stateManager.getState().todoList[0].id;

    stateManager.dispatch({
      type: "DELETE_TODO",
      payload: {
        id: todoId,
      },
    });

    const state = stateManager.getState();
    expect(state.todoList).toHaveLength(0);
  });

  test("셀렉터가 올바르게 작동해야 함", () => {
    stateManager.dispatch({
      type: "ADD_TODO",
      payload: {
        title: "저녁밥 먹고 운동하러 가기",
      },
    });

    stateManager.dispatch({
      type: "ADD_TODO",
      payload: {
        title: "저녁밥 먹고 운동하러 가기2",
      },
    });

    const todos = stateManager.getState().todoList;
    stateManager.dispatch({
      type: "TOGGLE_TODO",
      payload: {
        id: todos[0].id,
      },
    });

    const todoList = stateManager.select<TodoItem[]>("todoList");
    const pendingTodos = stateManager.select<TodoItem[]>("pendingTodos");
    const completedTodos = stateManager.select<TodoItem[]>("completedTodos");

    expect(todoList).toHaveLength(2);
    expect(pendingTodos).toHaveLength(1);
    expect(completedTodos).toHaveLength(1);
    expect(pendingTodos[0]?.title).toBe("저녁밥 먹고 운동하러 가기");
    expect(completedTodos[0]?.title).toBe("저녁밥 먹고 운동하러 가기2");
  });

  test("할 일 순서 변경 테스트", () => {
    stateManager.dispatch({
      type: "ADD_TODO",
      payload: {
        title: "저녁밥 먹고 운동하러 가기",
      },
    });

    stateManager.dispatch({
      type: "ADD_TODO",
      payload: {
        title: "저녁밥 먹고 운동하러 가기2",
      },
    });

    const todos = stateManager.getState().todoList;
    const originalOrder = todos.map((todo) => todo.id);

    const newOrder = [originalOrder[1], originalOrder[0]];

    stateManager.dispatch({
      type: "REORDER_TODOS",
      payload: {
        newOrder,
      },
    });

    const reorderedTodos = stateManager.select<TodoItem[]>("todoList");
    expect(reorderedTodos[0].id).toBe(originalOrder[1]);
    expect(reorderedTodos[1].id).toBe(originalOrder[0]);
  });

  test("StateManager 구독자가 상태 변화를 감지해야 함", () => {
    const mockSubscriber = jest.fn();

    stateManager.subscribe("test-subscriber", mockSubscriber);

    stateManager.dispatch({
      type: "ADD_TODO",
      payload: {
        title: "저녁밥 먹고 운동하러 가기",
      },
    });

    expect(mockSubscriber).toHaveBeenCalledTimes(1);
    expect(mockSubscriber).toHaveBeenCalledWith(
      expect.objectContaining({
        todoList: expect.arrayContaining([
          expect.objectContaining({
            title: "저녁밥 먹고 운동하러 가기",
          }),
        ]),
      })
    );
  });
});

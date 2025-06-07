import StateManager from "../lib/stateManager";
import ToDoList from "../pages/ToDoList";

describe("input, delete, toggle 테스트", () => {
  let stateManager: StateManager;

  beforeEach(() => {
    stateManager = new StateManager();
    document.body.innerHTML = "";
  });

  test("초기 화면 진입 시 각 요소들이 초기화 되어야 함", () => {
    const todoListHTML = ToDoList();

    expect(todoListHTML).toContain("ToDo List");
    expect(todoListHTML).toContain("추가");
    expect(todoListHTML).toContain("할 일을 입력하세요");
    expect(todoListHTML).toContain("All");
    expect(todoListHTML).toContain("Active");
    expect(todoListHTML).toContain("Completed");
    expect(todoListHTML).toContain("Clear completed");
  });

  test("StateManager를 통한 할 일 추가 테스트", () => {
    const initialTodos = stateManager.select("activeTodos");
    expect(initialTodos).toHaveLength(0);

    stateManager.dispatch({
      type: "ADD_TODO",
      payload: {
        title: "test todo",
      },
    });

    const updatedTodos = stateManager.select("activeTodos");
    expect(updatedTodos).toHaveLength(1);
    expect(updatedTodos[0].title).toBe("test todo");
    expect(updatedTodos[0].isDone).toBe(false);
  });

  test("StateManager를 통한 할 일 삭제 테스트", () => {
    const initialTodos = stateManager.select("activeTodos");
    expect(initialTodos).toHaveLength(0);

    stateManager.dispatch({
      type: "ADD_TODO",
      payload: {
        title: "test todo",
      },
    });

    const updatedTodos = stateManager.select("activeTodos");
    expect(updatedTodos).toHaveLength(1);
    expect(updatedTodos[0].title).toBe("test todo");
    expect(updatedTodos[0].isDone).toBe(false);
  });

  test("StateManager를 통한 할 일 완료 테스트", () => {
    const initialTodos = stateManager.select("activeTodos");
    expect(initialTodos).toHaveLength(0);

    stateManager.dispatch({
      type: "ADD_TODO",
      payload: {
        title: "test todo",
      },
    });

    const addedTodos = stateManager.select("activeTodos");
    expect(addedTodos).toHaveLength(1);
    expect(addedTodos[0].title).toBe("test todo");
    expect(addedTodos[0].isDone).toBe(false);

    stateManager.dispatch({
      type: "TOGGLE_TODO",
      payload: {
        id: addedTodos[0].id,
      },
    });

    const updatedTodos = stateManager.select("completedTodos");
    expect(updatedTodos).toHaveLength(1);
    expect(updatedTodos[0].title).toBe("test todo");
    expect(updatedTodos[0].isDone).toBe(true);
  });
});

describe("Filter 테스트", () => {
  let stateManager: StateManager;

  beforeEach(() => {
    stateManager = new StateManager();
    document.body.innerHTML = "";

    // 할일 추가
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

    const allTodos = stateManager.select("allTodos");
    expect(allTodos).toHaveLength(3);
  });

  test("Active 필터 테스트", () => {
    const activeTodos = stateManager.select("activeTodos");
    expect(activeTodos).toHaveLength(3);
    expect(activeTodos[0].title).toBe("test todo 3");
  });

  test("Completed 필터 테스트", () => {
    const activeTodos = stateManager.select("activeTodos");
    const completedTodos = stateManager.select("completedTodos");
    expect(completedTodos).toHaveLength(0);

    stateManager.dispatch({
      type: "TOGGLE_TODO",
      payload: {
        id: activeTodos[0].id,
      },
    });

    const updatedCompletedTodos = stateManager.select("completedTodos");
    expect(updatedCompletedTodos).toHaveLength(1);
    expect(updatedCompletedTodos[0].title).toBe("test todo 3");
    expect(updatedCompletedTodos[0].isDone).toBe(true);
  });

  test("Clear completed 테스트", () => {
    const activeTodos = stateManager.select("activeTodos");

    stateManager.dispatch({
      type: "TOGGLE_TODO",
      payload: {
        id: activeTodos[0].id,
      },
    });

    const updatedCompletedTodos = stateManager.select("completedTodos");
    expect(updatedCompletedTodos).toHaveLength(1);

    stateManager.dispatch({
      type: "CLEAR_COMPLETED",
    });

    const updatedActiveTodos = stateManager.select("activeTodos");
    expect(updatedActiveTodos).toHaveLength(2);
  });

  test("필터 변경 테스트", () => {
    const initialTodos = stateManager.select("activeTodos");

    stateManager.dispatch({
      type: "TOGGLE_TODO",
      payload: {
        id: initialTodos[0].id,
      },
    });

    stateManager.setFilter("all");
    const allFilteredTodos = stateManager.select("allTodos");
    expect(allFilteredTodos).toHaveLength(3);

    stateManager.setFilter("pending");
    const pendingFilteredTodos = stateManager.select("activeTodos");
    expect(pendingFilteredTodos).toHaveLength(2);

    stateManager.setFilter("completed");
    const completedFilteredTodos = stateManager.select("completedTodos");
    expect(completedFilteredTodos).toHaveLength(1);
  });

  test("Items 갯수 테스트", () => {
    const allTodos = stateManager.select("allTodos");
    const filterCounts = stateManager.select("filterCounts");

    expect(allTodos).toHaveLength(3);
    expect(filterCounts.all).toBe(3);
    expect(filterCounts.pending).toBe(3);
    expect(filterCounts.completed).toBe(0);
  });

  test("Filter counts 테스트", () => {
    let filterCounts = stateManager.select("filterCounts");
    expect(filterCounts.all).toBe(3);
    expect(filterCounts.pending).toBe(3);
    expect(filterCounts.completed).toBe(0);

    const activeTodos = stateManager.select("activeTodos");
    stateManager.dispatch({
      type: "TOGGLE_TODO",
      payload: {
        id: activeTodos[0].id,
      },
    });

    filterCounts = stateManager.select("filterCounts");
    expect(filterCounts.all).toBe(3);
    expect(filterCounts.pending).toBe(2);
    expect(filterCounts.completed).toBe(1);
  });
});

interface TodoListItemProps {
  id: string;
  title: string;
  isDone: boolean;
}

export default function TodoListItem({ id, title, isDone }: TodoListItemProps) {
  return `
    <li class="todo-item ${!isDone ? "draggable" : ""}" 
        data-id="${id}" 
        ${!isDone ? 'draggable="true"' : 'draggable="false"'}>
      <input 
        type="checkbox" 
        data-id="${id}" 
        class="check-mark" 
        ${isDone ? "checked" : ""}
      />
      <span class="todo-text ${isDone ? "completed" : ""}">
        ${title}
      </span>
      <button data-id="${id}" class="delete-button">
        <span>삭제</span>
      </button>
    </li>
  `;
}

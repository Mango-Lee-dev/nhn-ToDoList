describe("환경 설정 테스트", () => {
  test("TypeScript와 Jest가 정상적으로 작동하는지 확인", () => {
    const greeting = (name: string): string => {
      return `Hello, ${name}!`;
    };

    expect(greeting("World")).toBe("Hello, World!");
  });

  test("DOM 환경이 설정되어 있는지 확인", () => {
    document.body.innerHTML = '<div id="test">Test Content</div>';
    const element = document.getElementById("test");

    expect(element).not.toBeNull();
    expect(element?.textContent).toBe("Test Content");
  });

  test("배열 메소드 테스트", () => {
    const numbers: number[] = [1, 2, 3, 4, 5];
    const doubled = numbers.map((n) => n * 2);

    expect(doubled).toEqual([2, 4, 6, 8, 10]);
  });
});

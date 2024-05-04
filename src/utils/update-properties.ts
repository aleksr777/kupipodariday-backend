export function updateProperties<T, K extends keyof T>(
  target: T, // Целевой объект для обновления
  source: Partial<T>, // Объект с новыми значениями
  properties: K[], // Список свойств для проверки и обновления
): void {
  properties.forEach((property) => {
    if (source[property] !== undefined) {
      target[property] = source[property];
    }
  });
}

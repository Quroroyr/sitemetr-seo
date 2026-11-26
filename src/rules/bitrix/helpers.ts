import { notMeasured } from '../define-rule.js';

/** Результат правила для страницы без признаков 1С-Битрикс. */
export function bitrixNotApplicable(id: string) {
  return notMeasured(id, 'Сайт не на 1С-Битрикс', undefined, 'not-applicable');
}

/** Формирует пример адреса для отчёта, скрывая значение sessid. */
export function bitrixUrlExample(url: URL): string {
  if (!url.searchParams.has('sessid')) return url.href;
  const example = new URL(url);
  example.searchParams.set('sessid', '*');
  return example.href;
}

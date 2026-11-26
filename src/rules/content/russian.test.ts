// Сайтметр: content rules on Russian text. The tokenizer used `\w` (ASCII), so
// every Cyrillic word vanished: a Russian page with a 60-word paragraph scored
// "Extremely thin content: 4 words".
import { describe, expect, it } from 'vitest';
import { createTestContext } from '../test-context.js';
import { countWords, tokenize } from './utils/text-extractor.js';
import { getKeywordWords } from './utils/stopwords.js';
import { wordCountRule } from './word-count.js';
import { readingLevelRule } from './reading-level.js';

const PARAGRAPH =
  'В каталоге собраны диваны и кресла, которые можно купить с доставкой по всей стране у официального производителя. ' +
  'Мебель со склада проходит проверку качества и передаётся с полным пакетом документов, гарантией производителя и инструкцией по уходу. ' +
  'Подберите модель по фильтру слева: размер, тип обивки, механизм трансформации, цвет и цена. ' +
  'Если нужного варианта нет в списке, позвоните: часть моделей делается под заказ и не попадает на витрину.';

const page = (text: string) => `<html><body><header>Меню сайта</header><main><p>${text}</p></main><footer>Подвал</footer></body></html>`;

describe('Russian text', () => {
  it('tokenizes Cyrillic words, ё included', () => {
    expect(tokenize('Зелёный диван 2х1, цена — 35 000 ₽')).toEqual(['зелёный', 'диван', '2х1', 'цена', '35', '000']);
    expect(countWords(PARAGRAPH)).toBeGreaterThan(55);
  });

  it('counts a Russian paragraph as words, not as "4 words"', async () => {
    const result = await wordCountRule.run(createTestContext(page(PARAGRAPH)));
    expect(result.details?.wordCount).toBeGreaterThan(55);
  });

  it('leaves Russian function words out of keyword candidates', () => {
    expect(getKeywordWords(tokenize('что для это которые диван диван'))).toEqual(['диван', 'диван']);
  });

  it('does not grade a Russian text with an English readability formula', async () => {
    const result = await readingLevelRule.run(createTestContext(page(PARAGRAPH)));
    expect(result.status).toBe('not-measured');
  });

  it('still grades English text', async () => {
    const english = Array.from({ length: 12 }, () => 'The quick brown fox jumps over the lazy dog near the river bank.').join(' ');
    const result = await readingLevelRule.run(createTestContext(page(english)));
    expect(result.status).not.toBe('not-measured');
  });
});

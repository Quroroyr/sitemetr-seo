import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { unusedCssRule, unusedJsRule } from '../rules/perf/unused-code.js';
import { structuredDataRequiredFieldsRule } from '../rules/schema/required-fields.js';
import { createTestContext } from '../rules/test-context.js';
import { getLocale, setLocale, trMessage } from './index.js';
import { MESSAGES_RU_REC } from './ru/messages-rec.js';

const detailKeys = new Set(['recommendation', 'recommendations', 'suggestion', 'note']);
const resultHelpers = new Set(['pass', 'warn', 'fail', 'notMeasured']);

const inputs = [
  {
    wordCount: '21',
    suggestedLinks: '1',
    topicTerm: 'winter boots',
    currentYear: '2026',
    kind: 'article',
    'Math.round(typical)': '121',
    dominant: 'Brand & Co',
    "names.join(' and ')": 'noodp',
    'walk.targetCanonical': 'https://example.com/article',
    'redirectInfo.finalUrl': 'https://example.com/home',
    "ymylResult.categories.join(', ')": 'Health & Medical',
    'context.url': 'https://example.com/?a=2&b=3',
    'v.type': 'Product',
    "v.missingRecommended.join(', ')": 'image',
    "missing.join(' and ')": 'preload',
    'real.width': '1200',
    'real.height': '630',
  },
  {
    wordCount: '114',
    suggestedLinks: '4',
    topicTerm: 'boots "$1"\nwith labels',
    currentYear: '2027',
    kind: 'product',
    'Math.round(typical)': '305',
    dominant: 'Store | "Sale" $1\nToday',
    "names.join(' and ')": 'noodp and noydir',
    'walk.targetCanonical': 'https://example.com/?q=%22#section',
    'redirectInfo.finalUrl': 'https://example.com/?q=%24',
    "ymylResult.categories.join(', ')": 'Financial, Legal, Safety & Security, News & Current Events',
    'context.url': 'https://example.com/guide#details',
    'v.type': 'LocalBusiness',
    "v.missingRecommended.join(', ')": 'telephone, openingHours',
    "missing.join(' and ')": 'includeSubDomains and preload',
    'real.width': '642',
    'real.height': '337',
  },
] satisfies ReadonlyArray<Readonly<Record<string, string>>>;

function* nodes(root: ts.Node): Generator<ts.Node> {
  yield root;
  for (const child of root.getChildren()) yield* nodes(child);
}

function property(object: ts.ObjectLiteralExpression, key: string): ts.Expression | undefined {
  const field = object.properties.find((entry) =>
    ts.isPropertyAssignment(entry) && propertyName(entry.name) === key);
  return field && ts.isPropertyAssignment(field) ? field.initializer : undefined;
}

function propertyName(name: ts.PropertyName): string | undefined {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text;
  if (ts.isComputedPropertyName(name) && ts.isStringLiteralLike(name.expression)) return name.expression.text;
  return undefined;
}

function initializer(node: ts.Node, checker: ts.TypeChecker): ts.Expression | undefined {
  const symbol = ts.isShorthandPropertyAssignment(node)
    ? checker.getShorthandAssignmentValueSymbol(node)
    : checker.getSymbolAtLocation(ts.isPropertyAccessExpression(node) ? node.name : node);
  const declaration = symbol?.valueDeclaration;
  if (declaration && (ts.isVariableDeclaration(declaration) || ts.isPropertyAssignment(declaration))) {
    return declaration.initializer;
  }
  return undefined;
}

function ruleId(expression: ts.Expression | undefined, checker: ts.TypeChecker): string | undefined {
  if (!expression) return undefined;
  const value = ts.isIdentifier(expression) ? initializer(expression, checker) : expression;
  return value && ts.isStringLiteral(value) ? value.text : undefined;
}

function declaredRuleId(node: ts.Node, checker: ts.TypeChecker): string | undefined {
  if (!ts.isCallExpression(node) || node.expression.getText() !== 'defineRule') return undefined;
  const [definition] = node.arguments;
  return definition && ts.isObjectLiteralExpression(definition)
    ? ruleId(property(definition, 'id'), checker)
    : undefined;
}

function owningRuleId(field: ts.Node, checker: ts.TypeChecker): string | undefined {
  for (let parent = field.parent; parent; parent = parent.parent) {
    const id = ts.isObjectLiteralExpression(parent)
      ? ruleId(property(parent, 'ruleId'), checker)
      : ts.isCallExpression(parent) && resultHelpers.has(parent.expression.getText())
        ? ruleId(parent.arguments[0], checker)
        : declaredRuleId(parent, checker);
    if (id) return id;
  }
  return undefined;
}

function disclaimerValues(call: ts.CallExpression, checker: ts.TypeChecker): string[] {
  // The helper pushes one literal per topic and joins the selected entries in topic order.
  const helper = checker.getSymbolAtLocation(call.expression)?.valueDeclaration;
  assert.ok(helper && ts.isFunctionDeclaration(helper) && helper.body);
  const entries: string[] = [];
  let fallback: string | undefined;
  let separator: string | undefined;
  for (const node of nodes(helper.body)) {
    if (ts.isCallExpression(node) && node.expression.getText() === 'recommendations.push') {
      const [entry] = node.arguments;
      assert.ok(entry && ts.isStringLiteralLike(entry));
      entries.push(entry.text);
    }
    if (ts.isReturnStatement(node) && node.expression && ts.isConditionalExpression(node.expression)) {
      const { whenTrue, whenFalse } = node.expression;
      assert.ok(ts.isStringLiteralLike(whenFalse));
      assert.ok(ts.isCallExpression(whenTrue));
      assert.equal(whenTrue.expression.getText(), 'recommendations.join');
      const [delimiter] = whenTrue.arguments;
      assert.ok(delimiter && ts.isStringLiteralLike(delimiter));
      fallback = whenFalse.text;
      separator = delimiter.text;
    }
  }
  assert.ok(entries.length && fallback && separator !== undefined);
  const selections = entries.reduce<string[][]>(
    (previous, entry) => [...previous, ...previous.map((selection) => [...selection, entry])],
    [[]],
  );
  return selections.map((selection) => selection.length ? selection.join(separator) : fallback);
}

function valuesOf(expression: ts.Expression, checker: ts.TypeChecker, sample: Readonly<Record<string, string>>): string[] {
  const text = expression.getText();
  if (Object.hasOwn(sample, text)) return [sample[text]];
  if (ts.isStringLiteralLike(expression) || ts.isNumericLiteral(expression)) return [expression.text];
  if (ts.isTemplateExpression(expression)) {
    let value = expression.head.text;
    for (const span of expression.templateSpans) {
      const substitutions = valuesOf(span.expression, checker, sample);
      assert.equal(substitutions.length, 1, span.expression.getText());
      value += substitutions[0] + span.literal.text;
    }
    return [value];
  }
  if (ts.isConditionalExpression(expression)) {
    return [expression.whenTrue, expression.whenFalse].flatMap((branch) => valuesOf(branch, checker, sample));
  }
  if (ts.isArrayLiteralExpression(expression)) {
    return expression.elements.flatMap((element) => valuesOf(element, checker, sample));
  }
  if (ts.isParenthesizedExpression(expression) || ts.isSpreadElement(expression)) {
    return valuesOf(expression.expression, checker, sample);
  }
  if (ts.isBinaryExpression(expression) && expression.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const right = valuesOf(expression.right, checker, sample);
    return valuesOf(expression.left, checker, sample).flatMap((left) => right.map((value) => left + value));
  }
  if (ts.isIdentifier(expression) || ts.isPropertyAccessExpression(expression)) {
    if (text === 'undefined') return [];
    const value = initializer(expression, checker);
    if (value) return valuesOf(value, checker, sample);
  }
  if (ts.isCallExpression(expression)) {
    const callee = expression.expression;
    const [callback] = expression.arguments;
    if (ts.isPropertyAccessExpression(callee) && callee.name.text === 'map' &&
      callback && ts.isArrowFunction(callback) && ts.isExpression(callback.body)) {
      return valuesOf(callback.body, checker, sample);
    }
    if (callee.getText() === 'getDisclaimerRecommendation') return disclaimerValues(expression, checker);
  }
  assert.fail('Необработанное выражение в details: ' + text);
}

function isFullMatch(pattern: RegExp, value: string): boolean {
  return pattern.exec(value)?.[0] === value;
}

let previousLocale: ReturnType<typeof getLocale>;

beforeEach(() => {
  previousLocale = getLocale();
  setLocale('ru');
});

afterEach(() => setLocale(previousLocale));

describe('Русские рекомендации из details', () => {
  it('переводит литералы, ветки, элементы массивов и примеры подстановок из исходников', () => {
    const rulesDir = new URL('../rules/', import.meta.url);
    const paths = readdirSync(rulesDir, { encoding: 'utf8', recursive: true })
      // Сайтметр's own `yandex` and `bitrix` rules are written in Russian: nothing to overlay
      .filter(
        (name) =>
          name.endsWith('.ts') &&
          !name.endsWith('.test.ts') &&
          !/^(?:yandex|bitrix)[\\/]/.test(name) &&
          name !== 'runet-helpers.ts'
      )
      .map((name) => fileURLToPath(new URL(name.replaceAll('\\', '/'), rulesDir)));
    const program = ts.createProgram(paths, { noLib: true, noResolve: true, types: [] });
    const checker = program.getTypeChecker();
    const missing: string[] = [];
    let checked = 0;

    for (const file of program.getSourceFiles()) {
      const fileIds = [...nodes(file)].flatMap((node) => declaredRuleId(node, checker) ?? []);
      for (const field of nodes(file)) {
        if (!ts.isPropertyAssignment(field) && !ts.isShorthandPropertyAssignment(field)) continue;
        const key = propertyName(field.name);
        if (!key || !detailKeys.has(key)) continue;

        const { line } = file.getLineAndCharacterOfPosition(field.getStart());
        const location = file.fileName + ':' + (line + 1);
        const expression = ts.isPropertyAssignment(field) ? field.initializer : initializer(field, checker);
        assert.ok(expression, location);
        const id = owningRuleId(field, checker);
        // The shared unused-code helper returns the recommendation for the calling rule.
        const candidates = id ? [id] : fileIds;
        assert.ok(candidates.length, location);

        const values = new Set(inputs.flatMap((sample) => valuesOf(expression, checker, sample)));
        for (const value of values) {
          const matchingIds = candidates.filter((candidate) =>
            MESSAGES_RU_REC[candidate]?.some(([pattern]) => isFullMatch(pattern, value)));
          if (matchingIds.length !== 1 || trMessage(matchingIds[0], value) === value) {
            missing.push(location + ' [' + candidates.join(', ') + '] ' + value);
          }
          checked++;
        }
      }
    }
    expect(checked).toBeGreaterThan(0);
    expect(missing).toEqual([]);
  });

  it('привязывает каждый шаблон к целой строке без флагов g/y', () => {
    for (const [id, patterns] of Object.entries(MESSAGES_RU_REC)) {
      for (const [pattern] of patterns) {
        expect(pattern.source, id).toMatch(/^\^.*\$$/);
        expect(pattern.flags, id).not.toMatch(/[gy]/);
      }
    }
    const sentence = 'Set og:image:width to 1200 and og:image:height to 630.';
    expect(trMessage('social-og-image-size', sentence + '\n')).toBe(sentence + '\n');
    expect(trMessage('social-og-image-size', 'prefix ' + sentence)).toBe('prefix ' + sentence);
    setLocale('en');
    expect(trMessage('social-og-image-size', sentence)).toBe(sentence);
  });

  it('сохраняет подстановки и склоняет счётные формы', () => {
    const id = 'content-article-links';
    const message = (words: number, links: number) =>
      `Add more relevant links. For ${words} words, aim for at least ${links} links. Include internal links to related content and external links to authoritative sources.`;
    expect(trMessage(id, message(21, 1))).toContain('На 21 слово ориентируйтесь хотя бы на 1 ссылку');
    expect(trMessage(id, message(114, 4))).toContain('На 114 слов ориентируйтесь хотя бы на 4 ссылки');
    expect(trMessage(id, message(102, 15))).toContain('На 102 слова ориентируйтесь хотя бы на 15 ссылок');

    const url = 'https://example.com/guide?a=%22&b=$1#details';
    const tag = `<link rel="canonical" href="${url}">`;
    expect(trMessage('technical-amp-pairing', `Add ${tag} to the AMP page.`))
      .toBe(`Добавьте ${tag} на AMP-страницу.`);

    const suffix = 'Store | "Sale" $1\nToday';
    expect(trMessage('content-title-pattern',
      `End the title with the same separator and "${suffix}" the rest of the site uses, or drop the suffix everywhere.`))
      .toContain('«' + suffix + '»');
  });

  it('переводит рекомендации JS и CSS для правил, которые вызывают общий хелпер', async () => {
    const resource = { url: 'https://example.com/asset', totalBytes: 400_000, unusedBytes: 300_000 };
    const context = createTestContext('', { coverage: { js: [resource], css: [resource] } });
    for (const [rule, translation] of [
      [unusedJsRule, 'Разделите сборки по маршрутам'],
      [unusedCssRule, 'Удалите неиспользуемые селекторы'],
    ] as const) {
      const result = await rule.run(context);
      const recommendation = result.details?.recommendation;
      assert.equal(typeof recommendation, 'string');
      expect(trMessage(result.ruleId, String(recommendation))).toContain(translation);
    }
  });

  it('переводит каждый элемент массива рекомендаций Schema.org', async () => {
    const context = createTestContext('<script type="application/ld+json">' + JSON.stringify({
      '@graph': [
        { '@type': 'Product', name: 'Example', image: 'https://example.com/product.png' },
        { '@type': 'Organization', name: 'Example' },
      ],
    }) + '</script>');
    const { ruleId, details } = await structuredDataRequiredFieldsRule.run(context);
    const recommendations = details?.recommendations;
    assert.ok(Array.isArray(recommendations));
    expect(recommendations.map((value: string) => trMessage(ruleId, value))).toEqual([
      'Добавьте в разметку Product свойства description, offers, aggregateRating, brand',
      'Добавьте в разметку Organization свойства url, logo, contactPoint, sameAs, address',
    ]);
    expect(trMessage(ruleId, 'Article: consider adding publisher'))
      .toBe('Добавьте в разметку Article свойство publisher');
  });
});

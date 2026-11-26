/**
 * The failures a page can hit that are not the page's fault: the server
 * stopped, the thing being asked for is not there, or the read itself failed.
 *
 * `read-failed` matters because without it a failed read renders as an empty
 * database — the user is told they have no audits and invited to run their
 * first one, when in fact the ones they have could not be loaded.
 */

import { Link } from 'react-router-dom';
import { localizeDiagnostic } from '../lib/diagnostics.js';

interface PageErrorProps {
  kind: 'server-gone' | 'not-found' | 'read-failed' | 'stale-session';
  /** Overrides the heading; some "not found" cases are not failures */
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function PageError({ kind, title, message, onRetry }: PageErrorProps) {
  const defaultTitle =
    kind === 'stale-session'
      ? 'Веб-панель перезапустилась'
      : kind === 'server-gone'
      ? 'Сервер веб-панели остановился'
      : kind === 'read-failed'
        ? 'Не удалось загрузить проверки'
        : 'Проверка не найдена';

  const defaultMessage =
    kind === 'stale-session'
      ? 'Во вкладке осталась старая сессия. Обновите страницу, чтобы подключиться к серверу.'
      : kind === 'server-gone'
      ? 'Запустите сервер командой `sitemetr serve` и попробуйте снова.'
      : kind === 'read-failed'
        ? 'Не удалось прочитать базу данных. Попробуйте снова. Возможно, файл занят другим процессом.'
        : 'В базе данных нет этой проверки. Возможно, её удалили.';

  return (
    <div className="max-w-[var(--content-max-width)] mx-auto p-6">
      <div
        className="rounded-xl border p-8 text-center"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-elevated)' }}
        role="alert"
      >
        <p className="text-base font-medium mb-1" style={{ color: 'var(--color-text)' }}>
          {title ?? defaultTitle}
        </p>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          {message ? localizeDiagnostic(message) : defaultMessage}
        </p>
        <div className="flex items-center justify-center gap-2">
          {kind === 'stale-session' ? (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 text-sm rounded-md font-medium"
              style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-on-accent)' }}
            >
              Обновить страницу
            </button>
          ) : (
            onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-3 py-1.5 text-sm rounded-md font-medium"
              style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-on-accent)' }}
            >
              Повторить
            </button>
            )
          )}
          <Link
            to="/"
            className="px-3 py-1.5 text-sm rounded-md font-medium border"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          >
            Вернуться к истории
          </Link>
        </div>
      </div>
    </div>
  );
}

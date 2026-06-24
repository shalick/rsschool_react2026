import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import messages from '../i18n/messages/en.json';

type LeafValue = string;

function getNamespace(ns: string): Record<string, LeafValue> {
  return (messages as Record<string, Record<string, LeafValue>>)[ns] ?? {};
}

function interpolate(template: string, values?: Record<string, unknown>): string {
  if (!values) return template;
  return template.replace(
    /\{(\w+),\s*plural,\s*(?:[^}]*?one\s*\{([^}]*)\})?[^}]*?other\s*\{([^}]*)\}[^}]*\}/g,
    (_match, key, one, other) => {
      const count = values[key] as number;
      return count === 1 ? one.trim() : other.trim();
    }
  ).replace(/\{(\w+)\}/g, (_match, key) => String(values[key] ?? `{${key}}`));
}

vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) =>
    (key: string, values?: Record<string, unknown>) => {
      const ns = getNamespace(namespace);
      const template = ns[key] ?? `${namespace}.${key}`;
      return interpolate(template, values);
    },
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('next-intl/server', () => ({
  getTranslations: (namespace: string) => {
    const ns = getNamespace(namespace);
    const t = (key: string, values?: Record<string, unknown>) => {
      const template = ns[key] ?? `${namespace}.${key}`;
      return interpolate(template, values);
    };
    return Promise.resolve(t);
  },
  getLocale: () => Promise.resolve('en'),
  getMessages: () => Promise.resolve(messages),
}));

export const mockPush = vi.fn();
export const mockRefresh = vi.fn();

vi.mock('../i18n/navigation', () => ({
  Link: ({
    href,
    className,
    style,
    children,
  }: {
    href: string;
    className?: string;
    style?: React.CSSProperties;
    children: React.ReactNode;
  }) => (
    <a href={href} className={className} style={style}>
      {children}
    </a>
  ),
  useRouter: () => ({ push: mockPush, refresh: mockRefresh, replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/',
  redirect: vi.fn(),
}));

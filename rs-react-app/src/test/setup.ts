import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import messages from '../i18n/messages/en.json';

type Messages = typeof messages;
type NamespaceKey = keyof Messages;
type LeafValue = string;

function getNamespace(ns: string): Record<string, LeafValue> {
  return (messages as Record<string, Record<string, LeafValue>>)[ns] ?? {};
}

function interpolate(template: string, values?: Record<string, unknown>): string {
  if (!values) return template;
  // Handle ICU plural patterns like "{count, plural, one {x} other {y}}"
  return template.replace(
    /\{(\w+),\s*plural,\s*(?:[^}]*?one\s*\{([^}]*)\})?[^}]*?other\s*\{([^}]*)\}[^}]*\}/g,
    (_match, key, one, other) => {
      const count = values[key] as number;
      return count === 1 ? one.trim() : other.trim();
    }
  ).replace(/\{(\w+)\}/g, (_match, key) => String(values[key] ?? `{${key}}`));
}

// Global mock — useTranslations returns real English strings so existing
// test assertions continue to work without wrapping in NextIntlClientProvider.
vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) =>
    (key: string, values?: Record<string, unknown>) => {
      const ns = getNamespace(namespace);
      const template = ns[key] ?? `${namespace}.${key}`;
      return interpolate(template, values);
    },
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

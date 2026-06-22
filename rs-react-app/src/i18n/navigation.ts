import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Locale-aware navigation primitives.
// Import Link, useRouter, usePathname, redirect from here
// instead of 'next/link' or 'next/navigation'.
export const { Link, useRouter, usePathname, redirect } =
  createNavigation(routing);

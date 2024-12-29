import Link from 'next/link';
import { HashIcon } from 'lucide-react';

import { LocaleSwitcher } from './locale-switcher';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  return (
    <header className="flex items-center justify-end gap-4 p-4 md:p-8">
      <Link className="mr-auto" href="/">
        <HashIcon className="h-8 w-8" />
      </Link>
      <LocaleSwitcher />
      <ThemeToggle />
    </header>
  );
}

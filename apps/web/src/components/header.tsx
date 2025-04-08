import Link from 'next/link';
import { HashIcon } from 'lucide-react';

import { LocaleSwitcher } from './locale-switcher';
import { ThemeToggle } from './theme-toggle';
import { ServerHealth } from '@src/components/server-health';

export function Header() {
  return (
    <header className="flex items-center justify-end gap-4 p-4 md:p-8">
      <Link className="mr-auto" href="/">
        <HashIcon className="h-8 w-8" />
      </Link>
      <ServerHealth />
      <LocaleSwitcher />
      <ThemeToggle />
    </header>
  );
}

import { LocaleSwitcher } from './locale-switcher';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  return (
    <header className="flex justify-end gap-4 p-4 md:p-8">
      <LocaleSwitcher />
      <ThemeToggle />
    </header>
  );
}

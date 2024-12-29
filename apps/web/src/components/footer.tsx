import { useTranslations } from "next-intl";
import Link from "next/link";

export function Footer() {
  const t = useTranslations('components.footer');

  return (
    <footer className="flex items-center justify-center p-4">
      {t.rich('content', {
        githubLink: (children) => (
          <Link className="inline ml-2" href="https://github.com/TSmota" target="_blank">
            {children}
          </Link>
        ),
      })}
    </footer>
  );
}

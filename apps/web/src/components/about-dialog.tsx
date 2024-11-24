import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Dialog, DialogContent } from '@src/components/ui/dialog';

interface AboutDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AboutDialog(props: AboutDialogProps) {
  const t = useTranslations('components.aboutDialog');

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <div className="flex flex-col">
          <h2 className="text-xl">{t('title')}</h2>
          <pre className="font-inter mt-4 text-wrap">
            {t.rich('content', {
              githubLink: (children) => (
                <Link className="inline" href="https://github.com/TSmota" target="_blank">
                  {children}
                </Link>
              ),
            })}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}

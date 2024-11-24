import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { type PlayerInfo } from '@repo/commons';
import { storageService } from '@src/services/storage';
import { customZodMessage, generateGameCode } from '@src/lib/utils';
import { playerInfoKey, roomInfoKey } from '@src/constants';
import { Input } from '@src/components/ui/input';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  Form,
  FormDescription,
  FormMessage,
} from '@src/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@src/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';

interface CreateGameDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const FormSchema = z.object({
  username: z
    .string({
      required_error: customZodMessage('common.fields.errors.required'),
    })
    .min(
      2,
      customZodMessage('common.fields.errors.minLength', {
        count: 2,
      }),
    )
    .max(
      25,
      customZodMessage('common.fields.errors.maxLength', {
        count: 25,
      }),
    ),
  variant: z.string(),
});

export function CreateGameDialog(props: CreateGameDialogProps) {
  const t = useTranslations('components.createGameDialog');
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      variant: 'classic',
    },
  });

  useEffect(() => {
    // Inside of useEffect to not throw an error on the server side due to localStorage being undefined
    form.setValue('username', storageService.getItem<PlayerInfo>(playerInfoKey)?.username ?? '');
  }, [form]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    storageService.setItem(playerInfoKey, {
      id: crypto.randomUUID(),
      isHost: true,
      username: data.username,
    });

    const gameCode = generateGameCode();

    storageService.setItem(`${gameCode}-${roomInfoKey}`, {
      variant: data.variant,
      players: [],
    });

    router.push(`/game/${gameCode}`);
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogTitle>{t('title')}</DialogTitle>
        <DialogDescription className="sr-only">{t('description')}</DialogDescription>
        <Form {...form}>
          <form className="flex flex-col space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.username.label')}</FormLabel>

                  <FormControl>
                    <Input {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="variant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.variant.label')}</FormLabel>

                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="classic">{t('fields.variant.options.classic')}</SelectItem>
                      <SelectItem value="unlocked">
                        {t('fields.variant.options.unlocked')}
                      </SelectItem>
                      <SelectItem value="conquer">{t('fields.variant.options.conquer')}</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormDescription className="whitespace-break-spaces">
                    {t('fields.variant.description')}
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* TODO: Future fields:
                - Person limit (for live watching)
                - 1v1 or tournament
                - For unlocked: number of initial moves
                - Time limit per move
              */}

            <Button className="self-end" type="submit">
              {t('submit')}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

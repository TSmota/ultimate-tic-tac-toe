import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { type PlayerInfo } from '@repo/commons';
import { v4 as uuidv4 } from 'uuid';

import { PLAYER_INFO_KEY } from '@src/constants';
import { storageService } from '@src/services/storage';
import { customZodMessage } from '@src/lib/utils';
import { Input } from '@src/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@src/components/ui/form';
import { Dialog, DialogContent } from '@src/components/ui/dialog';
import { Button } from '@src/components/ui/button';

interface JoinGameDialogProps {
  code?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const FormSchema = z.object({
  code: z
    .string({
      required_error: customZodMessage('common.fields.errors.required'),
    })
    .length(6, customZodMessage('common.fields.errors.invalidCode')),
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
});

export function JoinGameDialog(props: JoinGameDialogProps) {
  const t = useTranslations('components.joinGameDialog');
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    values: {
      code: props.code ?? '',
      username: '',
    }
  });

  useEffect(() => {
    // Inside of useEffect to not throw an error on the server side due to localStorage being undefined
    form.setValue('username', storageService.getItem<PlayerInfo>(PLAYER_INFO_KEY)?.username ?? '');
  }, [form]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    storageService.setItem(PLAYER_INFO_KEY, {
      uuid: uuidv4(),
      isHost: false,
      username: data.username,
    });

    const gameCode = data.code.toUpperCase();
    // TODO: validate room code exists
    router.push(`/game/${gameCode}`);
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <Form {...form}>
          <form className="flex flex-col space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
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
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.code.label')}</FormLabel>

                  <FormControl>
                    <Input {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="self-end" type="submit">
              {t('submit')}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

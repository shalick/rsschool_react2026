'use client';

import { useRouter } from '../../i18n/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '../Button/Button';

export function RefreshButton() {
  const router = useRouter();
  const t = useTranslations('countries');

  return (
    <Button variant="secondary" onClick={() => router.refresh()}>
      {`🔄 ${t('refresh')}`}
    </Button>
  );
}

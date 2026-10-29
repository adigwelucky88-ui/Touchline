import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/screen';
import { EmptyView } from '@/components/state-views';

/** "My career": the signed-in athlete's own channel. Needs Cognito sign-in (phase 4). */
export function CareerScreen() {
  const { t } = useTranslation();

  return (
    <Screen eyebrow={t('world')} title={t('career')}>
      <EmptyView title={t('stage')} hint={t('journey')} />
    </Screen>
  );
}

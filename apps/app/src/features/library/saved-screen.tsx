import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/screen';
import { EmptyView, LoadingView } from '@/components/state-views';
import { VideoGrid } from '@/components/video-grid';

import { useSavedViewModel } from './use-saved-view-model';

export function SavedScreen() {
  const vm = useSavedViewModel();
  const { t } = useTranslation();

  return (
    <Screen eyebrow={t('hero')} title={t('saved')}>
      {vm.isLoading ? (
        <LoadingView />
      ) : vm.videos.length === 0 ? (
        <EmptyView title={t('empty')} hint={t('emptyHint')} />
      ) : (
        <VideoGrid videos={vm.videos} isSaved={vm.isSaved} onToggleSaved={vm.toggleSaved} />
      )}
    </Screen>
  );
}

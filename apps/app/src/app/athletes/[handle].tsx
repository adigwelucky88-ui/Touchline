import { useLocalSearchParams } from 'expo-router';

import { AthleteChannelScreen } from '@/features/athletes/athlete-channel-screen';

/** Public athlete page. Server-rendered on web so search engines and link previews can read it. */
export default function AthleteRoute() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  return <AthleteChannelScreen key={handle} handle={handle} />;
}

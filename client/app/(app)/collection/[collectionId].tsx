import { useLocalSearchParams } from 'expo-router';

import { CollectionDetailScreen } from '@/components/collections/collection-detail-screen';

export default function CollectionDetailRoute() {
  const { collectionId } = useLocalSearchParams<{ collectionId: string }>();

  if (!collectionId || typeof collectionId !== 'string') {
    return null;
  }

  return <CollectionDetailScreen collectionId={collectionId} />;
}

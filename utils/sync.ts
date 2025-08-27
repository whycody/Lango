import { SyncMetadata, SyncResult } from "../store/types";

export async function syncInBatches<T>(
  items: T[],
  syncFn: (chunk: T[]) => Promise<SyncResult[] | null>,
  batchSize: number = 500
): Promise<SyncResult[]> {
  if (items.length === 0) return [];
  const results: SyncResult[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const chunk = items.slice(i, i + batchSize);
    const res = await syncFn(chunk);
    if (res) results.push(...res);
  }
  return results;
}

export function mergeLocalAndServer<T extends SyncMetadata & { id: string }>(localItems: T[], serverItems: T[]): T[] {
  const serverMap = new Map(serverItems.map(si => [si.id, si]));
  const existingIds = new Set(localItems.map(li => li.id));

  const merged = localItems.map(item => {
    if (serverMap.has(item.id)) {
      const serverItem = serverMap.get(item.id)!;
      return {
        ...serverItem,
        synced: true,
        locallyUpdatedAt: serverItem.updatedAt,
        updatedAt: serverItem.updatedAt,
      } as T & SyncMetadata;
    }
    return item;
  });

  const newItems = serverItems
    .filter(si => !existingIds.has(si.id))
    .map(si => ({
      ...si,
      synced: true,
      locallyUpdatedAt: si.updatedAt,
      updatedAt: si.updatedAt,
    } as T & SyncMetadata));

  return [...merged, ...newItems];
}

export function findChangedItems<T extends SyncMetadata & { id: string }>(originalItems: T[], finalItems: T[]): T[] {
  const originalMap = new Map(originalItems.map(item => [item.id, item]));

  return finalItems.filter(item => {
    const original = originalMap.get(item.id);
    if (!original) return true;
    return (
      original.synced !== item.synced ||
      original.updatedAt !== item.updatedAt ||
      original.locallyUpdatedAt !== item.locallyUpdatedAt
    );
  });
}

export function updateLocalItems<T extends SyncMetadata & {
  id: string
}>(items: T[], serverUpdates: SyncResult[]): T[] {
  const updatesMap = new Map(serverUpdates.map(update => [update.id, update.updatedAt]));

  return items.map(item => {
    if (updatesMap.has(item.id)) {
      const serverUpdatedAt = updatesMap.get(item.id)!;
      return {
        ...item,
        synced: true,
        updatedAt: serverUpdatedAt,
        locallyUpdatedAt: serverUpdatedAt,
      };
    }
    return item;
  });
}

export function getUnsyncedItems<T extends SyncMetadata>(items: T[]): T[] {
  return items.filter(item => !item.synced);
}

export function findLatestUpdatedAt<T extends SyncMetadata>(items: T[]): string {
  const latestTime = Math.max(0, ...items.map(item => new Date(item.updatedAt ?? item.locallyUpdatedAt).getTime()));
  return new Date(latestTime).toISOString();
}
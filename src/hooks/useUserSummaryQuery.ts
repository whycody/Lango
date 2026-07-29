import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { fetchUserSummary } from '../api/apiClient';
import { DAY_IN_MS } from '../constants/Date';
import { UserSummary } from '../types';

export const useUserSummaryQuery = (
    userId: string | undefined,
): UseQueryResult<UserSummary | null> =>
    useQuery({
        enabled: !!userId,
        gcTime: Infinity,
        queryFn: () => fetchUserSummary(userId as string),
        queryKey: ['userSummary', userId],
        staleTime: DAY_IN_MS,
    });

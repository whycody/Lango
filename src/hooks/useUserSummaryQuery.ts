import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { usersApi } from '../api/users-api';
import { DAY_IN_MS } from '../constants/Date';
import { UserSummary } from '../types';

export const useUserSummaryQuery = (
    userId: string | undefined,
): UseQueryResult<UserSummary | null> =>
    useQuery({
        enabled: !!userId,
        gcTime: Infinity,
        queryFn: async () => {
            const result = await usersApi.fetchUserSummary(userId as string);
            return result.kind === 'ok' ? result.data : null;
        },
        queryKey: ['userSummary', userId],
        staleTime: DAY_IN_MS,
    });

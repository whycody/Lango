import { useCallback } from 'react';

import { useAuth } from '../../store/AuthContext';

export const useRepositoryUserId = () => {
    const { user } = useAuth();

    return useCallback(() => {
        if (!user?.userId) throw new Error('User not logged in');
        return user.userId;
    }, [user?.userId]);
};

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Island {
    id: string;
    name: string;
    description?: string;
    order?: number;
}

interface UseIslandsOptions {
    /** Supabase select string. Default: 'id, name, description, order' */
    select?: string;
    /** Order by column. Default: 'order' */
    orderBy?: string;
    /** Ascending order. Default: true */
    ascending?: boolean;
}

interface UseIslandsReturn {
    /** Array of islands */
    islands: Island[];
    /** Lookup map: id → name */
    islandsMap: Record<string, string>;
    /** Loading state */
    loading: boolean;
    /** Error message if fetch failed */
    error: string | null;
    /** Re-fetch islands */
    refetch: () => void;
}

/**
 * Hook to fetch and cache the islands list.
 * Provides both the array and an id→name lookup map.
 *
 * @example
 * const { islands, islandsMap, loading } = useIslands();
 * // islands = [{ id: '...', name: 'Neurología', ... }, ...]
 * // islandsMap = { 'abc-123': 'Neurología', ... }
 */
export const useIslands = (options: UseIslandsOptions = {}): UseIslandsReturn => {
    const {
        select = 'id, name, description, order',
        orderBy = 'order',
        ascending = true,
    } = options;

    const [islands, setIslands] = useState<Island[]>([]);
    const [islandsMap, setIslandsMap] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchIslands = useCallback(async () => {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
            .from('islands')
            .select(select)
            .order(orderBy, { ascending });

        if (fetchError) {
            console.error('useIslands error:', fetchError);
            setError(fetchError.message);
        } else {
            const islandsData = (data as unknown as Island[]) || [];
            setIslands(islandsData);

            // Build id → name lookup map
            const map: Record<string, string> = {};
            islandsData.forEach((i: any) => { map[i.id] = i.name; });
            setIslandsMap(map);
        }

        setLoading(false);
    }, [select, orderBy, ascending]);

    useEffect(() => {
        fetchIslands();
    }, [fetchIslands]);

    return { islands, islandsMap, loading, error, refetch: fetchIslands };
};

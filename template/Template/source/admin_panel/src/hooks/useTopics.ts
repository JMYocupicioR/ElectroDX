import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Topic {
    id: string;
    name: string;
    island_id: string;
}

interface UseTopicsOptions {
    /** Filter topics by island ID. If undefined, fetches all topics. */
    islandId?: string;
    /** Supabase select string. Default: 'id, name, island_id' */
    select?: string;
    /** Order by column. Default: 'name' */
    orderBy?: string;
}

interface UseTopicsReturn {
    /** Array of topics */
    topics: Topic[];
    /** Lookup map: id → name */
    topicsMap: Record<string, string>;
    /** Loading state */
    loading: boolean;
    /** Error message if fetch failed */
    error: string | null;
    /** Re-fetch topics */
    refetch: () => void;
}

/**
 * Hook to fetch and cache topics, optionally filtered by island.
 * Automatically re-fetches when islandId changes.
 *
 * @example
 * const { topics, topicsMap, loading } = useTopics({ islandId: selectedIsland });
 * // topics = [{ id: '...', name: 'Electromiografía', island_id: '...' }, ...]
 * // topicsMap = { 'xyz-456': 'Electromiografía', ... }
 */
export const useTopics = (options: UseTopicsOptions = {}): UseTopicsReturn => {
    const {
        islandId,
        select = 'id, name, island_id',
        orderBy = 'name',
    } = options;

    const [topics, setTopics] = useState<Topic[]>([]);
    const [topicsMap, setTopicsMap] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTopics = useCallback(async () => {
        setLoading(true);
        setError(null);

        let query = supabase
            .from('topics')
            .select(select)
            .order(orderBy);

        if (islandId) {
            query = query.eq('island_id', islandId);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
            console.error('useTopics error:', fetchError);
            setError(fetchError.message);
        } else {
            const topicsData = (data as unknown as Topic[]) || [];
            setTopics(topicsData);

            // Build id → name lookup map
            const map: Record<string, string> = {};
            topicsData.forEach((t: any) => { map[t.id] = t.name; });
            setTopicsMap(map);
        }

        setLoading(false);
    }, [islandId, select, orderBy]);

    useEffect(() => {
        fetchTopics();
    }, [fetchTopics]);

    return { topics, topicsMap, loading, error, refetch: fetchTopics };
};

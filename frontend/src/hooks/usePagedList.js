import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Fetches a paginated API list with "load more" support.
 * Re-fetches from the start whenever `params` (compared by value) or `version` change.
 */
const usePagedList = (fetcher, params, version, pageSize = 30) => {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const requestId = useRef(0);
    const paramsKey = JSON.stringify(params);

    const load = useCallback(async (skip) => {
        const id = ++requestId.current;
        setLoading(true);
        setError(null);
        try {
            const data = await fetcher({ ...JSON.parse(paramsKey), skip, limit: pageSize });
            // Ignore responses that arrive after a newer search was started
            if (id !== requestId.current) return;
            setItems((prev) => (skip === 0 ? data.items : [...prev, ...data.items]));
            setTotal(data.total);
        } catch (e) {
            if (id === requestId.current) setError(e.message);
        } finally {
            if (id === requestId.current) setLoading(false);
        }
    }, [fetcher, paramsKey, pageSize]);

    useEffect(() => {
        load(0);
    }, [load, version]);

    return {
        items,
        total,
        loading,
        error,
        hasMore: items.length < total,
        loadMore: () => load(items.length),
        reload: () => load(0),
    };
};

export default usePagedList;

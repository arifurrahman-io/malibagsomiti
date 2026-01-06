import { useState, useEffect, useCallback } from "react";
import api from "../services/api"; //

/**
 * Custom hook for dynamic data fetching with automatic Auth header integration.
 * Optimized to prevent crashes when URLs contain 'undefined' during hydration.
 */
export const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Memoized fetchData function to prevent unnecessary re-renders in child components
  const fetchData = useCallback(async () => {
    // Safety check: Prevent API calls if the URL is missing or contains "undefined"
    // This is critical when fetching user-specific profiles on the dashboard
    if (!url || url.includes("undefined")) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(url); // Automatically includes JWT via interceptors
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [url]);

  // 2. Initial fetch on component mount or URL change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 3. Return refetch to allow components to refresh data after actions (e.g., adding a member)
  return { data, loading, error, refetch: fetchData };
};

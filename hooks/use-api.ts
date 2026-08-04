"use client";

import { useState, useEffect, useCallback } from "react";

export interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T | null;
  meta?: PaginationMeta;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFetch<T>(url: string | null): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!url) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json.error?.message || "Failed to fetch data");
      }
      setData(json.data);
      if (json.meta) {
        setMeta(json.meta);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, meta, loading, error, refetch: fetchData };
}

// Teams Hooks
export function useTeams(page = 1, limit = 20, search = "") {
  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("limit", limit.toString());
  if (search) params.set("search", search);
  return useFetch<any[]>(`/api/teams?${params.toString()}`);
}

export function useTeamDetail(id: string) {
  return useFetch<any>(`/api/teams/${id}`);
}

// Players Hooks
export function usePlayers(options: { page?: number; limit?: number; search?: string; role?: string; country?: string; teamId?: string } = {}) {
  const { page = 1, limit = 20, search = "", role = "", country = "", teamId = "" } = options;
  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("limit", limit.toString());
  if (search) params.set("search", search);
  if (role) params.set("role", role);
  if (country) params.set("country", country);
  if (teamId) params.set("teamId", teamId);
  return useFetch<any[]>(`/api/players?${params.toString()}`);
}

export function usePlayerDetail(id: string) {
  return useFetch<any>(`/api/players/${id}`);
}

// Matches Hooks
export function useMatches(options: { page?: number; limit?: number; teamId?: string; startDate?: string; endDate?: string } = {}) {
  const { page = 1, limit = 20, teamId = "", startDate = "", endDate = "" } = options;
  const params = new URLSearchParams();
  params.set("page", page.toString());
  params.set("limit", limit.toString());
  if (teamId) params.set("teamId", teamId);
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  return useFetch<any[]>(`/api/matches?${params.toString()}`);
}

export function useMatchDetail(id: string) {
  return useFetch<any>(`/api/matches/${id}`);
}

// Leaderboards Hooks
export function useBattingLeaders(metric: string = "runs", limit = 10, page = 1) {
  const params = new URLSearchParams();
  params.set("metric", metric);
  params.set("limit", limit.toString());
  params.set("page", page.toString());
  return useFetch<any[]>(`/api/stats/batting-leaders?${params.toString()}`);
}

export function useBowlingLeaders(metric: string = "wickets", limit = 10, page = 1) {
  const params = new URLSearchParams();
  params.set("metric", metric);
  params.set("limit", limit.toString());
  params.set("page", page.toString());
  return useFetch<any[]>(`/api/stats/bowling-leaders?${params.toString()}`);
}

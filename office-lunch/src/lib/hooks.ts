"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(() => {
    api.get<T>(url).then(setData, (e: Error) => setError(e.message));
  }, [url]);
  useEffect(reload, [reload]);
  return { data, error, reload, setData };
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import APIError from "@/lib/api/APIError";
import AuthService from "@/lib/api/AuthService";
import GeoService from "@/lib/api/GeoService";

type GeoInfo = {
  ip?: string;
  city?: string;
  region?: string;
  country?: string;
  loc?: string;
  org?: string;
  postal?: string;
  timezone?: string;
  raw?: Record<string, unknown>;
};

type GeoHistory = {
  id: number;
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  loc?: string;
  timezone?: string;
  created_at?: string;
};

const getCoordinates = (loc?: string) => {
  if (!loc) {
    return null;
  }

  const [latRaw, lonRaw] = loc.split(",");
  const lat = Number(latRaw);
  const lon = Number(lonRaw);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return null;
  }

  return { lat, lon };
};

const getMapUrl = (lat: number, lon: number) => {
  const delta = 0.05;
  const left = lon - delta;
  const right = lon + delta;
  const top = lat + delta;
  const bottom = lat - delta;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lon}`;
};

export default function HomePage() {
  const router = useRouter();
  const didBootstrap = useRef(false);

  const [geo, setGeo] = useState<GeoInfo | null>(null);
  const [history, setHistory] = useState<GeoHistory[]>([]);
  const [queryIp, setQueryIp] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const coordinates = useMemo(() => getCoordinates(geo?.loc), [geo?.loc]);

  const hasSelected = useMemo(() => selectedIds.length > 0, [selectedIds]);

  const loadHistory = useCallback(async () => {
    const response = await GeoService.getHistory();
    setHistory(response.data ?? []);
  }, []);

  const loadCurrentGeo = useCallback(async () => {
    const response = await GeoService.getCurrentGeo();
    setGeo(response.data ?? null);
  }, []);

  const bootstrap = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      await AuthService.me();
      await loadCurrentGeo();
      await loadHistory();
    } catch {
      localStorage.removeItem("_token");
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [loadCurrentGeo, loadHistory, router]);

  useEffect(() => {
    if (didBootstrap.current) {
      return;
    }

    const token = localStorage.getItem("_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    didBootstrap.current = true;
    void bootstrap();
  }, [bootstrap, router]);

  const isValidIp = (ip: string) => {
    const ipv4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
    const ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::1)$/;
    return ipv4.test(ip) || ipv6.test(ip);
  };

  const handleSearch = async () => {
    setError("");

    if (!queryIp.trim()) {
      setError("Please enter an IP address.");
      return;
    }

    if (!isValidIp(queryIp.trim())) {
      setError("Invalid IP address format.");
      return;
    }

    try {
      const response = await GeoService.searchGeo(queryIp.trim());
      setGeo(response.data ?? null);
      setQueryIp("");
      await loadHistory();
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError("Failed to fetch IP geolocation.");
      }
    }
  };

  const handleClear = async () => {
    setError("");
    setQueryIp("");
    await loadCurrentGeo();
    await loadHistory();
  };

  const handleHistoryClick = async (historyId: number) => {
    setError("");
    try {
      const response = await GeoService.getHistoryById(historyId);
      setGeo(response.data ?? null);
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      }
    }
  };

  const toggleSelected = (historyId: number) => {
    setSelectedIds((prev) =>
      prev.includes(historyId) ? prev.filter((id) => id !== historyId) : [...prev, historyId]
    );
  };

  const deleteSelected = async () => {
    if (!hasSelected) {
      return;
    }

    setError("");

    try {
      await GeoService.deleteHistory(selectedIds);
      setSelectedIds([]);
      await loadHistory();
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      }
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch {
      //SHORT COMMENT
    }

    localStorage.removeItem("_token");
    router.replace("/login");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-500">Loading home...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-5">
      <div className="mx-auto flex min-h-screen w-full max-w-screen-2xl flex-col space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-4 py-3 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">IP Geo Dashboard</h1>
          <button
            onClick={logout}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
          >
            Logout
          </button>
        </div>

        <div className="grid flex-1 gap-3 lg:grid-cols-12">
          <section className="rounded-xl bg-white p-4 shadow-sm lg:col-span-8 lg:flex lg:flex-col xl:col-span-9">
            <h2 className="mb-3 text-base font-semibold text-slate-900">Current Result</h2>

            <div className="mb-4 flex flex-col gap-2 md:flex-row">
              <input
                value={queryIp}
                onChange={(e) => setQueryIp(e.target.value)}
                placeholder="Enter IP address"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 outline-none ring-blue-200 focus:ring"
              />
              <button
                onClick={handleSearch}
                className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 md:shrink-0"
              >
                Search
              </button>
              <button
                onClick={handleClear}
                className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100 md:shrink-0"
              >
                Clear
              </button>
            </div>

            {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

            <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 sm:grid-cols-2">
              <p>
                <span className="font-semibold">IP:</span> {geo?.ip ?? "-"}
              </p>
              <p>
                <span className="font-semibold">City:</span> {geo?.city ?? "-"}
              </p>
              <p>
                <span className="font-semibold">Region:</span> {geo?.region ?? "-"}
              </p>
              <p>
                <span className="font-semibold">Country:</span> {geo?.country ?? "-"}
              </p>
              <p>
                <span className="font-semibold">Location:</span> {geo?.loc ?? "-"}
              </p>
              <p>
                <span className="font-semibold">Timezone:</span> {geo?.timezone ?? "-"}
              </p>
              <p className="sm:col-span-2">
                <span className="font-semibold">Org:</span> {geo?.org ?? "-"}
              </p>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
              <h3 className="mb-2 text-sm font-semibold text-slate-900">Map</h3>
              {coordinates ? (
                <iframe
                  title="Geo map"
                  src={getMapUrl(coordinates.lat, coordinates.lon)}
                  className="h-52 w-full rounded-md border border-slate-200 sm:h-64 lg:h-full lg:min-h-72"
                  loading="lazy"
                />
              ) : (
                <p className="text-xs text-slate-500">No location coordinates available to pin on map.</p>
              )}
            </div>
          </section>

          <section className="rounded-xl bg-white p-4 shadow-sm lg:col-span-4 lg:flex lg:flex-col xl:col-span-3">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">History</h2>
              <button
                onClick={deleteSelected}
                disabled={!hasSelected}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Delete Selected
              </button>
            </div>

            <div className="space-y-2 overflow-auto pr-1 lg:flex-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-slate-200 p-2 text-xs text-slate-700 hover:bg-slate-50"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleHistoryClick(item.id)}
                      className="truncate text-left font-semibold text-blue-700 hover:underline"
                    >
                      {item.ip}
                    </button>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelected(item.id)}
                    />
                  </div>
                  <p>
                    {item.city ?? "-"}, {item.region ?? "-"}, {item.country ?? "-"}
                  </p>
                </div>
              ))}

              {history.length === 0 ? (
                <p className="text-xs text-slate-500">No history yet.</p>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

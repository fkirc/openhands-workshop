"use client";

import { useEffect, useState } from "react";

/**
 * Live water temperature of the Vienna Danube arms (Alte Donau / Neue Donau).
 * Data comes from the City of Vienna hydrology feed (MA 45), proxied through
 * the /api/danube-temp rewrite so it stays same-origin.
 */

const FEED_URL = "/api/danube-temp";
const NS = "http://www.wien.gv.at/vierss";
const MIN = 0;
const MAX = 30;

interface Reading {
  name: string;
  value: number;
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function parseFeed(xml: string): Reading[] {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const readings: Reading[] = [];

  for (const item of Array.from(doc.querySelectorAll("item"))) {
    const name = item.querySelector("title")?.textContent?.trim();
    const raw = item.getElementsByTagNameNS(NS, "bwwta")[0]?.textContent;
    if (!name || !raw) continue;

    const value = Number.parseFloat(raw.replace(",", "."));
    if (Number.isNaN(value)) continue;

    readings.push({ name, value });
  }

  return readings;
}

function formatTemp(value: number) {
  return value.toFixed(1).replace(".", ",");
}

function tempColor(value: number) {
  const pct = clamp((value - MIN) / (MAX - MIN));
  const hue = Math.round(210 - pct * 210);
  return `hsl(${hue} 90% 55%)`;
}

function tempLabel(value: number) {
  if (value < 10) return "kalt";
  if (value < 15) return "kühl";
  if (value < 20) return "mild";
  if (value < 25) return "warm";
  return "sehr warm";
}

function Thermometer({ value }: { value: number }) {
  const pct = clamp((value - MIN) / (MAX - MIN)) * 100;
  const color = tempColor(value);

  return (
    <div className="flex items-start gap-2">
      <div className="flex h-40 flex-col justify-between py-0.5 text-[10px] tabular-nums text-zinc-500">
        <span>30</span>
        <span>20</span>
        <span>10</span>
        <span>0</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="relative h-40 w-4 overflow-hidden rounded-full bg-white/10 ring-1 ring-inset ring-white/15">
          <div
            className="absolute inset-x-0 bottom-0 rounded-full transition-[height] duration-700 ease-out"
            style={{
              height: `${pct}%`,
              background: `linear-gradient(to top, hsl(210 90% 55%), ${color})`,
            }}
          />
          <div
            className="absolute inset-x-[-4px] h-0.5 rounded-full bg-white/90 shadow"
            style={{ bottom: `calc(${pct}% - 1px)` }}
          />
        </div>
        <div
          className="-mt-1.5 h-7 w-7 rounded-full ring-4 ring-zinc-900/70"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

function Gauge({ reading }: { reading: Reading }) {
  return (
    <div className="flex items-center gap-5 rounded-xl border border-white/10 bg-black/20 p-4">
      <Thermometer value={reading.value} />
      <div className="min-w-0">
        <div className="truncate text-xs uppercase tracking-[0.18em] text-zinc-400">
          {reading.name}
        </div>
        <div className="mt-1 text-3xl font-semibold tabular-nums text-white">
          {formatTemp(reading.value)}
          <span className="ml-1 align-top text-base font-normal text-zinc-400">°C</span>
        </div>
        <div className="mt-1 text-xs text-zinc-500">{tempLabel(reading.value)}</div>
      </div>
    </div>
  );
}

export function DanubeTemperature() {
  const [readings, setReadings] = useState<Reading[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    fetch(FEED_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((xml) => {
        if (active) setReadings(parseFeed(xml));
      })
      .catch(() => {
        if (active) setError(true);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6">
      <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 shadow-sm ring-1 ring-white/5 backdrop-blur-md">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold text-white">
            Wassertemperatur <span className="text-zinc-400">· Donau Wien</span>
          </h2>
          <span className="text-xs text-zinc-500">
            Quelle: Hydrografie Wien (MA 45)
          </span>
        </div>

        {error ? (
          <p className="text-sm text-zinc-400">
            Live-Daten sind derzeit nicht verfügbar.
          </p>
        ) : readings === null ? (
          <p className="text-sm text-zinc-400">Wassertemperatur wird geladen…</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {readings.map((reading) => (
              <Gauge key={reading.name} reading={reading} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

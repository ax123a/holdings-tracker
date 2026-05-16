import { MockProvider } from "./mock";
import { Sec13FProvider } from "./sec13f";
import { SnapshotProvider } from "./snapshot";
import type { HoldingsProvider } from "./types";

let instance: HoldingsProvider | null = null;

export function getProvider(): HoldingsProvider {
  if (instance) return instance;
  const kind = (process.env.DATA_PROVIDER ?? "mock").toLowerCase();
  switch (kind) {
    case "sec13f":
      instance = new Sec13FProvider();
      break;
    case "snapshot":
      instance = new SnapshotProvider();
      break;
    case "mock":
    default:
      instance = new MockProvider();
      break;
  }
  return instance;
}

export type { HoldingsProvider } from "./types";

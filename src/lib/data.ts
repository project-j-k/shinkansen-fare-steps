import rawData from "../data/tokaido.json";
import type { Pair, TokaidoData } from "../types";

export const data = rawData as unknown as TokaidoData;

export const pairKey = (from: string, to: string): string => `${from}__${to}`;

export const pairMap = new Map<string, Pair>(
  data.pairs.flatMap((pair) => [
    [pairKey(pair.from, pair.to), pair],
    [pairKey(pair.to, pair.from), pair],
  ]),
);

export const getPair = (from: string, to: string): Pair | undefined => pairMap.get(pairKey(from, to));

export const findPair = (from: string, to: string): Pair => {
  const pair = getPair(from, to);
  if (!pair) {
    throw new Error(`Pair not found: ${from}-${to}`);
  }
  return pair;
};

import axios from "axios";
import * as cheerio from "cheerio";
import type { NextApiRequest, NextApiResponse } from "next";

async function fetchCryptoPunksStats() {
  const { data: html } = await axios.get("https://www.larvalabs.com/cryptopunks");
  const $ = cheerio.load(html);
  const [floorPrice, _, __, daySales] = $(".punk-stat")
    .map((_i, el) => {
      const splitted = $(el).text().trim().split("\n");
      const text = splitted[splitted.length - 1].trim();
      const [t] = text.split(/ETH|Ξ/);
      return t.endsWith("K") ? parseFloat(t) * 1000 : parseFloat(t);
    })
    .toArray();
  return {
    floor_price: floorPrice,
    one_day_volume: daySales,
  };
}

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const stats = await fetchCryptoPunksStats();
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  res.status(200).json(stats);
}

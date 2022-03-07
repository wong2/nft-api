import { abiERC721 } from "@metamask/metamask-eth-abis";
import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";

const IPFS_GATEWAY = "https://ipfs.io/ipfs/";

const provider = new ethers.providers.CloudflareProvider();

function normalizeUrl(url: string): string {
  return url.replace("ipfs://", IPFS_GATEWAY);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { contract_address, token_id } = req.query as {
    contract_address: string;
    token_id: string;
  };
  const contract = new ethers.Contract(contract_address, abiERC721, provider);
  const tokenURI = await contract.tokenURI(token_id);
  const metadata = await fetch(normalizeUrl(tokenURI)).then((r) => r.json());
  const { image, ...others } = metadata;
  const resp = {
    image: normalizeUrl(image),
    ...others,
  };
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  res.status(200).json(resp);
}

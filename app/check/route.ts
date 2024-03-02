import { NextResponse } from "next/server";
import { followingQuery, walletQuery, lastYoinkedQuery, fetchSubgraphData } from "../api";
import { init, fetchQuery } from "@airstack/node";
import { account, walletClient, publicClient } from "./config";
import ABI from "./abi.json";

const URL =
  process.env.ENVIRONMENT === "local"
    ? process.env.LOCALHOST
    : process.env.PROD_URL;

// USDC contract address on Base
const contractAddress = "0xcfA132E353cB4E398080B9700609bb008eceB125";
const USDCxAddress = "0xD04383398dD2426297da660F9CCA3d439AF9ce1b";

init(process.env.AIRSTACK_KEY || "");


const notFollowingString = `|


You are not following us !
Follow to get your Yoinked Stream


|
`;

const reyoinkedString = `|

You have to wait 2 hours to be able to yoink again !

|`;

function getImgUrl(myString: string) {
  const myStringEncoded = encodeURIComponent(myString);
  return `https://api.imgbun.com/jpg?key=${process.env.IMGBUN_KEY}&text=${myStringEncoded}&color=FF0000&size=40&background=000000&format=raw`;
}

const flowRate = 380517503805;
let address = "0x72343b915f335b2af76ca703cf7a550c8701d5cd";

const _html = (img, msg, action, url) => `
<!DOCTYPE html>
<html>
  <head>
    <title>Frame</title>
    <mega property="og:image" content="${img}" />
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${img}" />
    <meta property="fc:frame:image:aspect_ratio" content="1:1" />
    <meta property="fc:frame:button:1" content="${msg}" />
    <meta property="fc:frame:button:1:action" content="${action}" />
    <meta property="fc:frame:button:1:target" content="${url}" />
    <meta property="fc:frame:post_url" content="${url}" />
  </head>
</html>
`;

export async function POST(req) {
  const data = await req.json();

  const { untrustedData } = data;
  const { fid } = untrustedData;

  const _query = followingQuery(fid);
  const { data: results } = await fetchQuery(_query, {
    id: fid,
  });

  const _query2 = walletQuery(fid);
  const { data: results2 } = await fetchQuery(_query2, {
    id: fid,
  });

  const socials = results2.Socials.Social;
  const newAddress = socials[0].userAssociatedAddresses[1];

  if (!results.Wallet.socialFollowers.Follower) {
    return new NextResponse(
      _html(getImgUrl(notFollowingString), "Retry", "post", `${URL}`)
    );
  }

  const _query3 = lastYoinkedQuery(newAddress);
  const result3 = await fetchSubgraphData(_query3);
  const lastYoink=result3.data.account.outflows[0].updatedAtTimestamp;
  const now = Date.now();

  if (lastYoink+7200000>now) {
    return new NextResponse(
      _html(getImgUrl(reyoinkedString), "Retry", "post", `${URL}`)
    );
  }

  const { request: deleteStream } = await publicClient.simulateContract({
    address: contractAddress,
    abi: ABI,
    functionName: "setFlowrate",
    account,
    args: [USDCxAddress, address, 0],
  });
  await walletClient.writeContract(deleteStream);

  address = newAddress;
  const { request: startStream } = await publicClient.simulateContract({
    address: contractAddress,
    abi: ABI,
    functionName: "setFlowrate",
    account,
    args: [USDCxAddress, address, flowRate],
  });
  await walletClient.writeContract(startStream);

  alreadyClaimed.push(fid);

  return new NextResponse(
    _html(
      image,
      "See in Dashboard",
      "link",
      `https://app.superfluid.finance/?view=${address}`
    )
  );
}

export const dynamic = "force-dynamic";

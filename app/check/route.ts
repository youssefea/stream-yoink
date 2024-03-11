import { NextResponse } from "next/server";
import {
  followingQuery,
  walletQuery,
  lastYoinkedQuery,
  fetchSubgraphData,
  updateProfileData,
} from "../api";
import { init, fetchQuery } from "@airstack/node";
import { account, walletClient, publicClient } from "./config";
import ABI from "./abi.json";
import { kv } from "@vercel/kv";
import { assert } from "console";

const URL =
  process.env.ENVIRONMENT === "local"
    ? process.env.LOCALHOST
    : process.env.PROD_URL;

// USDC contract address on Base
const contractAddress = "0xcfA132E353cB4E398080B9700609bb008eceB125";
const USDCxAddress = "0xD6FAF98BeFA647403cc56bDB598690660D5257d2";

init(process.env.AIRSTACK_KEY || "");

const noConnectedString = `_StreamYoink__You don't have a connected wallet !__Connect a wallet to your farcaster account`;

const notFollowingString = `_@superfluid__Follow us__and start Yoinking!`;

const reyoinkedString = (userHandle) =>
  `_${userHandle}__You have to wait 2 hours__to be able to yoink again !`;

const congratsString = (userHandle) =>
  `_${userHandle}_Congrats!_you hold the yoink stream !`;

function getImgUrl(myString: string) {
  const myStringEncoded = encodeURIComponent(myString);
  return `${URL}/imgen?text=${myStringEncoded}&color=black,green,black,black,black&size=12,18`;
}

const flowRate = 380517503805;

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
  const userHandle =
    results.Wallet.socialFollowers.Follower[0].followerAddress.socials[0]
      .profileHandle;

  if (!newAddress) {
    return new NextResponse(
      _html(getImgUrl(noConnectedString), "Retry", "post", `${URL}`)
    );
  }

  const _query3 = lastYoinkedQuery(newAddress);
  const result3: any = await fetchSubgraphData(_query3);
  const lastYoink =
    result3.data.account.outflows[0] == null
      ? 0
      : result3.data.account.outflows[0].updatedAtTimestamp;
  const now = Math.round(Date.now() / 1000);

  if (Number(lastYoink) + 7200 > now) {
    return new NextResponse(
      _html(getImgUrl(reyoinkedString(userHandle)), "Retry", "post", `${URL}`)
    );
  }

  const fetchData = await fetch(`${URL}/currentYoinkerApi`);
  const fetchDataJson = await fetchData.json();
  const currentYoinkerAddress = fetchDataJson.address;
  console.log(currentYoinkerAddress);

  if (currentYoinkerAddress != null) {
    const receiverCurrentFlowRate = await publicClient.readContract({
      address: contractAddress,
      abi: ABI,
      functionName: "getFlowrate",
      args: [USDCxAddress, account.address, currentYoinkerAddress],
    });

    if (Number(receiverCurrentFlowRate) > 0) {
      const { request: deleteStream } = await publicClient.simulateContract({
        address: contractAddress,
        abi: ABI,
        functionName: "deleteFlow",
        account,
        args: [USDCxAddress, account.address, currentYoinkerAddress, "0x0"],
      });
      await walletClient.writeContract(deleteStream);
    }
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  await sleep(200);

  const { request: startStream } = await publicClient.simulateContract({
    address: contractAddress,
    abi: ABI,
    functionName: "setFlowrate",
    account,
    args: [USDCxAddress, newAddress, flowRate],
  });
  await walletClient.writeContract(startStream);

  await updateProfileData(userHandle, newAddress);

  return new NextResponse(
    _html(
      getImgUrl(congratsString(userHandle)),
      "See in Dashboard",
      "link",
      `https://app.superfluid.finance/?view=${newAddress}`
    )
  );
}

export const dynamic = "force-dynamic";

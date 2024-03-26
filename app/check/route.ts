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
import {URL} from "./../../constants"

// USDC contract address on Base
const contractAddress = "0xcfA132E353cB4E398080B9700609bb008eceB125";
const superTokenAddress = process.env.SUPER_TOKEN_ADDRESS as `0x${string}`;

init(process.env.AIRSTACK_KEY || "");

const noConnectedString = "https://i.imgur.com/GBYJbwP.png";

const reyoinkedString ="https://i.imgur.com/jfySrCh.png";

const flowRate = 327245050000000000;

const coolDown = 3600;

const _html = (img, msg, action, url) => `
<!DOCTYPE html>
<html>
  <head>
    <title>Frame</title>
    <mega property="og:image" content="${img}" />
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${img}" />
    <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
    <meta property="fc:frame:button:1" content="${msg}" />
    <meta property="fc:frame:button:1:action" content="${action}" />
    <meta property="fc:frame:button:1:target" content="${url}" />
    <meta property="fc:frame:button:2" content="🏆 Go to Leaderboard" />
    <meta property="fc:frame:button:2:action" content="link" />
    <meta property="fc:frame:button:2:target" content="${URL}/leaderboard" />
    <meta property="fc:frame:post_url" content="${url}" />
  </head>
</html>
`;

async function deleteFlow(_from, _to, _nonce){
  await walletClient.writeContract({
    address: contractAddress,
    abi: ABI,
    functionName: "deleteFlow",
    account,
    nonce: _nonce,
    args: [superTokenAddress, _from, _to, "0x0"],
  });
}

async function setFlowrate(_to, _nonce){
  await walletClient.writeContract({
    address: contractAddress,
    abi: ABI,
    functionName: "setFlowrate",
    account,
    nonce: _nonce,
    args: [superTokenAddress, _to, flowRate],
  });
}

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
      _html(noConnectedString, "🎩 Retry", "post", `${URL}`)
    );
  }

  const _query3 = lastYoinkedQuery(newAddress);
  const result3: any = await fetchSubgraphData(_query3);
  const lastYoink =
    result3.data.account.outflows[0] == null
      ? 0
      : result3.data.account.outflows[0].updatedAtTimestamp;
  const now = Math.floor(Date.now() / 1000);

  const fetchData = await fetch(`${URL}/currentYoinkerApi`);
  const fetchDataJson = await fetchData.json();
  const currentYoinkerAddress = fetchDataJson.address;

  if (currentYoinkerAddress.toLowerCase() != newAddress.toLowerCase()) {
    if (Number(lastYoink) + coolDown > now) {
      return new NextResponse(
        _html(
          reyoinkedString,
          "🎩 Retry",
          "post",
          `${URL}`
        )
      );
    }
    let nonce = await publicClient.getTransactionCount({  
      address: account.address,
    })

    if (currentYoinkerAddress != null) {
      const receiverCurrentFlowRate = await publicClient.readContract({
        address: contractAddress,
        abi: ABI,
        functionName: "getFlowrate",
        args: [superTokenAddress, account.address, currentYoinkerAddress],
      });

      if (Number(receiverCurrentFlowRate) > 0) {
        deleteFlow(account.address, currentYoinkerAddress, nonce);
        
        nonce++;
        //await walletClient.writeContract(deleteStream);
      }
    }
    setFlowrate(newAddress, nonce);
    const delay = ms => new Promise(res => setTimeout(res, ms));
    await delay(1000);
    //await walletClient.writeContract(startStream);
  } else if (currentYoinkerAddress.toLowerCase() == newAddress.toLowerCase()) {
    return new NextResponse(
      _html(
        "https://i.imgur.com/NZRglCI.gif",
        "See in Dashboard 🌊",
        "link",
        `https://app.superfluid.finance/?view=${newAddress}`
      )
    );
  }

  await updateProfileData(userHandle, newAddress);

  return new NextResponse(
    _html(
      "https://i.imgur.com/NZRglCI.gif",
      "See in Dashboard 🌊",
      "link",
      `https://app.superfluid.finance/?view=${newAddress}`
    )
  );
}

export const dynamic = "force-dynamic";

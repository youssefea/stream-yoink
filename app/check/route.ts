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
import ERC20ABI from "./erc20abi.json";
import { formatEther } from "viem";

const URL =
  process.env.ENVIRONMENT === "local"
    ? process.env.LOCALHOST
    : process.env.PROD_URL;

// USDC contract address on Base
const contractAddress = "0xcfA132E353cB4E398080B9700609bb008eceB125";
const USDCxAddress = process.env.SUPER_TOKEN_ADDRESS as `0x${string}`;

init(process.env.AIRSTACK_KEY || "");

const noConnectedString = `_StreamYoink!__You don't have a connected wallet !__Connect a wallet to your farcaster account`;

const reyoinkedString = (userHandle) =>
  `_Slow Down !_You are Yoinking too fast_You can Yoink the Stream_once every 30 mins !`;

function getImgUrl(myString: string) {
  const myStringEncoded = encodeURIComponent(myString);
  return `${URL}/imgen?text=${myStringEncoded}&color=black,superfluid,black,black,black&size=10,24,10,10,10,10`;
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
    <meta property="fc:frame:button:2" content="🏆 Go to Leaderboard" />
    <meta property="fc:frame:button:2:action" content="link" />
    <meta property="fc:frame:button:2:target" content="https://sf-frame-3.vercel.app/leaderboard" />
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
      _html(getImgUrl(noConnectedString), "Retry 🔁", "post", `${URL}`)
    );
  }

  const _query3 = lastYoinkedQuery(newAddress);
  const result3: any = await fetchSubgraphData(_query3);
  const lastYoink =
    result3.data.account.outflows[0] == null
      ? 0
      : result3.data.account.outflows[0].updatedAtTimestamp;
  const now = Math.floor(Date.now() / 1000);
  console.log(Number(lastYoink) + 7200, "now", now);

  const fetchData = await fetch(`${URL}/currentYoinkerApi`);
  const fetchDataJson = await fetchData.json();
  const currentYoinkerAddress = fetchDataJson.address;

  const receiverCurrentBalance: any = await publicClient.readContract({
    address: USDCxAddress,
    abi: ERC20ABI,
    functionName: "balanceOf",
    args: [newAddress],
  });

  if (currentYoinkerAddress.toLowerCase() != newAddress.toLowerCase()) {
    if (Number(lastYoink) + 10 > now) {
      return new NextResponse(
        _html(
          getImgUrl(reyoinkedString(userHandle)),
          "Retry 🔁",
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
        args: [USDCxAddress, account.address, currentYoinkerAddress],
      });

      if (Number(receiverCurrentFlowRate) > 0) {
        await walletClient.writeContract({
          address: contractAddress,
          abi: ABI,
          functionName: "deleteFlow",
          account,
          nonce: nonce,
          args: [USDCxAddress, account.address, currentYoinkerAddress, "0x0"],
        });
        nonce++;
        //await walletClient.writeContract(deleteStream);
      }
    }
    await walletClient.writeContract({
      address: contractAddress,
      abi: ABI,
      functionName: "setFlowrate",
      account,
      nonce: nonce,
      args: [USDCxAddress, newAddress, flowRate],
    });
    //await walletClient.writeContract(startStream);
  } else if (currentYoinkerAddress.toLowerCase() == newAddress.toLowerCase()) {
    return new NextResponse(
      _html(
        `${URL}/flowingBalance?user=${userHandle}&balance=${formatEther(
          receiverCurrentBalance
        ).toString()}&already=yes`,
        "See in Dashboard 🌊",
        "link",
        `https://app.superfluid.finance/?view=${newAddress}`
      )
    );
  }

  await updateProfileData(userHandle, newAddress);

  return new NextResponse(
    _html(
      `${URL}/flowingBalance?user=${userHandle}&balance=${formatEther(
        receiverCurrentBalance
      ).toString()}`,
      "See in Dashboard 🌊",
      "link",
      `https://app.superfluid.finance/?view=${newAddress}`
    )
  );
}

export const dynamic = "force-dynamic";

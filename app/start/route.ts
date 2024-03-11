import { NextResponse } from "next/server";
import {
  followingQuery,
  walletQuery,
  lastYoinkedQuery,
  fetchSubgraphData,
} from "../api";
import { init, fetchQuery } from "@airstack/node";
import { kv } from "@vercel/kv";

const URL =
  process.env.ENVIRONMENT === "local"
    ? process.env.LOCALHOST
    : process.env.PROD_URL;

init(process.env.AIRSTACK_KEY || "");

const notFollowingString = `_@superfluid__Follow us__and start Yoinking!`;

const welcomeString = (yoinker, totalYoinked) => `_${yoinker}_has the stream !_The stream has been Yoinked_${totalYoinked} times__You can Yoink your Stream below ↓`;

function getImgUrl(myString: string) {
  const myStringEncoded = encodeURIComponent(myString);
  return `${URL}/imgen?text=${myStringEncoded}&color=black,green,black,black,red,black,black,black,black&size=12,18,12,12,12`;
}

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
    <meta property="fc:frame:button:2" content="🏆 Go to Learderboard" />
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

  if (!results.Wallet.socialFollowers.Follower) {
    return new NextResponse(
      _html(getImgUrl(notFollowingString), "Retry", "post", `${URL}`)
    );
  }
  
  const fetchDataTotalStreams = await fetch(`${URL}/totalYoinked`);
  const fetchDataTotalStreamsJson=await fetchDataTotalStreams.json();
  const totalStreams=fetchDataTotalStreamsJson.totalScore;
  const fetchDataCurrentYoinker = await fetch(`${URL}/currentYoinkerApi`);
  const fetchDataCurrentYoinkerJson=await fetchDataCurrentYoinker.json();
  const currentYoinker=fetchDataCurrentYoinkerJson.profileHandle;

  return new NextResponse(
    _html(
      getImgUrl(welcomeString(currentYoinker,totalStreams)),
      "🔻 Yoink",
      "post",
      `${URL}/check`
    )
  );
}

export const dynamic = "force-dynamic";

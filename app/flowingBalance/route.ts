// pages/api/balance.ts
"use server";
import { unstable_noStore as noStore } from "next/cache";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const superfluidLogo = `<path fill-rule="evenodd" clip-rule="evenodd" d="M62.415 22.0661V14.4242H66.1397V22.37C66.1397 23.1611 66.3831 23.7953 66.8703 24.2736C67.3578 24.7517 67.9786 24.9911 68.7328 24.9911C69.4681 24.9911 70.0753 24.7469 70.5536 24.2597C71.0317 23.7725 71.2708 23.1422 71.2708 22.37V14.4242H74.9953V22.0661C74.9953 23.9422 74.4019 25.4692 73.2158 26.6458C72.0294 27.8233 70.5353 28.4117 68.7328 28.4117C66.8933 28.4117 65.3811 27.8278 64.1947 26.6594C63.0081 25.4917 62.415 23.9608 62.415 22.0661Z" fill="#12141E"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M87.3239 21.2664C87.3239 20.1447 86.9933 19.2344 86.3308 18.5347C85.6692 17.8367 84.8225 17.4869 83.7931 17.4869C82.8 17.4869 81.9764 17.8181 81.3239 18.48C80.6706 19.1422 80.3444 20.0617 80.3444 21.2389C80.3444 22.4161 80.6706 23.3403 81.3239 24.0108C81.9764 24.6831 82.8 25.0183 83.7931 25.0183C84.8042 25.0183 85.6458 24.6692 86.3172 23.9697C86.9886 23.2708 87.3239 22.37 87.3239 21.2664ZM89.2136 16.1489C90.4733 17.5006 91.1036 19.1972 91.1036 21.2389C91.1036 23.2803 90.4733 24.9861 89.2136 26.3564C87.9542 27.7264 86.3769 28.4117 84.4825 28.4117C82.7719 28.4117 81.4108 27.86 80.3994 26.7564V33.0461H76.6753V14.4242H80.0961V16.1353C81.0342 14.7925 82.4961 14.1211 84.4825 14.1211C86.3769 14.1211 87.9542 14.7967 89.2136 16.1489Z" fill="#12141E"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M96.2053 19.8867H102.413C102.394 19.0592 102.104 18.3925 101.543 17.8867C100.982 17.3811 100.288 17.1283 99.4606 17.1283C98.6697 17.1283 97.9797 17.3764 97.3914 17.8731C96.8025 18.3692 96.4072 19.0411 96.2053 19.8867ZM105.778 22.5075H96.2053C96.4258 23.3725 96.8711 24.0392 97.5431 24.5078C98.2139 24.9772 99.0467 25.2117 100.04 25.2117C101.382 25.2117 102.651 24.7517 103.847 23.8317L105.392 26.3703C103.755 27.7314 101.934 28.4117 99.9292 28.4117C97.8325 28.4481 96.0533 27.7631 94.5911 26.3564C93.1289 24.9489 92.4161 23.2525 92.4533 21.2664C92.4161 19.2983 93.1056 17.6064 94.5222 16.1903C95.9381 14.7739 97.63 14.0844 99.5986 14.1211C101.475 14.1211 103.015 14.7278 104.219 15.9419C105.424 17.1558 106.026 18.6639 106.026 20.4667C106.026 21.1281 105.943 21.8094 105.778 22.5075Z" fill="#12141E"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M116.036 14.4242V17.7075H115.043C113.902 17.7075 113.005 18.0111 112.353 18.6181C111.699 19.2247 111.374 20.1078 111.374 21.2664V28.0806H107.649V14.4242H111.07V16.0519C112.026 14.8569 113.277 14.2592 114.822 14.2592C115.282 14.2592 115.687 14.3142 116.036 14.4242Z" fill="#12141E"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M126.598 28.0806H130.322V7.05833H126.598V28.0806ZM124.819 7.05833V10.3967H123.922C123.058 10.3967 122.427 10.5622 122.032 10.8933C121.637 11.2239 121.439 11.7667 121.439 12.5208V14.4242H124.819V17.5694H121.439V28.0806H117.714V12.19C117.714 10.4981 118.174 9.22 119.094 8.355C120.013 7.49111 121.31 7.05833 122.984 7.05833H124.819Z" fill="#12141E"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M132.136 22.0661V14.4242H135.861V22.37C135.861 23.1611 136.104 23.7953 136.592 24.2736C137.079 24.7517 137.7 24.9911 138.454 24.9911C139.19 24.9911 139.797 24.7469 140.275 24.2597C140.753 23.7725 140.992 23.1422 140.992 22.37V14.4242H144.716V22.0661C144.716 23.9422 144.124 25.4692 142.937 26.6458C141.751 27.8233 140.256 28.4117 138.454 28.4117C136.615 28.4117 135.102 27.8278 133.916 26.6594C132.729 25.4917 132.136 23.9608 132.136 22.0661Z" fill="#12141E"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M146.531 28.0806H150.256V14.4242H146.531V28.0806Z" fill="#12141E"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M162.019 24.0247C162.671 23.3628 162.998 22.4436 162.998 21.2664C162.998 20.0892 162.667 19.165 162.005 18.4936C161.342 17.8222 160.524 17.4869 159.549 17.4869C158.537 17.4869 157.696 17.8367 157.025 18.5347C156.353 19.2344 156.018 20.1353 156.018 21.2389C156.018 22.3611 156.349 23.2708 157.011 23.9697C157.673 24.6692 158.519 25.0183 159.549 25.0183C160.543 25.0183 161.365 24.6872 162.019 24.0247ZM162.943 7.05833H166.667V28.0806H163.246V26.3975C162.308 27.7403 160.846 28.4117 158.86 28.4117C156.946 28.4117 155.365 27.7356 154.115 26.3839C152.863 25.0322 152.239 23.3264 152.239 21.2664C152.239 19.2067 152.863 17.5006 154.115 16.1489C155.365 14.7967 156.946 14.1211 158.86 14.1211C160.588 14.1211 161.949 14.6639 162.943 15.7489V7.05833Z" fill="#12141E"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M56.5892 17.6244L54.52 16.7144C53.7106 16.3469 53.1544 16.0203 52.8511 15.7344C52.5478 15.45 52.3958 15.0775 52.3958 14.6178C52.3958 14.5494 52.4089 14.4889 52.4156 14.4242H48.6294C48.6253 14.5164 48.6164 14.6061 48.6164 14.7003C48.6164 16.8892 50.0875 18.6364 53.0306 19.9422L54.9889 20.8247C55.9086 21.2483 56.5244 21.6022 56.8375 21.8869C57.1503 22.1719 57.3067 22.5728 57.3067 23.0867C57.3067 23.7128 57.0764 24.2042 56.6169 24.5631C56.1569 24.9217 55.5222 25.1008 54.7133 25.1008C53.0208 25.1008 51.5311 24.2178 50.2439 22.4525L47.6783 24.3833C48.3956 25.6347 49.3656 26.6181 50.5889 27.3356C51.8117 28.0531 53.1867 28.4117 54.7133 28.4117C56.5706 28.4117 58.0972 27.9106 59.2928 26.9081C60.4881 25.9056 61.0861 24.5861 61.0861 22.9492C61.0861 21.735 60.7272 20.7194 60.0103 19.9008C59.2928 19.0825 58.1522 18.3239 56.5892 17.6244Z" fill="#12141E"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M61.0861 9.00555H55.6675V11.715H58.3769V14.4242H61.0861V9.00555Z" fill="#12141E"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M150.256 14.4242H154.361V10.3183H150.256V14.4242Z" fill="#12141E"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M30.6978 23.5061H23.4586V16.2669H16.2192V9.0275H30.6978V23.5061ZM8.98 30.7453H16.2192V23.5061H8.98V30.7453ZM0 4.38417V35.3892C0 37.7839 1.94139 39.7256 4.33639 39.7256H35.3414C37.7364 39.7256 39.6778 37.7839 39.6778 35.3892V4.38417C39.6778 1.98917 37.7364 0.0477791 35.3414 0.0477791H4.33639C1.94139 0.0477791 0 1.98917 0 4.38417Z" fill="#12141E"/>
`;

function generateSVG(
  userName: string,
  initialBalance: number,
  already: string
) {
  const increments = 10000; // Define the number of increments shown.
  const stepValue = 0.0016;
  const duration = 0.05;
  const fontSize = 8; // Font size for the balance

  let texts = "";
  for (let i = 0; i < increments; i++) {
    const balance = initialBalance + stepValue * i;
    const balanceStr = balance.toFixed(4); // Keep 7 decimal places
    texts += `
            <text x="50%" y="80%" fill="black" font-size="${fontSize}px" font-family="Arial" text-anchor="middle" visibility="hidden">
                ${balanceStr}
                <set attributeName="visibility" to="visible" begin="${
                  i * duration
                }s" dur="${duration}s" repeatCount="indefinite"/>
                <set attributeName="visibility" to="hidden" begin="${
                  (i + 1) * duration
                }s" dur="${duration}s" repeatCount="indefinite"/>
                🎩 $DEGEN
            </text>
        `;
  }
  const alreadyTxt =
    already == "yes"
      ? `You already had the stream 🌊`
      : "You have the stream 🌊";

  return `
        <svg width="191" height="100" viewBox="0 0 191 100" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="white"/>
            <text x="50%" y="40" fill="#1DB227" font-size="24px" font-family="Arial" text-anchor="middle">
                ${userName}
            </text>
            <text x="50%" y="55" fill="black" font-size="8px" font-family="Arial" text-anchor="middle">
                ${alreadyTxt}
            </text>
            <text x="50%" y="70" fill="black" font-size="8px" font-family="Arial" text-anchor="middle">
                Your balance:
            </text>
            ${texts}

            <g transform="translate(70, 85) scale(0.35)">
            ${superfluidLogo}
            </g>
            
        </svg>
    `;
}

export async function GET(request: NextRequest) {
  noStore();

  const searchParams = new URL(request.url).searchParams;
  const userName = searchParams.get("user") || "User";
  const initialBalanceParam = searchParams.get("balance");
  const initialBalance = parseFloat(initialBalanceParam || "0.0000001");
  const already = searchParams.get("already") || "no";

  if (isNaN(initialBalance)) {
    return new NextResponse("Invalid initial balance", { status: 400 });
  }

  const svgContent = generateSVG(userName, initialBalance, already);
  return new NextResponse(svgContent, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "s-maxage=1, stale-while-revalidate",
    },
  });
}

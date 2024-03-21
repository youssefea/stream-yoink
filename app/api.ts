import { account} from "./check/config";
import fetch from 'node-fetch';

const URL =
  process.env.ENVIRONMENT === "local"
    ? process.env.LOCALHOST
    : process.env.PROD_URL;

export const followingQuery = (id) => `
query isFollowing {
  Wallet(input: {identity: "fc_fid:${id}", blockchain: ethereum}) {
    socialFollowers(input: {filter: {identity: {_in: ["fc_fid:315653"]}}}) {
      Follower {
        dappName
        dappSlug
        followingProfileId
        followerProfileId
        followerAddress {
          socials {
            profileHandle
            profileName
            dappName
          }
        }
      }
    }
  }
}
`;



export const walletQuery = (id) => `
query GetAddressesOfFarcasters {
  Socials(input: {filter: {userId: {_eq: "${id}"}}, blockchain: ethereum}) {
    Social {
      userAssociatedAddresses
    }
  }
}
`;

export const profileQuery = (id) => `
query GetAddressesOfFarcasters {
  Socials(input: {filter: {profileName: {_eq: "${id}"}}, blockchain: ethereum}) {
    Social {
      userAssociatedAddresses
    }
  }
}
`;

export const lastYoinkedQuery = (receiverAddress) => `
query GetLastYoinked {
  account(id: "${account.address.toLowerCase()}") {
    outflows(
      where: {receiver: "${receiverAddress.toLowerCase()}", token_contains_nocase: "0x1efF3Dd78F4A14aBfa9Fa66579bD3Ce9E1B30529"}
      orderBy: updatedAtTimestamp
      orderDirection: desc
    ) {
      updatedAtTimestamp
      token {
        id
      }
    }
  }
}
`;

export const totalStreamedQuery = (receiverAddress) => `
query totalStreamed {
  accountTokenSnapshots(where: {account: "${account.address.toLowerCase()}"}) {
    account {
      outflows(where: {receiver: "${receiverAddress.toLowerCase()}"}) {
        streamedUntilUpdatedAt
      }
    }
  }
}
`

// Function to perform the POST request and handle the response
export async function fetchSubgraphData(myQuery) {
  const requestData = {
    query: myQuery,
  };

  try {
    const response = await fetch("https://base-mainnet.subgraph.x.superfluid.dev/", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    return data;

  } catch (error) {
    console.error('There was a problem with your fetch operation:', error);
    throw error; // Rethrow or handle as needed
  }
}


// sender.ts - Example of sending data from another TypeScript file
// Use this line if you're in Node.js and have installed node-fetch

export async function updateProfileData(profileHandle: string, address: string) {
  const url = `${URL}/currentYoinkerPost`; // Replace with your actual API endpoint
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ profileHandle, address }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    console.log('Success:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

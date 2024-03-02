import { account} from "./check/config";

export const followingQuery = (id) => `
query isFollowing {
  Wallet(input: {identity: "fc_fid:${id}", blockchain: ethereum}) {
    socialFollowers(
      input: {filter: {identity: {_in: ["fc_fid:289345"]}}}
    ) {
      Follower {
        dappName
        dappSlug
        followingProfileId
        followerProfileId
        followingAddress {
          addresses
          socials {
            dappName
            profileName
          }
          domains {
            name
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

export const lastYoinkedQuery = (receiverAddress) => `
query GetLastYoinked {
  account(id: "${account}") {
    outflows(
      where: {receiver: "${receiverAddress}", token_contains_nocase: "0x42bb40bF79730451B11f6De1CbA222F17b87Afd7"}
    ) {
      updatedAtTimestamp
      token {
        id
      }
    }
  }
}
`;

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

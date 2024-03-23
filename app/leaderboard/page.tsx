"use client"
import { useEffect, useState } from "react";

type LeaderboardEntry = {
  userHandle: string;
  score: number;
  totalStreamed: number; // Adding the new property for total $DEGEN streamed
};

type CurrentYoinker = {
  profileHandle: string;
};

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentYoinker, setCurrentYoinker] = useState<CurrentYoinker | null>(null);
  const [isLoading, setIsLoading] = useState(true); // New state for tracking loading status

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true); // Start loading

        // Fetch leaderboard data
        const leaderboardResponse = await fetch("/leaderboardApi");
        const leaderboardData = await leaderboardResponse.json();

        // Parse and sort leaderboard data based on totalStreamed
        const sortedLeaderboardData = leaderboardData.sort(
          (a, b) => b.totalStreamed - a.totalStreamed
        );

        // Update state with sorted data
        setLeaderboard(sortedLeaderboardData);

        // Fetch current yoinker data
        const currentYoinkerResponse = await fetch("/currentYoinkerApi");
        const currentYoinkerData: CurrentYoinker = await currentYoinkerResponse.json();
        setCurrentYoinker(currentYoinkerData);

        setIsLoading(false); // End loading
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setIsLoading(false); // Ensure loading is false in case of error
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Hang on a few seconds fellow StreamYoinker, the Leaderboard is loading...
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <a
        href="https://warpcast.com/superfluid"
        style={{ textDecoration: "none" }}
      >
        <h1
          style={{ color: "#1DB227", fontSize: "3em", marginBottom: "0.5em" }}
        >
          StreamYoink!
        </h1>
      </a>
      <p style={{ textAlign: "center", lineHeight: "1.5" }}>
        A game-in-a-frame made by the{" "}
        <a
          href="https://warpcast.com/superfluid"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#007bff", textDecoration: "none" }}
        >
          Superfluid
        </a>{" "}
        team.
        <br />
        Play{" "}
        <a
          href="https://warpcast.com/superfluid"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#007bff", textDecoration: "none" }}
        >
          StreamYoink
        </a>{" "}
        now and start earning 🎩$DEGEN every second.
      </p>
      {currentYoinker && (
        <div style={{ marginBottom: "20px" }}>
          <strong>Current Yoinker:</strong>{" "}
          <a
            href={`https://warpcast.com/${currentYoinker.profileHandle}`}
            style={{ color: "#007bff", textDecoration: "none" }}
          >
            @{currentYoinker.profileHandle}
          </a>
        </div>
      )}
      <table
        style={{
          borderCollapse: "collapse",
          width: "80%",
          maxWidth: "600px",
          borderColor: "white",
        }}
      >
        <thead style={{ backgroundColor: "white", color: "black" }}>
          <tr>
            <th
              style={{
                border: "1px solid white",
                textAlign: "center",
                padding: "8px",
              }}
            >
              Rank
            </th>
            <th
              style={{
                border: "1px solid white",
                textAlign: "center",
                padding: "8px",
              }}
            >
              User Handle
            </th>
            <th
              style={{
                border: "1px solid white",
                textAlign: "center",
                padding: "8px",
              }}
            >
              StreamYoinks
            </th>
            <th
              style={{
                border: "1px solid white",
                textAlign: "center",
                padding: "8px",
              }}
            >
              Total $DEGEN Streamed
            </th>{" "}
            {/* New column for total $DEGEN streamed */}
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry, index) => (
            <tr key={index}>
              <td
                style={{
                  border: "1px solid white",
                  textAlign: "center",
                  padding: "8px",
                }}
              >
                {index + 1}
              </td>
              <td
                style={{
                  border: "1px solid white",
                  textAlign: "center",
                  padding: "8px",
                }}
              >
                <a
                  href={`https://warpcast.com/${entry.userHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#007bff", textDecoration: "none" }}
                >
                  {entry.userHandle}
                </a>
              </td>
              <td
                style={{
                  border: "1px solid white",
                  textAlign: "center",
                  padding: "8px",
                }}
              >
                {entry.score}
              </td>
              <td
                style={{
                  border: "1px solid white",
                  textAlign: "center",
                  padding: "8px",
                }}
              >
                {entry.totalStreamed}
              </td>{" "}
              {/* Display total $DEGEN streamed */}
            </tr>
          ))}
        </tbody>
      </table>
      <br />
      <div>
        <p style={{ textAlign: "center", lineHeight: "1.5" }}>
          <a
            href="https://github.com/youssefea/stream-yoink"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#007bff", textDecoration: "none" }}
          >
            📖 Github Repo Link
          </a>
        </p>
        <p>
          Inspired by{" "}
          <a
            href="https://warpcast.com/~/channel/yoink"
            target="_blank"
            rel="noopener noreferrer"
          >
            Yoink!
          </a>{" "}
          (
          <a
            href="https://warpcast.com/horsefacts.eth"
            target="_blank"
            rel="noopener noreferrer"
          >
            @horsefacts.eth
          </a>
          ) and made by{" "}
          <a
            href="https://warpcast.com/youssea"
            target="_blank"
            rel="noopener noreferrer"
          >
            @youssea
          </a>
        </p>
      </div>
    </div>
  );
}

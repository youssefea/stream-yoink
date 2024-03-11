'use client';
import { useEffect, useState } from 'react';

type LeaderboardEntry = {
  userHandle: string;
  score: number;
};

type CurrentYoinker = {
  profileHandle: string;
};

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentYoinker, setCurrentYoinker] = useState<CurrentYoinker | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch leaderboard data
        const leaderboardResponse = await fetch('/leaderboardApi');
        const leaderboardData: (string | number)[] = await leaderboardResponse.json();
        
        const parsedLeaderboardData: LeaderboardEntry[] = [];
        for (let i = 0; i < leaderboardData.length; i += 2) {
          parsedLeaderboardData.push({
            userHandle: leaderboardData[i] as string,
            score: leaderboardData[i + 1] as number,
          });
        }
        // Reverse the array to correct the ranking order
        setLeaderboard(parsedLeaderboardData.reverse());
  
        // Fetch current yoinker data
        const currentYoinkerResponse = await fetch('/currentYoinkerApi');
        const currentYoinkerData: CurrentYoinker = await currentYoinkerResponse.json();
        setCurrentYoinker(currentYoinkerData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
  
    fetchData();
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
      <h1>Leaderboard</h1>
      {currentYoinker && (
        <div style={{ marginBottom: '20px' }}>
          <strong>Current Yoinker:</strong> {currentYoinker.profileHandle}
        </div>
      )}
      <table style={{ borderCollapse: 'collapse', width: '80%', maxWidth: '600px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', textAlign: 'center', padding: '8px' }}>Rank</th>
            <th style={{ border: '1px solid black', textAlign: 'center', padding: '8px' }}>User Handle</th>
            <th style={{ border: '1px solid black', textAlign: 'center', padding: '8px' }}>Score</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid black', textAlign: 'center', padding: '8px' }}>{index + 1}</td>
              <td style={{ border: '1px solid black', textAlign: 'center', padding: '8px' }}>{entry.userHandle}</td>
              <td style={{ border: '1px solid black', textAlign: 'center', padding: '8px' }}>{entry.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

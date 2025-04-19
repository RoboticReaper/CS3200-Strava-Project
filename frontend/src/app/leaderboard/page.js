"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation"; // Import useSearchParams

function getUserFromID(user_id) {
  return fetch(`http://localhost:4000/users/${user_id}`)
    .then((res) => res.json())
    .then((data) => data[0]);
}

export default function Leaderboard() {
  const [data, setData] = useState([]);
  // No longer need userNames state separately if we embed it in data
  // const [userNames, setUserNames] = useState({});
  const searchParams = useSearchParams(); // Get search params
  const userId = searchParams.get("userid") || null; // Get current logged-in user ID

  useEffect(() => {
    fetch("http://localhost:4000/leaderboard")
      .then((res) => res.json())
      .then(async (leaderboardEntries) => {
        // Fetch details for all users on the initial leaderboard
        const users = await Promise.all(
          leaderboardEntries.map((u) => getUserFromID(u.user_id))
        );

        // Create a map for quick lookup of user details by ID
        const userDetailsMap = {};
        users.forEach(user => {
          if (user) { // Ensure user data was fetched successfully
            userDetailsMap[user.id] = user;
          }
        });

        // Filter leaderboard entries to exclude hidden profiles
        const filteredEntries = leaderboardEntries.filter(entry => {
          const user = userDetailsMap[entry.user_id];
          // Keep if user exists and profile is not hidden
          return user && !user.profile_hidden;
        });

        // Map filtered data and assign new ranks
        const finalLeaderboardData = filteredEntries.map((u, i) => {
           const user = userDetailsMap[u.user_id];
           return {
                rank: i + 1, // Recalculate rank based on filtered list
                user_id: u.user_id,
                name: `${user.first_name} ${user.last_name}`,
                dist: u.total_distance,
                time: u.total_time,
           };
        });

        setData(finalLeaderboardData);
        // setUserNames is no longer needed as name is in finalLeaderboardData
      })
      .catch((err) => console.error("Error fetching leaderboard:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-light">
      <main className="pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold mb-2">Leaderboard</h1>
              <p className="text-gray-medium">
                See how you stack up against other athletes
              </p>
            </div>
          </div>
          <div className="strava-card">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="w-16">Rank</th>
                  <th>Athlete</th>
                  <th className="text-right">Distance</th>
                  <th className="text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {data.map((u) => ( // Use the filtered and re-ranked data directly
                  <tr key={u.rank} className="hover:bg-gray-light">
                    <td className="font-medium">
                      {u.rank}
                    </td>
                    <td>
                      {/* Link remains the same, using u.user_id and u.name */}
                      <Link href={`/profile?viewUserId=${u.user_id}&userid=${userId}`} className="hover:text-strava-orange">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-light rounded-full flex items-center justify-center">
                            👤
                          </div>
                          <div>
                            <div className="font-medium">{u.name}</div>
                            <div className="text-sm text-gray-medium">
                              Local Legend
                            </div>
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="text-left font-medium">{u.dist} km</td>
                    <td className="text-left font-medium">{u.time} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

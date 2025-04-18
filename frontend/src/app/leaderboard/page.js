"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function getUserFromID(user_id) {
  return fetch(`http://localhost:4000/users/${user_id}`)
    .then((res) => res.json())
    .then((data) => data[0]);
}

export default function Leaderboard() {
  const [data, setData] = useState([]);
  const [userNames, setUserNames] = useState({});

  useEffect(() => {
    fetch("http://localhost:4000/leaderboard")
      .then((res) => res.json())
      .then(async (data) => {
        const users = await Promise.all(
          data.map((u) => getUserFromID(u.user_id))
        );

        const userMap = {};
        data.forEach((u, i) => {
          const user = users[i];
          userMap[u.user_id] = `${user.first_name} ${user.last_name}`;
        });

        const leaderboardData = data.map((u, i) => ({
          rank: u.rank,
          name: userMap[u.user_id],
          dist: u.total_distance,
          time: u.total_time,
        }));

        setData(leaderboardData);
        setUserNames(userMap);
      })
      .catch((err) => console.error("Error fetching leaderboard:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-light">
      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold mb-2">Leaderboard</h1>
              <p className="text-gray-medium">
                See how you stack up against other athletes
              </p>
            </div>
            <div className="flex gap-4">
              <select className="px-4 py-2 border rounded-md bg-white">
                <option>This Week</option>
                <option>This Month</option>
                <option>This Year</option>
                <option>All Time</option>
              </select>
              <select className="px-4 py-2 border rounded-md bg-white">
                <option>Running</option>
                <option>Cycling</option>
                <option>Swimming</option>
              </select>
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
                {data.map((u) => (
                  <tr key={u.rank} className="hover:bg-gray-light">
                    <td className="font-medium">
                      {u.rank <= 3 ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-strava-orange text-white">
                          {u.rank}
                        </span>
                      ) : (
                        u.rank
                      )}
                    </td>
                    <td>
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
                    </td>
                    <td className="text-right font-medium">{u.dist} km</td>
                    <td className="text-right font-medium">{u.time} min</td>
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

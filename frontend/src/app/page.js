"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function getUserFromID(user_id) {
  return fetch(`http://localhost:4000/users/${user_id}`)
    .then((res) => res.json())
    .then((data) => data[0]);
}

export default function Home() {
  const [userNames, setUserNames] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [runs, setRuns] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const searchParams = useSearchParams();
  const userId = searchParams.get("userid") || null;

  useEffect(() => {
    if (userId) {
      getUserFromID(userId).then((user) => setCurrentUser(user));
    }

    fetch("http://localhost:4000/leaderboard")
      .then((res) => res.json())
      .then(async (data) => {
        setLeaderboard(data);

        const users = await Promise.all(
          data.map((u) => getUserFromID(u.user_id))
        );

        const userMap = {};
        data.forEach((u, i) => {
          const user = users[i];
          userMap[u.user_id] = `${user.first_name} ${user.last_name}`;
        });

        setUserNames(userMap);
      })
      .catch((err) => console.error("Error fetching leaderboard:", err));

    fetch("http://localhost:4000/runs/1")
      .then((res) => res.json())
      .then((data) => setRuns(data))
      .catch((err) => console.error("Error fetching runs:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-light">
      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-value">{runs.length}</div>
              <div className="stat-label">Total Activities</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {runs
                  .reduce((acc, run) => acc + parseFloat(run.distance), 0)
                  .toFixed(1)}
              </div>
              <div className="stat-label">Total Distance (km)</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {runs.reduce((acc, run) => acc + parseInt(run.calories), 0)}
              </div>
              <div className="stat-label">Total Calories</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <section className="strava-card">
              <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
              <ul className="space-y-4">
                {runs.slice(0, 5).map((r, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between border-b last:border-0 pb-3"
                  >
                    <div>
                      <div className="font-medium">{r.user_id}</div>
                      <div className="text-sm text-gray-medium">
                        {r.distance} km • {r.time} • {r.avg_pace} min/km
                      </div>
                    </div>
                    <Link
                      href={`/map?id=${r.id}`}
                      className="text-accent-blue hover:underline"
                    >
                      View Map
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
            <section className="strava-card">
              <h2 className="text-xl font-semibold mb-4">Leaderboard</h2>
              <div className="overflow-hidden">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Athlete</th>
                      <th>Distance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.slice(0, 5).map((u) => (
                      <tr key={u.rank} className="hover:bg-gray-light">
                        <td className="font-medium">{u.rank}</td>
                        <td>{userNames[u.user_id] || "Loading..."}</td>
                        <td>{u.total_distance} km</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

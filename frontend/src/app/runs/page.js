"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function getUserFromID(user_id) {
  return fetch(`http://localhost:4000/users/${user_id}`)
    .then((res) => res.json())
    .then((data) => data[0]);
}

export default function RunsPage() {
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/runs/1")
      .then((res) => res.json())
      .then(async (data) => {
        const enrichedRuns = await Promise.all(
          data.map(async (run) => {
            const user = await getUserFromID(run.user_id);
            return {
              ...run,
              user_name: `${user.first_name} ${user.last_name}`,
            };
          })
        );
        setRuns(enrichedRuns);
      })
      .catch((err) => console.error("Error fetching runs:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-light">
      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Training Log</h1>
            <button className="btn-strava">Record Activity</button>
          </div>
          <div className="stats-container mb-8">
            <div className="stat-card">
              <div className="stat-value">{runs.length}</div>
              <div className="stat-label">Activities</div>
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
            <div className="stat-card">
              <div className="stat-value">
                {(
                  runs.reduce((acc, run) => acc + parseFloat(run.time), 0) /
                    runs.length || 0
                ).toFixed(0)}
              </div>
              <div className="stat-label">Avg Time (min)</div>
            </div>
          </div>
          <div className="space-y-4">
            {runs.map((run, index) => (
              <div key={index} className="strava-card hover:cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gray-light rounded-full flex items-center justify-center">
                        🏃‍♂️
                      </div>
                      <div>
                        <h3 className="font-semibold">{run.user_name}</h3>
                        <p className="text-sm text-gray-medium">Morning Run</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-8 mt-4">
                      <div>
                        <div className="text-sm text-gray-medium">Distance</div>
                        <div className="font-semibold">{run.distance} km</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-medium">Time</div>
                        <div className="font-semibold">{run.time} min</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-medium">Pace</div>
                        <div className="font-semibold">{run.avg_pace} /km</div>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/map?id=${run.id}`}
                    className="text-accent-blue hover:underline text-sm"
                  >
                    View Map
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

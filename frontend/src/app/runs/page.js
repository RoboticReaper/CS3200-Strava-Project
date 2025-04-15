'use client';

import { useEffect, useState } from "react";

function getUserFromID(user_id) {
  return fetch(`http://localhost:4000/users/${user_id}`)
    .then(res => res.json())
    .then(data => data[0]);
}

export default function RunsPage() {
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/runs/1")
      .then(res => res.json())
      .then(async (data) => {
        const enrichedRuns = await Promise.all(
          data.map(async (run) => {
            const user = await getUserFromID(run.user_id);
            return {
              ...run,
              user_name: `${user.first_name} ${user.last_name}`
            };
          })
        );
        setRuns(enrichedRuns);
      })
      .catch(err => console.error("Error fetching runs:", err));
  }, []);

  return (
    <main className="max-w-lg mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Recent Runs</h1>
      <ul>
        {runs.map(run => (
          <li key={run.id} className="mb-2">
            <div>
              <b>{run.user_name}</b>: {run.distance} km at {run.time} | {run.calories} cal
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

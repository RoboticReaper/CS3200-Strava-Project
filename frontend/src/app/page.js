'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import Button from '@mui/material/Button';

function getUserFromID(user_id){
  return fetch(`http://localhost:4000/users/${user_id}`).then(res => res.json()).then(data => data[0]);
}

export default function Home() {
  const [userNames, setUserNames] = useState({});

  const [leaderboard, setLeaderboard] = useState([]);
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/leaderboard")
    .then(res => res.json())
    .then(async (data) => {
      setLeaderboard(data);
  
      const users = await Promise.all(
        data.map(u => getUserFromID(u.user_id))
      );
  
      const userMap = {};
      data.forEach((u, i) => {
        const user = users[i];
        console.log(user);
        userMap[u.user_id] = `${user.first_name} ${user.last_name}`;
      });
  
      setUserNames(userMap);
    }).catch(err => console.error("Error fetching leaderboard:", err));  
    fetch("http://localhost:4000/runs/1")
      .then(res => res.json())
      .then(data => setRuns(data))
      .catch(err => console.error("Error fetching runs:", err));
  }, []);


  return (
    <main className="max-w-xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-2 text-center">🏃‍♂️ Welcome to RunCrew!</h1>
      
      <div className="flex flex-col gap-4">
        <Link href="/runs" className="underline font-semibold">See recent runs →</Link>
        <Link href="/feed" className="underline font-semibold">Go to Feed →</Link>
        <Link href="/leaderboard" className="underline font-semibold">View Leaderboard →</Link>
      </div>

      <Button>Test</Button>

      <section>
        <h2 className="font-bold mb-2">🏅 Leaderboard (Top 3)</h2>
        <ul>
          {leaderboard.slice(0, 3).map(u => (
            <li key={u.rank}>
      {u.rank}. {userNames[u.user_id] || 'Loading...'} – {u.total_distance} km</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-bold mb-2">🔥 Recent Runs</h2>
        <ul>
          {runs.slice(0, 3).map((r, i) => (
            <li key={i}>
              {r.user_id}: {r.distance} km at {r.time} (avg pace: {r.avg_pace} min/km)
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

'use client';

import { useEffect, useState } from "react";

function getUserFromID(user_id) {
    return fetch(`http://localhost:4000/users/${user_id}`)
        .then(res => res.json())
        .then(data => data[0]);
}

  export default function Leaderboard() {
    const [data, setData] = useState([]);
    const [userNames, setUserNames] = useState({});

    useEffect(() => {
        fetch("http://localhost:4000/leaderboard")
            .then(res => res.json())
            .then(async (data) => {
            const users = await Promise.all(
                data.map(u => getUserFromID(u.user_id))
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
                time: u.total_time
            }));
    
            setData(leaderboardData);
            setUserNames(userMap);
            }).catch(err => console.error("Error fetching leaderboard:", err));
        }, []);
    return (
      <main className="max-w-lg mx-auto p-8">
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <table className="w-full mt-4">
          <thead>
            <tr><th>Rank</th><th>Name</th><th>Distance</th><th>Time (min)</th></tr>
          </thead>
          <tbody>
            {data.map(u =>
              <tr key={u.rank} className="">
                <td>{u.rank}</td>
                <td>{u.name}</td>
                <td>{u.dist} km</td>
                <td>{u.time}</td>
              </tr>
            )}
          </tbody>
        </table>
      </main>
    );
  }
'use client';

import { useEffect, useState } from "react";
function getUserFromID(user_id) {
    return fetch(`http://localhost:4000/users/${user_id}`)
        .then(res => res.json())
        .then(data => data[0]);
}
  export default function Groups() {
    const [groups, setGroups] = useState([]);
    const [userNames, setUserNames] = useState({});

    useEffect(() => {
        fetch("http://localhost:4000/groups")
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
    
                const groupsData = data.map((g, i) => ({
                    id: g.id,
                    name: g.name,
                    desc: g.desc,
                    user_name: userMap[g.user_id]
                }));
    
                setGroups(groupsData);
                setUserNames(userMap);
            }).catch(err => console.error("Error fetching groups:", err));
        }
    , []);
    return (
      <main className="max-w-lg mx-auto p-8">
        <h1 className="text-2xl font-bold">Running Groups</h1>
        <ul className="mt-4">
          {groups.map(g =>
            <li key={g.id} className="mb-3">
              <div className="font-semibold">{g.name}</div>
              <div className="text-gray-600">{g.desc}</div>
            </li>
          )}
        </ul>
      </main>
    );
  }
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
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:4000/groups")
      .then(res => res.json())
      .then(async (initialGroups) => {
        // Fetch members for each group
        const memberPromises = initialGroups.map(group =>
          fetch(`http://localhost:4000/groups/${group.id}/members`) // Removed trailing slash if not needed
            .then(res => res.json())
            .then(memberData => {
              // Assuming memberData is like [{"user_id": 1}, {"user_id": 5}]
              // Extract the actual user_ids
              const memberIds = Array.isArray(memberData) ? memberData.map(item => item.user_id) : [];
              return { ...group, members: memberIds }; // Add flattened member IDs to group object
            })
            .catch(err => {
              console.error(`Error fetching members for group ${group.id}:`, err);
              return { ...group, members: [] }; // Handle error, return group with empty members
            })
        );

        const groupsWithMembers = await Promise.all(memberPromises);

        // Collect all unique user IDs
        const allMemberIds = new Set();
        groupsWithMembers.forEach(group => {
          // Ensure group.members is an array before iterating
          if (Array.isArray(group.members)) {
            group.members.forEach(id => {
              if (id !== undefined && id !== null) { // Add check for valid id
                 allMemberIds.add(id);
              }
            });
          }
        });

        // Fetch names for all unique user IDs
        const uniqueMemberIds = Array.from(allMemberIds);
        const namePromises = uniqueMemberIds.map(id => getUserFromID(id));
        const users = await Promise.all(namePromises);

        // Create a map of user ID to name
        const namesMap = {};
        users.forEach(user => {
          if (user) { // Check if user data was successfully fetched
            namesMap[user.id] = `${user.first_name} ${user.last_name}`;
          }
        });

        setUserNames(namesMap);
        setGroups(groupsWithMembers); // Update groups state with member IDs included
        setLoading(false); // Set loading to false

      }).catch(err => {
        console.error("Error fetching groups:", err);
        setLoading(false); // Set loading to false even on error
      });
  }
    , []);

  if (loading) {
    return <main className="max-w-lg mx-auto p-8"><p>Loading groups...</p></main>;
  }

  return (
    <main className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Running Groups</h1>
      {groups.length === 0 && !loading ? (
        <p>No groups found.</p>
      ) : (
        <ul className="space-y-4">
          {groups.map(g =>
            <li key={g.id} className="p-4 border rounded shadow-sm">
              <div className="font-semibold text-lg">{g.name}</div>
              <div className="text-gray-600 mb-2">{g.description}</div>
              <h3 className="font-medium mt-2">Members:</h3>
              {g.members && g.members.length > 0 ? (
                <ul className="list-disc list-inside ml-4 text-sm">
                  {g.members.map(memberId => (
                    <li key={memberId}>
                      {userNames[memberId] || `User ID: ${memberId}`} {/* Display name or ID */}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No members in this group.</p>
              )}
            </li>
          )}
        </ul>
      )}
    </main>
  );
}
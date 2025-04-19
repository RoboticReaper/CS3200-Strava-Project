'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation'; // Import useSearchParams

function getUserFromID(user_id) {
  return fetch(`http://localhost:4000/users/${user_id}`)
    .then(res => res.json())
    .then(data => data[0]);
}

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [userNames, setUserNames] = useState({});
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams(); // Get search params
  const userId = searchParams.get('userid'); // Get userId from query (as string)
  const currentUserId = userId ? parseInt(userId, 10) : null; // Convert to number or null

  // State for Create Group Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupData, setNewGroupData] = useState({ name: '', description: '' });

  // Extracted function to fetch groups and members
  const fetchGroups = () => {
    setLoading(true);
    fetch("http://localhost:4000/groups")
      .then(res => res.json())
      .then(async (initialGroups) => {
        // Fetch members for each group
        const memberPromises = initialGroups.map(group =>
          fetch(`http://localhost:4000/groups/${group.id}/members`)
            .then(res => res.json())
            .then(memberData => {
              const memberIds = Array.isArray(memberData) ? memberData.map(item => item.user_id) : [];
              return { ...group, members: memberIds };
            })
            .catch(err => {
              console.error(`Error fetching members for group ${group.id}:`, err);
              return { ...group, members: [] };
            })
        );

        const groupsWithMembers = await Promise.all(memberPromises);

        // Collect all unique user IDs
        const allMemberIds = new Set();
        groupsWithMembers.forEach(group => {
          if (Array.isArray(group.members)) {
            group.members.forEach(id => {
              if (id !== undefined && id !== null) {
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
          if (user) {
            namesMap[user.id] = `${user.first_name} ${user.last_name}`;
          }
        });

        setUserNames(namesMap);
        setGroups(groupsWithMembers);
        setLoading(false);

      }).catch(err => {
        console.error("Error fetching groups:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchGroups(); // Initial fetch
  } , []); // Run only once on mount

  // Function to handle joining a group
  const handleJoinGroup = async (groupId) => {
    if (!currentUserId) {
      alert("You must be logged in to join a group."); // Or handle login redirection
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/groups/${groupId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: currentUserId }), // Send user_id in the body
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to join group: ${response.status}`);
      }

      console.log(`User ${currentUserId} successfully joined group ${groupId}`);
      // Refetch groups to update the UI and membership status
      fetchGroups();

    } catch (error) {
      console.error("Error joining group:", error);
      alert(`Error joining group: ${error.message}`); // Show error to user
    }
  };

  // Function to handle leaving a group
  const handleLeaveGroup = async (groupId) => {
    if (!currentUserId) {
      alert("You must be logged in to leave a group.");
      return;
    }

    try {
      // Note the DELETE request includes user_id in the URL, not the body
      const response = await fetch(`http://localhost:4000/groups/${groupId}/members/${currentUserId}`, {
        method: 'DELETE',
        headers: {
          // No Content-Type needed for DELETE usually, unless your backend specifically requires it
        },
      });

      if (!response.ok) {
        const errorData = await response.json(); // Attempt to get error message from backend
        throw new Error(errorData.message || `Failed to leave group: ${response.status}`);
      }

      console.log(`User ${currentUserId} successfully left group ${groupId}`);
      // Refetch groups to update the UI and membership status
      fetchGroups();

    } catch (error) {
      console.error("Error leaving group:", error);
      alert(`Error leaving group: ${error.message}`); // Show error to user
    }
  };

  // Handle input changes for the create group form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGroupData(prev => ({ ...prev, [name]: value }));
  };

  // Function to handle creating a new group
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!currentUserId) {
      alert("You must be logged in to create a group.");
      return;
    }
    // Add check for description trim
    if (!newGroupData.name.trim() || !newGroupData.description.trim()) {
        alert("Group name and description cannot be empty.");
        return;
    }

    try {
      // 1. Create the group
      const createResponse = await fetch(`http://localhost:4000/groups/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGroupData),
      });

      const createResult = await createResponse.json(); // Always parse JSON

      if (!createResponse.ok) {
        // Use message from backend if available, otherwise provide default
        throw new Error(createResult.message || `Failed to create group: ${createResponse.status}`);
      }

      console.log(`Group "${newGroupData.name}" created successfully with ID: ${createResult.new_group_id}`);
      const newGroupId = createResult.new_group_id;

      // Reset form and close modal immediately after successful creation
      setNewGroupData({ name: '', description: '' });
      setShowCreateModal(false);

      // 2. Automatically join the newly created group
      // No need to await this if immediate UI update isn't critical for the join part
      // handleJoinGroup will call fetchGroups() internally to refresh the list
      handleJoinGroup(newGroupId);

    } catch (error) {
      console.error("Error creating group:", error);
      alert(`Error creating group: ${error.message}`); // Show specific error from backend or default
    }
  };

  if (loading) {
    return <main className="max-w-lg mx-auto p-8"><p>Loading groups...</p></main>;
  }

  return (
    // Remove pt-20
    <main className="max-w-lg mx-auto pt-5">
      <div className="flex justify-between items-center mb-4"> {/* Container for title and button */}
        <h1 className="text-2xl font-bold">Running Groups</h1>
        {currentUserId && ( // Only show create button if logged in
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-strava" // Use existing button style or create a new one
            >
              Create Group
            </button>
        )}
      </div>
      {groups.length === 0 && !loading ? (
        <p>No groups found.</p>
      ) : (
        <ul className="space-y-4"> {/* Corrected: map inside ul */}
          {groups.map(g => {
            // Check if the current user is a member of this group
            const isMember = currentUserId !== null && g.members && g.members.includes(currentUserId);

            return (
              <li key={g.id} className="p-4 border rounded shadow-sm"> {/* Corrected: content inside li */}
                <div className="flex justify-between items-center"> {/* Flex container for name and button */}
                  <div className="font-semibold text-lg">{g.name}</div>
                  {/* Conditionally render Join or Leave button */}
                  {currentUserId && !isMember && (
                    <button
                      onClick={() => handleJoinGroup(g.id)}
                      className="ml-4 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      Join
                    </button>
                  )}
                  {currentUserId && isMember && (
                    <button
                      onClick={() => handleLeaveGroup(g.id)}
                      className="ml-4 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600" // Different style for Leave
                    >
                      Leave
                    </button>
                  )}
                </div>
                <div className="text-gray-600 mb-2">{g.description}</div>
                <h3 className="font-medium mt-2">Members:</h3>
                {g.members && g.members.length > 0 ? (
                  <ul className="list-disc list-inside ml-4 text-sm">
                    {g.members.map(memberId => (
                      <li key={memberId}> {/* Corrected: content inside li */}
                        {userNames[memberId] || `User ID: ${memberId}`} {/* Display name or ID */}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No members in this group.</p>
                )}
              </li> // Corrected: Closing li tag
            );
          })}
        </ul>
      )}

      {/* Modal for Creating Group */}
      {showCreateModal && (
        // Add backdrop-blur-sm and a subtle background color for the blur effect to be visible
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm bg-black/10">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-300">
            <h2 className="text-xl font-semibold mb-6">Create New Group</h2>
            <form onSubmit={handleCreateGroup}>
              <div className="grid grid-cols-1 gap-4 mb-6">
                <input
                  type="text"
                  name="name"
                  placeholder="Group Name"
                  value={newGroupData.name}
                  onChange={handleInputChange}
                  className="input-field border border-gray-300 p-2 rounded"
                  required
                />
                <textarea
                  name="description"
                  placeholder="Group Description" // Updated placeholder
                  value={newGroupData.description}
                  onChange={handleInputChange}
                  className="input-field border border-gray-300 p-2 rounded h-24" // Textarea styling
                  required // Add required attribute
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-strava"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div> {/* Corrected: Closing div for modal content */}
        </div>
      )}
    </main>
  );
}
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from 'next/navigation'; // Import useSearchParams

function getUserFromID(user_id) {
  // Ensure this function fetches user details correctly
  return fetch(`http://localhost:4000/users/${user_id}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to fetch user ${user_id}`);
      }
      return res.json();
    })
    .then((data) => {
      if (!data || data.length === 0) {
        throw new Error(`User ${user_id} not found`);
      }
      return data[0]; // Assuming the API returns an array with one user
    })
    .catch(error => {
      console.error("Error in getUserFromID:", error);
      return { first_name: "Unknown", last_name: "User" }; // Fallback user data
    });
}


export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State for success modal
  const [userGroups, setUserGroups] = useState([]); // State for user's groups (will store full group objects)
  const [newPostData, setNewPostData] = useState({
    title: '',
    content: '',
    post_flair: 'Discussion', // Default flair
    selectedGroupIds: []
  });
  const searchParams = useSearchParams(); // Get search params
  const userId = searchParams.get('userid'); // Get user_id from URL

  // Function to fetch posts (modified slightly for clarity)
  const fetchPosts = () => {
    if (userId) {
      setIsLoading(true); // Start loading
      fetch(`http://localhost:4000/posts?user_id=${userId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(async (data) => {
          if (data && data.length > 0) {
            const enrichedPosts = await Promise.all(
              data.map(async (post) => {
                // Add error handling for getUserFromID
                try {
                  const user = await getUserFromID(post.user_id);
                  return {
                    ...post,
                    user_name: user ? `${user.first_name} ${user.last_name}` : "Unknown User",
                  };
                } catch (error) {
                  console.error(`Failed to get user details for post ${post.id}:`, error);
                  return { ...post, user_name: "Unknown User" }; // Fallback
                }
              })
            );
            setPosts(enrichedPosts);
          } else {
            setPosts([]); // Ensure posts are empty if data is empty/null
          }
        })
        .catch((err) => {
            console.error("Error fetching posts:", err);
            setPosts([]); // Clear posts on error
        })
        .finally(() => {
            setIsLoading(false); // Stop loading regardless of outcome
        });
    } else {
        // If no userId in URL, set posts to empty and stop loading
        setPosts([]);
        setIsLoading(false);
        console.log("No user_id found in URL search params.");
    }
  };

  // Function to fetch groups the user is a member of
  const fetchUserGroups = async () => { // Make the function async
    if (userId) {
      try {
        // 1. Fetch the IDs of groups the user is a member of
        const memberGroupIdsResponse = await fetch(`http://localhost:4000/users/${userId}/groups`);
        if (!memberGroupIdsResponse.ok) {
          // Handle cases where the user might not be in any groups or other errors
          if (memberGroupIdsResponse.status === 404) {
             console.log(`User ${userId} not found or has no groups.`);
             setUserGroups([]); // Set to empty if user/groups not found
             return;
          }
          throw new Error(`Failed to fetch user group IDs: ${memberGroupIdsResponse.status}`);
        }
        const memberGroupIds = await memberGroupIdsResponse.json(); // Should be an array of IDs, e.g., [1, 3, 5]

        if (!Array.isArray(memberGroupIds) || memberGroupIds.length === 0) {
          console.log(`User ${userId} is not a member of any groups.`);
          setUserGroups([]); // No groups to show
          return;
        }

        // 2. Fetch all groups to get their names and details
        const allGroupsResponse = await fetch(`http://localhost:4000/groups`);
        if (!allGroupsResponse.ok) {
          throw new Error(`Failed to fetch all groups: ${allGroupsResponse.status}`);
        }
        const allGroups = await allGroupsResponse.json(); // Array of group objects [{id: 1, name: 'A'}, {id: 2, name: 'B'}, ...]

        // 3. Filter all groups to keep only those the user is a member of
        const filteredGroups = allGroups.filter(group => memberGroupIds.includes(group.id));

        // 4. Set the state with the filtered list of group objects
        setUserGroups(filteredGroups);

      } catch (err) {
        console.error("Error fetching user groups:", err);
        setUserGroups([]); // Set to empty on error
      }
    } else {
      setUserGroups([]); // Clear groups if no user ID
    }
  };


  useEffect(() => {
    fetchPosts(); // Fetch posts on initial load or when userId changes
    fetchUserGroups(); // Fetch groups on initial load or when userId changes
  }, [userId, searchParams]); // Re-run effect if userId or searchParams change

  // Handle input changes for the create post form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPostData(prev => ({ ...prev, [name]: value }));
  };

  // Handle group selection changes
  const handleGroupSelectionChange = (e) => {
    const { value, checked } = e.target;
    const groupId = parseInt(value, 10); // Ensure it's a number

    setNewPostData(prev => {
      const selectedGroupIds = checked
        ? [...prev.selectedGroupIds, groupId] // Add group ID
        : prev.selectedGroupIds.filter(id => id !== groupId); // Remove group ID
      return { ...prev, selectedGroupIds };
    });
  };


  // Handle submitting the new post
  const handleCreatePostSubmit = async (e) => {
    e.preventDefault();
    if (!userId || !newPostData.title.trim() || !newPostData.content.trim()) {
      alert("Please fill in title and content. Ensure you are logged in.");
      return;
    }

    const postPayload = {
      user_id: parseInt(userId, 10),
      title: newPostData.title,
      content: newPostData.content,
      post_flair: newPostData.post_flair,
      group_ids: newPostData.selectedGroupIds // Send the array of selected group IDs
    };

    console.log("Submitting post:", postPayload); // Log payload

    try {
      const response = await fetch('http://localhost:4000/posts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Try parsing error
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Post created successfully
      setShowCreatePostModal(false); // Close create modal
      setNewPostData({ title: '', content: '', post_flair: 'Discussion', selectedGroupIds: [] }); // Reset form
      fetchPosts(); // Refresh the feed to show the new post
      setShowSuccessModal(true); // Show success modal

    } catch (error) {
      console.error("Error creating post:", error);
      alert(`Error creating post: ${error.message}`);
    }
  };


  return (
    <div className="min-h-screen bg-gray-light">
      <main className="pt-20 pb-8">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Following</h1>
            {userId && ( // Only show button if logged in
                <button onClick={() => setShowCreatePostModal(true)} className="btn-strava">Create Post</button>
            )}
          </div>
          {/* ... existing post rendering logic ... */}
          <div className="space-y-4">
            {isLoading ? (
              <p>Loading posts...</p> // Show loading indicator
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <article key={post.id} className="strava-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-light rounded-full flex items-center justify-center">
                      {/* Placeholder for profile pic */}
                      <span className="text-xl">👤</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{post.user_name || 'Loading user...'}</h3>
                      <p className="text-sm text-gray-medium">
                        {/* Display post creation time if available, otherwise fallback */}
                        {post.created_at ? new Date(post.created_at).toLocaleDateString() : new Date().toLocaleDateString()} • {post.post_flair}
                      </p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-semibold text-lg mb-2">{post.title}</h4>
                    <p className="text-gray-dark">{post.content}</p>
                  </div>
                  <div className="border-t pt-3 mt-4">
                    <div className="flex items-center gap-6">
                      <button className="flex items-center gap-2 text-gray-medium hover:text-strava-orange">
                        <span>👍</span>
                        <span>Like</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-medium hover:text-strava-orange">
                        <span>💬</span>
                        <span>Comment</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-medium hover:text-strava-orange">
                        <span>🔄</span>
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="text-center text-gray-medium">
                {userId ? "No posts to show from the groups you follow." : "Please sign in to see your feed."}
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Create Post Modal */}
      {showCreatePostModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm bg-black/30">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg border border-gray-300">
            <h2 className="text-xl font-semibold mb-6">Create New Post</h2>
            <form onSubmit={handleCreatePostSubmit}>
              <div className="grid grid-cols-1 gap-4 mb-6">
                {/* Title Input */}
                <input
                  type="text"
                  name="title"
                  placeholder="Post Title"
                  value={newPostData.title}
                  onChange={handleInputChange}
                  className="input-field border border-gray-300 p-2 rounded"
                  required
                />
                {/* Content Textarea */}
                <textarea
                  name="content"
                  placeholder="What's on your mind?"
                  value={newPostData.content}
                  onChange={handleInputChange}
                  className="input-field border border-gray-300 p-2 rounded h-32"
                  required
                />
                {/* Flair Select */}
                <select
                  name="post_flair"
                  value={newPostData.post_flair}
                  onChange={handleInputChange}
                  className="input-field border border-gray-300 p-2 rounded bg-white"
                >
                  <option value="Discussion">Discussion</option>
                  <option value="Question">Question</option>
                  <option value="Achievement">Achievement</option>
                  <option value="Event">Event</option>
                  <option value="Gear">Gear</option>
                  <option value="Route">Route</option>
                  <option value="Other">Other</option>
                </select>

                {/* Group Selection */}
                <div className="border p-3 rounded border-gray-300">
                  <h3 className="font-medium mb-2 text-sm text-gray-600">Share with Groups (Optional):</h3>
                  {userGroups.length > 0 ? (
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {userGroups.map(group => (
                        <label key={group.id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            name="groupSelection"
                            value={group.id}
                            checked={newPostData.selectedGroupIds.includes(group.id)}
                            onChange={handleGroupSelectionChange}
                            className="rounded"
                          />
                          {group.name}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">You are not a member of any groups, or groups are still loading.</p>
                  )}
                </div>

              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreatePostModal(false)}
                  className="btn-secondary" // Use your secondary button style
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-strava"
                >
                  Create Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm bg-black/30">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm border border-gray-300 text-center">
            <h2 className="text-xl font-semibold mb-4 text-green-600">Success!</h2>
            <p className="mb-6">Your post has been created successfully.</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="btn-strava" // Or another appropriate style
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

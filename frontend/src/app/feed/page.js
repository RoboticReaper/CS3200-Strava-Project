"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from 'next/navigation'; // Import useRouter

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
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false); // State for delete confirmation
  const [commentToDelete, setCommentToDelete] = useState(null); // Stores { postId, commentId }
  const [notification, setNotification] = useState(''); // State for notification message
  const [showNotification, setShowNotification] = useState(false); // State for notification visibility
  const [showAll, setShowAll] = useState(false); // State to toggle between following feed and all posts
  const searchParams = useSearchParams(); // Get search params
  const userId = searchParams.get('userid'); // Get user_id from URL
  const currentUserId = userId ? parseInt(userId, 10) : null; // Ensure we have the numeric ID for posting comments
  const router = useRouter(); // Initialize router

  // Function to fetch posts (modified slightly for clarity)
  const fetchPosts = () => {
    setIsLoading(true); // Start loading
    // Determine URL based on toggle state
    let url = 'http://localhost:4000/posts';
    if (showAll) {
      url += '?all=true';
    } else if (userId) {
      url += `?user_id=${userId}`;
    } else {
      // No user ID and not showing all: clear posts
      setPosts([]);
      setIsLoading(false);
      console.log('No user_id found in URL search params.');
      return;
    }
    fetch(url)
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
                let user = { first_name: "Unknown", last_name: "User" };
                let commentCount = 0;

                // Fetch user details
                try {
                  user = await getUserFromID(post.user_id);
                } catch (error) {
                  console.error(`Failed to get user details for post ${post.id}:`, error);
                }

                // Fetch comment count
                try {
                  const commentsResponse = await fetch(`http://localhost:4000/posts/${post.id}/comments`);
                  if (commentsResponse.ok) {
                    const commentsData = await commentsResponse.json();
                    commentCount = Array.isArray(commentsData) ? commentsData.length : 0;
                  } else {
                     console.error(`Failed to fetch comment count for post ${post.id}: ${commentsResponse.status}`);
                  }
                } catch (error) {
                   console.error(`Error fetching comment count for post ${post.id}:`, error);
                }

                return {
                  ...post,
                  user_name: user ? `${user.first_name} ${user.last_name}` : "Unknown User",
                  areCommentsVisible: false,
                  comments: null,
                  isLoadingComments: false,
                  newComment: '',
                  commentCount: commentCount, // Store the fetched comment count
                };
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
  }, [userId, showAll]); // Re-run effect when userId or showAll change

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

  // --- Comment Handling Functions ---

  // Fetch comments for a specific post
  const fetchComments = async (postId) => {
    setPosts(prevPosts => prevPosts.map(p =>
      p.id === postId ? { ...p, isLoadingComments: true } : p
    ));

    try {
      const response = await fetch(`http://localhost:4000/posts/${postId}/comments`);
      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.status}`);
      }
      const commentsData = await response.json();

      // Fetch user details for each comment and add editing state
      const enrichedComments = await Promise.all(
        commentsData.map(async (comment) => {
          try {
            const user = await getUserFromID(comment.user_id);
            return {
              ...comment,
              user_name: user ? `${user.first_name} ${user.last_name}` : "Unknown User",
              isEditing: false, // State for inline editing
              editedContent: comment.content, // Temp storage for edited content
            };
          } catch (error) {
            console.error(`Failed to get user details for comment ${comment.id}:`, error);
            return { ...comment, user_name: "Unknown User" }; // Fallback
          }
        })
      );

      setPosts(prevPosts => prevPosts.map(p =>
        // Update comment count when full comments are fetched (optional, but good for consistency)
        p.id === postId ? { ...p, comments: enrichedComments, isLoadingComments: false, commentCount: enrichedComments.length } : p
      ));
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error);
      setPosts(prevPosts => prevPosts.map(p =>
        p.id === postId ? { ...p, isLoadingComments: false } : p // Stop loading on error
      ));
    }
  };

  // Toggle comment section visibility and fetch if needed
  const handleToggleComments = (postId) => {
    setPosts(prevPosts => {
      const targetPost = prevPosts.find(p => p.id === postId);
      if (targetPost) {
        const shouldFetch = !targetPost.areCommentsVisible && targetPost.comments === null;
        if (shouldFetch) {
          // Fetch comments asynchronously, don't block the UI toggle
          fetchComments(postId);
        }
        // Return the updated posts array
        return prevPosts.map(p =>
          p.id === postId ? { ...p, areCommentsVisible: !p.areCommentsVisible } : p
        );
      }
      return prevPosts; // Return unchanged if post not found (shouldn't happen)
    });
  };

  // Handle input change for the new comment field
  const handleCommentInputChange = (postId, value) => {
    setPosts(prevPosts => prevPosts.map(p =>
      p.id === postId ? { ...p, newComment: value } : p
    ));
  };

  // Handle submitting a new comment
  const handlePostComment = async (postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post || !post.newComment.trim() || !currentUserId) {
      alert("Please write a comment and ensure you are logged in.");
      return;
    }

    const commentPayload = {
      user_id: currentUserId,
      content: post.newComment.trim(),
    };

    try {
      const response = await fetch(`http://localhost:4000/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Clear the input field and increment comment count locally before refetching
      setPosts(prevPosts => prevPosts.map(p =>
        p.id === postId ? { ...p, newComment: '', commentCount: p.commentCount + 1 } : p
      ));

      // Refresh comments for that post to show the new one (this will also update the count from the server)
      fetchComments(postId);

    } catch (error) {
      console.error(`Error posting comment for post ${postId}:`, error);
      alert(`Error posting comment: ${error.message}`);
    }
  };

  // --- Edit/Delete Comment Handlers ---

  // Start editing a comment
  const handleEditComment = (postId, commentId) => {
    setPosts(prevPosts => prevPosts.map(p =>
      p.id === postId ? {
        ...p,
        comments: p.comments.map(c =>
          c.id === commentId ? { ...c, isEditing: true, editedContent: c.content } : c
        )
      } : p
    ));
  };

  // Cancel editing a comment
  const handleCancelEdit = (postId, commentId) => {
    setPosts(prevPosts => prevPosts.map(p =>
      p.id === postId ? {
        ...p,
        comments: p.comments.map(c =>
          c.id === commentId ? { ...c, isEditing: false } : c // No need to reset editedContent here
        )
      } : p
    ));
  };

  // Handle input change for the edited comment field
  const handleEditInputChange = (postId, commentId, value) => {
     setPosts(prevPosts => prevPosts.map(p =>
      p.id === postId ? {
        ...p,
        comments: p.comments.map(c =>
          c.id === commentId ? { ...c, editedContent: value } : c
        )
      } : p
    ));
  };

  // Save the edited comment
  const handleSaveEdit = async (postId, commentId) => {
    const post = posts.find(p => p.id === postId);
    const comment = post?.comments.find(c => c.id === commentId);

    if (!comment || !comment.editedContent.trim()) {
      alert("Comment cannot be empty.");
      return;
    }

    const editPayload = {
      content: comment.editedContent.trim(),
    };

    try {
      const response = await fetch(`http://localhost:4000/posts/${postId}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Update comment in state and exit editing mode
      setPosts(prevPosts => prevPosts.map(p =>
        p.id === postId ? {
          ...p,
          comments: p.comments.map(c =>
            c.id === commentId ? { ...c, content: comment.editedContent.trim(), isEditing: false } : c
          )
        } : p
      ));
      // Optionally: show a success message

    } catch (error) {
      console.error(`Error updating comment ${commentId} for post ${postId}:`, error);
      alert(`Error updating comment: ${error.message}`);
    }
  };

  // Delete a comment - Step 1: Show confirmation modal
  const handleDeleteComment = (postId, commentId) => {
    setCommentToDelete({ postId, commentId });
    setShowDeleteConfirmModal(true);
  };

  // Delete a comment - Step 2: Confirm deletion (called from modal)
  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;

    const { postId, commentId } = commentToDelete;

    try {
      const response = await fetch(`http://localhost:4000/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Remove comment from state and decrement count
      setPosts(prevPosts => prevPosts.map(p =>
        p.id === postId ? {
          ...p,
          comments: p.comments.filter(c => c.id !== commentId),
          commentCount: p.commentCount - 1,
        } : p
      ));
      // Optionally: show a success message

    } catch (error) {
      console.error(`Error deleting comment ${commentId} for post ${postId}:`, error);
      alert(`Error deleting comment: ${error.message}`);
    } finally {
      // Close modal and clear state regardless of outcome
      setShowDeleteConfirmModal(false);
      setCommentToDelete(null);
    }
  };

   // Cancel comment deletion (called from modal)
  const cancelDeleteComment = () => {
    setShowDeleteConfirmModal(false);
    setCommentToDelete(null);
  };


  // --- End Comment Handling Functions ---

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

  // --- Share Post Handler ---
  const handleSharePost = async (postId) => {
    // Construct the full URL for the post
    const postUrl = `${window.location.origin}/posts?postid=${postId}`;
    try {
      await navigator.clipboard.writeText(postUrl);
      setNotification('Link copied to clipboard!');
      setShowNotification(true);
      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false);
        setNotification('');
      }, 3000);
    } catch (err) {
      console.error('Failed to copy link: ', err);
      setNotification('Failed to copy link.');
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
        setNotification('');
      }, 3000);
    }
  };

  // Function to handle navigation when clicking on a post article
  const handlePostClick = (postId) => {
    router.push(`/posts?postid=${postId}&userid=${userId}`);
  };

  return (
    <div className="min-h-screen bg-gray-light relative"> {/* Added relative positioning for notification */}
      {/* Notification Area */}
      {showNotification && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {notification}
        </div>
      )}

      <main className="pb-8">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">{showAll ? 'All Posts' : 'Following'}</h1>
              <button
                onClick={() => setShowAll(!showAll)}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-200"
              >
                {showAll ? 'Show Following' : 'Show All'}
              </button>
            </div>
            {userId && ( // Only show button if logged in
              <button onClick={() => setShowCreatePostModal(true)} className="btn-strava">Create Post</button>
            )}
          </div>
          {/* Post Rendering Logic */}
          <div className="space-y-4">
            {isLoading ? (
              <p>Loading posts...</p> // Show loading indicator
            ) : posts.length > 0 ? (
              posts.map((post) => (
                // Remove the outer Link component
                <article
                  key={post.id}
                  onClick={() => handlePostClick(post.id)} // Navigate on article click
                  className="strava-card cursor-pointer hover:shadow-md transition-shadow duration-200" // Keep styling
                >
                  {/* Post Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-light rounded-full flex items-center justify-center">
                      {/* Placeholder for profile pic */}
                      <span className="text-xl">👤</span>
                    </div>
                    <div>
                      {/* Keep the inner Link for the user name */}
                      <Link
                        href={`/profile?viewUserId=${post.user_id}&userid=${userId}`}
                        onClick={(e) => e.stopPropagation()} // Prevent triggering article's onClick
                        className="hover:underline hover:text-strava-orange"
                      >
                        <h3 className="font-semibold inline">{post.user_name || 'Loading user...'}</h3>
                      </Link>
                      <p className="text-sm text-gray-medium">
                        {/* Display post creation time if available, otherwise fallback */}
                        {post.created_at ? new Date(post.created_at).toLocaleDateString() : new Date().toLocaleDateString()} • {post.post_flair}
                      </p>
                    </div>
                  </div>
                  {/* Post Content */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-lg mb-2">{post.title}</h4>
                    <p className="text-gray-dark">{post.content}</p>
                  </div>
                  {/* Post Actions (Comment/Share) */}
                  <div className="border-t pt-3 mt-4">
                    <div className="flex items-center gap-6">
                      {/* Buttons now need stopPropagation as well */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleComments(post.id); }} // Stop propagation
                        className="flex items-center gap-2 text-gray-medium hover:text-strava-orange cursor-pointer hover:bg-gray-100 rounded px-2 py-1 z-10 relative"
                      >
                        <span>💬</span>
                        <span>Comment ({post.commentCount})</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSharePost(post.id); }} // Stop propagation
                        className="flex items-center gap-2 text-gray-medium hover:text-strava-orange cursor-pointer hover:bg-gray-100 rounded px-2 py-1 z-10 relative"
                      >
                        <span>🔄</span>
                        <span>Share</span>
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Comment Section */}
                  {post.areCommentsVisible && (
                    // Stop propagation for the entire comment section
                    <div className="border-t mt-4 pt-4 space-y-3" onClick={(e) => { e.stopPropagation(); }}>
                      {/* Comment Input Form (only if logged in) */}
                      {currentUserId && (
                        <div className="flex gap-2 items-start">
                          <input
                            type="text"
                            placeholder="Write a comment..."
                            value={post.newComment}
                            onChange={(e) => handleCommentInputChange(post.id, e.target.value)}
                            className="input-field flex-grow border border-gray-300 p-2 rounded text-sm"
                          />
                          <button
                            onClick={() => handlePostComment(post.id)} // No need to stop propagation here as parent does
                            className="btn-strava text-sm px-3 py-2"
                            disabled={!post.newComment.trim()} // Disable if input is empty
                          >
                            Post
                          </button>
                        </div>
                      )}

                      {/* Display Comments */}
                      {post.isLoadingComments ? (
                        <p className="text-sm text-gray-500">Loading comments...</p>
                      ) : post.comments && post.comments.length > 0 ? (
                        post.comments.map(comment => (
                          <div key={comment.id} className="text-sm bg-gray-50 p-2 rounded group relative"> {/* Added group relative */}
                            {comment.isEditing ? (
                              // ... (editing view remains the same) ...
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={comment.editedContent}
                                  onChange={(e) => handleEditInputChange(post.id, comment.id, e.target.value)}
                                  className="input-field w-full border border-gray-300 p-1 rounded text-sm"
                                />
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => handleCancelEdit(post.id, comment.id)}
                                    className="text-xs text-gray-500 hover:text-gray-700"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSaveEdit(post.id, comment.id)}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                                    disabled={!comment.editedContent.trim()}
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              // Default View
                              <div>
                                {/* Link for commenter's name */}
                                <Link
                                  href={`/profile?viewUserId=${comment.user_id}&userid=${userId}`}
                                  onClick={(e) => e.stopPropagation()} // Prevent triggering article's onClick
                                  className="hover:underline hover:text-strava-orange"
                                >
                                  <span className="font-semibold mr-2 inline">{comment.user_name || `User ${comment.user_id}`}:</span>
                                </Link>
                                <span>{comment.content}</span>
                                {/* Edit/Delete Buttons - Show only for the comment owner */}
                                {currentUserId === comment.user_id && (
                                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"> {/* Reduced gap */}
                                    <button
                                      onClick={() => handleEditComment(post.id, comment.id)}
                                      className="text-xs text-blue-500 hover:text-blue-700 hover:bg-gray-100 rounded px-2 py-1" // Added hover style, padding, rounded
                                      title="Edit comment"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => handleDeleteComment(post.id, comment.id)}
                                      className="text-xs text-red-500 hover:text-red-700 hover:bg-gray-100 rounded px-2 py-1" // Added hover style, padding, rounded
                                      title="Delete comment"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                            {/* ... (optional timestamp) ... */}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No comments yet.</p>
                      )}
                    </div>
                  )}
                </article>
                // Removed the closing </Link> tag
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm bg-black/30">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm border border-gray-300 text-center">
            <h2 className="text-xl font-semibold mb-4 text-red-600">Confirm Deletion</h2>
            <p className="mb-6">Are you sure you want to delete this comment? This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
               <button
                onClick={cancelDeleteComment}
                className="btn-secondary" // Use your secondary button style
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteComment}
                className="btn-strava"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

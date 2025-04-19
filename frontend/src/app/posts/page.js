"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import Link from "next/link";

// Helper function to fetch user details (can be moved to a shared utils file)
async function getUserFromID(user_id) {
  try {
    const res = await fetch(`http://localhost:4000/users/${user_id}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch user ${user_id}, status: ${res.status}`);
    }
    const data = await res.json();
    if (!data || data.length === 0) {
      // Consider if throwing an error or returning a default is better
      console.warn(`User ${user_id} not found or empty response.`);
      return { first_name: "Unknown", last_name: "User" };
    }
    return data[0]; // Assuming the API returns an array with one user
  } catch (error) {
    console.error("Error in getUserFromID:", error);
    return { first_name: "Unknown", last_name: "User" }; // Fallback user data
  }
}


export default function PostPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const postId = searchParams.get('postid');
  const userId = searchParams.get('userid'); // The currently logged-in user viewing the page
  const currentUserId = userId ? parseInt(userId, 10) : null;

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [postUserName, setPostUserName] = useState('Loading user...');

  // State for editing/deleting the post itself
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editedPostData, setEditedPostData] = useState({ title: '', content: '', post_flair: '' }); // Add post_flair
  const [showDeletePostConfirmModal, setShowDeletePostConfirmModal] = useState(false);

  // State for editing/deleting comments (similar to feed page)
  const [showDeleteCommentConfirmModal, setShowDeleteCommentConfirmModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null); // Stores { commentId }

  // State for share notification
  const [notification, setNotification] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  // State for generic info/error modal
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('info'); // 'info', 'success', 'error'

  // Fetch Post Data
  useEffect(() => {
    if (postId) {
      setIsLoading(true);
      setError(null);
      fetch(`http://localhost:4000/posts/${postId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to fetch post: ${res.status}`);
          }
          return res.json();
        })
        .then(async postData => {
          if (postData && postData.length > 0) {
             const fetchedPost = postData[0];
             setPost(fetchedPost);
             setEditedPostData({ title: fetchedPost.title, content: fetchedPost.content, post_flair: fetchedPost.post_flair }); // Initialize edit state
             // Fetch post author's name
             const user = await getUserFromID(fetchedPost.user_id);
             setPostUserName(`${user.first_name} ${user.last_name}`);
          } else {
             throw new Error('Post not found');
          }
        })
        .catch(err => {
          console.error("Error fetching post:", err);
          setError(err.message);
          setPost(null);
        })
        .finally(() => {
          // Loading state for comments will handle overall loading feel
        });
    } else {
      setError("No Post ID provided in URL.");
      setIsLoading(false);
    }
  }, [postId]);

  // Fetch Comments Data
  const fetchComments = async () => {
      if (!postId) return;
      // Don't reset loading indicator here if post is still loading
      // setIsLoading(true);
      try {
          const response = await fetch(`http://localhost:4000/posts/${postId}/comments`);
          if (!response.ok) {
              throw new Error(`Failed to fetch comments: ${response.status}`);
          }
          const commentsData = await response.json();

          const enrichedComments = await Promise.all(
              commentsData.map(async (comment) => {
                  const user = await getUserFromID(comment.user_id);
                  return {
                      ...comment,
                      user_name: user ? `${user.first_name} ${user.last_name}` : "Unknown User",
                      isEditing: false,
                      editedContent: comment.content,
                  };
              })
          );
          setComments(enrichedComments);
      } catch (err) {
          console.error(`Error fetching comments for post ${postId}:`, err);
          setError(prevError => prevError ? `${prevError}, ${err.message}` : err.message); // Append comment error
          setComments([]);
      } finally {
          setIsLoading(false); // Set loading false after both post and comments attempt to load
      }
  };

  useEffect(() => {
      fetchComments();
  }, [postId]); // Fetch comments when postId changes

  // --- Post Edit/Delete Handlers ---
  const handleEditPost = () => {
    setIsEditingPost(true);
    // Ensure editedPostData is current when starting edit
    if (post) {
        setEditedPostData({ title: post.title, content: post.content, post_flair: post.post_flair }); // Initialize flair
    }
  };

  const handleCancelPostEdit = () => {
    setIsEditingPost(false);
    // Optionally reset editedPostData if needed, but usually not necessary
    // if(post) setEditedPostData({ title: post.title, content: post.content });
  };

  const handleEditPostInputChange = (e) => {
    const { name, value } = e.target;
    setEditedPostData(prev => ({ ...prev, [name]: value }));
  };

  const handleSavePostEdit = async () => {
    if (!post || !editedPostData.title.trim() || !editedPostData.content.trim()) {
      // Use modal for validation error
      setModalMessage("Post title and content cannot be empty.");
      setModalType('error');
      setShowInfoModal(true);
      return;
    }

    const updatePayload = {
      title: editedPostData.title.trim(),
      content: editedPostData.content.trim(),
      post_flair: post.post_flair,
    };

    try {
      const response = await fetch(`http://localhost:4000/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Update local post state and exit editing mode
      setPost(prevPost => ({ ...prevPost, ...updatePayload }));
      setIsEditingPost(false);
      // Show success modal
      setModalMessage("Post updated successfully!");
      setModalType('success');
      setShowInfoModal(true);

    } catch (err) {
      console.error(`Error updating post ${postId}:`, err);
      // Show error modal
      setModalMessage(`Error updating post: ${err.message}`);
      setModalType('error');
      setShowInfoModal(true);
    }
  };

  const handleDeletePost = () => {
    setShowDeletePostConfirmModal(true);
  };

  const cancelDeletePost = () => {
    setShowDeletePostConfirmModal(false);
  };

  const confirmDeletePost = async () => {
    if (!post) return;

    try {
      const response = await fetch(`http://localhost:4000/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Show success modal before redirecting
      setModalMessage("Post deleted successfully!");
      setModalType('success');
      setShowInfoModal(true);
      setShowDeletePostConfirmModal(false); // Close the confirmation modal

      // Redirect after a short delay to allow the user to see the modal
      setTimeout(() => {
        // Check if the modal is still open before redirecting
        // This prevents redirecting if the user manually closed the modal and navigated elsewhere
        // Note: This check might be tricky depending on exact state update timing.
        // A more robust way might involve a dedicated state variable for redirection.
        if (showInfoModal && modalMessage === "Post deleted successfully!") {
             router.push(userId ? `/feed?userid=${userId}` : '/feed');
        }
      }, 1500); // Delay redirect slightly (1.5 seconds)

      // Remove the immediate alert and redirect
      // alert("Post deleted successfully!"); // Keep alert for immediate feedback before redirect
      // router.push(userId ? `/feed?userid=${userId}` : '/feed');


    } catch (err) {
      console.error(`Error deleting post ${postId}:`, err);
      // Show error modal
      setModalMessage(`Error deleting post: ${err.message}`);
      setModalType('error');
      setShowInfoModal(true);
      setShowDeletePostConfirmModal(false); // Close confirmation modal on error
    }
  };

  // --- Share Post Handler ---
  const handleSharePost = async () => {
    const postUrl = `${window.location.origin}/posts?postid=${postId}`;
    try {
      await navigator.clipboard.writeText(postUrl);
      setNotification('Link copied to clipboard!');
      setShowNotification(true);
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

  // --- Comment Handlers (similar to feed page) ---

  const handleCommentInputChange = (e) => {
    setNewComment(e.target.value);
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !currentUserId || !postId) {
      // Use modal for validation error
      setModalMessage("Please write a comment and ensure you are logged in.");
      setModalType('error');
      setShowInfoModal(true);
      return;
    }

    const commentPayload = {
      user_id: currentUserId,
      content: newComment.trim(),
    };

    try {
      const response = await fetch(`http://localhost:4000/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setNewComment(''); // Clear input
      fetchComments(); // Refresh comments list

    } catch (err) {
      console.error(`Error posting comment for post ${postId}:`, err);
      // Show error modal
      setModalMessage(`Error posting comment: ${err.message}`);
      setModalType('error');
      setShowInfoModal(true);
    }
  };

  const handleEditComment = (commentId) => {
    setComments(prevComments => prevComments.map(c =>
      c.id === commentId ? { ...c, isEditing: true, editedContent: c.content } : c
    ));
  };

  const handleCancelEdit = (commentId) => {
     setComments(prevComments => prevComments.map(c =>
      c.id === commentId ? { ...c, isEditing: false } : c
    ));
  };

  const handleEditInputChange = (commentId, value) => {
     setComments(prevComments => prevComments.map(c =>
      c.id === commentId ? { ...c, editedContent: value } : c
    ));
  };

  const handleSaveEdit = async (commentId) => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment || !comment.editedContent.trim()) {
      // Use modal for validation error
      setModalMessage("Comment cannot be empty.");
      setModalType('error');
      setShowInfoModal(true);
      return;
    }

    const editPayload = { content: comment.editedContent.trim() };

    try {
      const response = await fetch(`http://localhost:4000/posts/${postId}/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      fetchComments(); // Refresh comments to show updated one and exit editing mode
      // Optionally show success modal
      // setModalMessage("Comment updated successfully!");
      // setModalType('success');
      // setShowInfoModal(true);

    } catch (err) {
      console.error(`Error updating comment ${commentId} for post ${postId}:`, err);
      // Show error modal
      setModalMessage(`Error updating comment: ${err.message}`);
      setModalType('error');
      setShowInfoModal(true);
    }
  };

  const handleDeleteComment = (commentId) => {
    setCommentToDelete({ commentId });
    setShowDeleteCommentConfirmModal(true);
  };

   const cancelDeleteComment = () => {
    setShowDeleteCommentConfirmModal(false);
    setCommentToDelete(null);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    const { commentId } = commentToDelete;

    try {
      const response = await fetch(`http://localhost:4000/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      fetchComments(); // Refresh comments list
      // Optionally show success modal
      // setModalMessage("Comment deleted successfully!");
      // setModalType('success');
      // setShowInfoModal(true);

    } catch (err) {
      console.error(`Error deleting comment ${commentId} for post ${postId}:`, err);
      // Show error modal
      setModalMessage(`Error deleting comment: ${err.message}`);
      setModalType('error');
      setShowInfoModal(true);
    } finally {
      setShowDeleteCommentConfirmModal(false);
      setCommentToDelete(null);
    }
  };


  // --- Render Logic ---
  if (isLoading) {
    return <div className="pt-20 text-center">Loading post...</div>;
  }

  if (error) {
    return <div className="pt-20 text-center text-red-600">Error: {error}</div>;
  }

  if (!post) {
    return <div className="pt-20 text-center">Post not found.</div>;
  }

  const canEditOrDeletePost = currentUserId === post.user_id;

  return (
    <div className="min-h-screen bg-gray-light relative"> {/* Added relative */}
       {/* Notification Area */}
      {showNotification && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-[100]"> {/* Ensure high z-index */}
          {notification}
        </div>
      )}
      <main className="pt-20 pb-8">
        <div className="max-w-2xl mx-auto px-4">
          {/* Back Link */}
           <Link href={userId ? `/feed?userid=${userId}` : '/feed'} className="text-sm text-blue-600 hover:underline mb-4 inline-block">
             &larr; Back to Feed
           </Link>

          {/* Post Display/Edit Area */}
          <article className="strava-card mb-8">
            {isEditingPost ? (
              // Post Editing View
              <div className="space-y-4">
                 <input
                    type="text"
                    name="title"
                    value={editedPostData.title}
                    onChange={handleEditPostInputChange}
                    className="input-field w-full border border-gray-300 p-2 rounded text-lg font-semibold"
                    placeholder="Post Title"
                 />
                 <textarea
                    name="content"
                    value={editedPostData.content}
                    onChange={handleEditPostInputChange}
                    className="input-field w-full border border-gray-300 p-2 rounded h-40"
                    placeholder="Post Content"
                 />
                 {/* Add flair editing */}
                 <select
                    name="post_flair"
                    value={editedPostData.post_flair}
                    onChange={handleEditPostInputChange}
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
                 <div className="flex justify-end gap-4"> {/* Increased gap from gap-2 to gap-4 */}
                    <button onClick={handleCancelPostEdit} className="btn-secondary text-sm">Cancel</button>
                    <button onClick={handleSavePostEdit} className="btn-strava text-sm">Save Changes</button>
                 </div>
              </div>
            ) : (
              // Post Display View
              <>
                {/* Post Header */}
                <div className="flex items-center gap-3 mb-4 relative">
                  <div className="w-12 h-12 bg-gray-light rounded-full flex items-center justify-center">
                    <span className="text-xl">👤</span> {/* Placeholder */}
                  </div>
                  <div>
                    <h3 className="font-semibold">{postUserName}</h3>
                    <p className="text-sm text-gray-medium"> {/* Move content inside the p tag */}
                      {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Date unknown'} • {post.post_flair}
                    </p> {/* Remove the extra closing p tag from here */}
                  </div>
                  {/* Post Edit/Delete/Share Buttons */}
                  <div className="absolute top-0 right-0 flex gap-2 items-center"> {/* Adjusted container */}
                    {/* Share Button */}
                    <button
                      onClick={handleSharePost}
                      className="text-xs text-gray-600 hover:text-strava-orange p-1 hover:bg-gray-100 cursor-pointer rounded" // Added hover background, cursor, and rounded
                      title="Share Post"
                    >
                      🔗 Share
                    </button>
                    {/* Edit/Delete Buttons (only if owner) */}
                    {canEditOrDeletePost && (
                      <>
                        <button
                          onClick={handleEditPost}
                          className="text-xs text-blue-500 hover:text-blue-700 p-1 hover:bg-gray-100 cursor-pointer rounded" // Added hover background, cursor, and rounded
                          title="Edit Post"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={handleDeletePost}
                          className="text-xs text-red-500 hover:text-red-700 p-1 hover:bg-gray-100 cursor-pointer rounded" // Added hover background, cursor, and rounded
                          title="Delete Post"
                        >
                          🗑️ Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {/* Post Content */}
                <div className="mb-4">
                  <h1 className="font-semibold text-xl mb-2">{post.title}</h1>
                  <p className="text-gray-dark whitespace-pre-wrap">{post.content}</p> {/* Preserve whitespace */}
                </div>
              </>
            )}
          </article>

          {/* Comments Section */}
          <section className="strava-card">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Comments ({comments.length})</h2>

            {/* Comment Input Form */}
            {currentUserId && (
              <div className="flex gap-2 items-start mb-6">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={handleCommentInputChange}
                  className="input-field flex-grow border border-gray-300 p-2 rounded text-sm"
                />
                <button
                  onClick={handlePostComment}
                  className="btn-strava text-sm px-3 py-2"
                  disabled={!newComment.trim()}
                >
                  Post
                </button>
              </div>
            )}

            {/* Display Comments */}
            <div className="space-y-3">
              {comments.length > 0 ? (
                comments.map(comment => (
                  <div key={comment.id} className="text-sm bg-gray-50 p-3 rounded group relative">
                    {comment.isEditing ? (
                      // Comment Editing View
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={comment.editedContent}
                          onChange={(e) => handleEditInputChange(comment.id, e.target.value)}
                          className="input-field w-full border border-gray-300 p-1 rounded text-sm"
                        />
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => handleCancelEdit(comment.id)} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
                          <button onClick={() => handleSaveEdit(comment.id)} className="text-xs text-blue-600 hover:text-blue-800 font-semibold" disabled={!comment.editedContent.trim()}>Save</button>
                        </div>
                      </div>
                    ) : (
                      // Comment Default View
                      <div>
                        <span className="font-semibold mr-2">{comment.user_name}:</span>
                        <span>{comment.content}</span>
                        {/* Comment Edit/Delete Buttons */}
                        {currentUserId === comment.user_id && (
                          <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEditComment(comment.id)} className="text-xs text-blue-500 hover:text-blue-700 hover:bg-gray-100 rounded px-2 py-1" title="Edit comment">✏️</button>
                            <button onClick={() => handleDeleteComment(comment.id)} className="text-xs text-red-500 hover:text-red-700 hover:bg-gray-100 rounded px-2 py-1" title="Delete comment">🗑️</button>
                          </div>
                        )}
                      </div>
                    )}
                     {/* Optionally display comment timestamp */}
                     <p className="text-xs text-gray-400 mt-1">{new Date(comment.created_at).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No comments yet.</p>
              )}
            </div>
          </section>
        </div> {/* Closing max-w-2xl mx-auto px-4 */}
      </main> {/* Add missing closing main tag */}

       {/* Delete Post Confirmation Modal */}
      {showDeletePostConfirmModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm bg-black/30">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm border border-gray-300 text-center">
            <h2 className="text-xl font-semibold mb-4 text-red-600">Confirm Post Deletion</h2>
            <p className="mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
               <button onClick={cancelDeletePost} className="btn-secondary">Cancel</button>
               <button onClick={confirmDeletePost} className="btn-strava bg-red-500 hover:bg-red-600">Delete Post</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Comment Confirmation Modal */}
      {showDeleteCommentConfirmModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm bg-black/30">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm border border-gray-300 text-center">
            <h2 className="text-xl font-semibold mb-4 text-red-600">Confirm Comment Deletion</h2>
            <p className="mb-6">Are you sure you want to delete this comment? This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
               <button onClick={cancelDeleteComment} className="btn-secondary">Cancel</button>
               <button onClick={confirmDeleteComment} className="btn-strava bg-red-500 hover:bg-red-600">Delete Comment</button>
            </div>
          </div>
        </div>
      )}

      {/* Info/Success/Error Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm bg-black/30">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm border border-gray-300 text-center">
            <h2 className={`text-xl font-semibold mb-4 ${modalType === 'error' ? 'text-red-600' : (modalType === 'success' ? 'text-green-600' : 'text-gray-800')}`}>
              {modalType === 'error' ? 'Error' : (modalType === 'success' ? 'Success' : 'Information')}
            </h2>
            <p className="mb-6">{modalMessage}</p>
            <button
              onClick={() => {
                // If it's the post deletion success message, redirect immediately on OK click
                if (modalType === 'success' && modalMessage === "Post deleted successfully!") {
                  router.push(userId ? `/feed?userid=${userId}` : '/feed');
                } else {
                  setShowInfoModal(false); // Otherwise, just close the modal
                }
              }}
              className="btn-strava" // Or btn-secondary depending on context
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

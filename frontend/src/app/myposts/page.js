"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';
import Link from "next/link";

// Helper function to fetch user details (can be moved to a shared utils file)
// Assuming getUserFromID exists or is imported from a utils file
async function getUserFromID(user_id) {
  try {
    const res = await fetch(`http://localhost:4000/users/${user_id}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch user ${user_id}, status: ${res.status}`);
    }
    const data = await res.json();
    if (!data || data.length === 0) {
      console.warn(`User ${user_id} not found or empty response.`);
      return { first_name: "Unknown", last_name: "User" };
    }
    return data[0]; // Assuming the API returns an array with one user
  } catch (error) {
    console.error("Error in getUserFromID:", error);
    return { first_name: "Unknown", last_name: "User" }; // Fallback user data
  }
}

export default function MyPostsPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userid');
  const currentUserId = userId ? parseInt(userId, 10) : null; // Keep track for links

  const [posts, setPosts] = useState([]);
  const [userName, setUserName] = useState('Loading user...');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch User Name
  useEffect(() => {
    if (currentUserId) {
      getUserFromID(currentUserId)
        .then(user => {
          setUserName(`${user.first_name} ${user.last_name}`);
        })
        .catch(err => {
          console.error("Error fetching user name:", err);
          setUserName("User"); // Fallback name
        });
    } else {
        setUserName("User"); // No user ID provided
    }
  }, [currentUserId]);

  // Fetch User's Posts
  useEffect(() => {
    if (currentUserId) {
      setIsLoading(true);
      setError(null);
      // Update the fetch URL to use the author_id query parameter
      fetch(`http://localhost:4000/posts?author_id=${currentUserId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to fetch posts: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          setPosts(data);
        })
        .catch(err => {
          console.error("Error fetching user posts:", err);
          setError(err.message);
          setPosts([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setError("No User ID provided in URL.");
      setIsLoading(false);
    }
  }, [currentUserId]);

  // --- Render Logic ---
  return (
    <div className="min-h-screen bg-gray-light">
      <main className="pb-8">
        <div className="max-w-2xl mx-auto px-4">
          {/* Back Link */}
          <Link href={currentUserId ? `/feed?userid=${currentUserId}` : '/feed'} className="text-sm text-blue-600 hover:underline mb-4 inline-block">
            &larr; Back to Feed
          </Link>

          <h1 className="text-2xl font-semibold mb-6">Posts by {userName}</h1>

          {isLoading && <div className="text-center">Loading posts...</div>}

          {error && <div className="text-center text-red-600">Error: {error}</div>}

          {!isLoading && !error && posts.length === 0 && (
            <div className="text-center text-gray-500">This user hasn't made any posts yet.</div>
          )}

          {!isLoading && !error && posts.length > 0 && (
            <div className="space-y-4">
              {posts.map(post => (
                // Move Link component to wrap the article
                <Link key={post.id} href={`/posts?postid=${post.id}&userid=${currentUserId}`} className="block hover:bg-gray-50 transition duration-150 ease-in-out rounded-lg"> {/* Added block, hover effect, transition, and rounded */}
                  <article className="strava-card p-4"> {/* Adjusted padding if needed, removed key from here */}
                    {/* Remove Link from around h2 */}
                    <h2 className="font-semibold text-lg mb-1">{post.title}</h2>
                    <p className="text-sm text-gray-medium">
                      {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Date unknown'} • {post.post_flair}
                    </p>
                    {/* Optional: Add a snippet of post.content if desired */}
                    {/* <p className="text-sm text-gray-dark mt-2 line-clamp-2">{post.content}</p> */}
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

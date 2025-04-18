"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from 'next/navigation'; // Import useSearchParams

function getUserFromID(user_id) {
  return fetch(`http://localhost:4000/users/${user_id}`)
    .then((res) => res.json())
    .then((data) => data[0]);
}

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const searchParams = useSearchParams(); // Get search params

  useEffect(() => {
    const userId = searchParams.get('userid'); // Get user_id from URL

    if (userId) {
      setIsLoading(true); // Start loading
      // Append user_id as a query parameter
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
                const user = await getUserFromID(post.user_id);
                return {
                  ...post,
                  user_name: `${user.first_name} ${user.last_name}`,
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
    } else {
        // If no userId in URL, set posts to empty and stop loading
        setPosts([]); 
        setIsLoading(false);
        console.log("No user_id found in URL search params.");
    }
  }, [searchParams]); // Re-run effect if searchParams change

  return (
    <div className="min-h-screen bg-gray-light">
      <main className="pt-20 pb-8">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Following</h1>
            <button className="btn-strava">Create Post</button>
          </div>
          <div className="space-y-4">
            {isLoading ? (
              <p>Loading posts...</p> // Show loading indicator
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <article key={post.id} className="strava-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-light rounded-full flex items-center justify-center">
                      👤
                    </div>
                    <div>
                      <h3 className="font-semibold">{post.user_name}</h3>
                      <p className="text-sm text-gray-medium">
                        {new Date().toLocaleDateString()} • {post.post_flair}
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
              <p>No posts available.</p> // Show message if no posts
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

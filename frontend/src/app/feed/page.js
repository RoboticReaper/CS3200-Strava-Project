"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

function getUserFromID(user_id) {
  return fetch(`http://localhost:4000/users/${user_id}`)
    .then((res) => res.json())
    .then((data) => data[0]);
}

export default function FeedPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/posts")
      .then((res) => res.json())
      .then(async (data) => {
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
      })
      .catch((err) => console.error("Error fetching posts:", err));
  }, []);

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
            {posts.map((post) => (
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
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';
import { useEffect, useState } from "react";

function getUserFromID(user_id) {
  return fetch(`http://localhost:4000/users/${user_id}`)
    .then(res => res.json())
    .then(data => data[0]);
}

export default function FeedPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/posts")
      .then(res => res.json())
      .then(async (data) => {
        const enrichedPosts = await Promise.all(
          data.map(async (post) => {
            const user = await getUserFromID(post.user_id);
            return {
              ...post,
              user_name: `${user.first_name} ${user.last_name}`
            };
          })
        );
        setPosts(enrichedPosts);
      })
      .catch(err => console.error("Error fetching posts:", err));
  }, []);

  return (
    <main className="max-w-lg mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4">🏁 Feed</h1>
      <ul>
        {posts.map(post =>
          <li key={post.id} className="mb-3 border p-3 rounded">
            <div className="text-sm text-gray-500">{post.user_name} • <span className="italic">{post.post_flair}</span></div>
            <div className="font-semibold">{post.title}</div>
            <div>{post.content}</div>
          </li>
        )}
      </ul>
    </main>
  );
}

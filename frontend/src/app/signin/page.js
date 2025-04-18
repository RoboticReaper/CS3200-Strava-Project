'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";


export default function SignIn() {
    const [userId, setUserId] = useState('');
    const [users, setUsers] = useState([])
    const router = useRouter();

    function signIn() {
        let userExists = false;

        users.forEach((user) => {
            if (user.id.toString() === userId) {
                userExists = true;
            }
        })
        if (!userExists) {
            alert("User ID not found!");
            return;
        }

        router.push(`/?userid=${userId}`)
    }

    useEffect(() => {
        fetch("http://localhost:4000/users").then(res => res.json())
            .then(data => setUsers(data))
            .catch(err => console.error("Error fetching users", err))
    }, [])

    return (
        <main className="max-w-lg mx-auto p-8 pt-20">
            <div className="flex gap-4 items-baseline mb-6">
                <h1 className="text-2xl font-bold">Sign In</h1>
            </div>
            <section className="pb-4 mb-6 border-b">
                 <form onSubmit={(e) => { e.preventDefault(); signIn(); }} className="flex flex-col gap-4">
                    <input
                        type="text"
                        id="userid"
                        placeholder="User ID"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="input border border-gray-300 p-2 rounded w-full"
                        required
                    />
                    <button type="submit" className="btn-strava w-full">Sign In</button>
                 </form>
                <div className="text-sm text-gray-500 italic mt-4 text-center">
                    <Link href="/signup" className="underline font-semibold hover:text-strava-orange">Register new account →</Link>
                </div>
            </section>
            <section>
                <h2 className="text-xl font-semibold mb-4 text-center">Available Users (for testing)</h2>
                <ul className="space-y-3">
                    {users.length === 0 ? <li className="text-center text-gray-500">Loading users...</li> : users.map((user) => (
                        <li key={user.id} className="border border-gray-200 p-3 rounded shadow-sm bg-white">
                            <div className="font-semibold text-gray-800">{user.first_name} {user.last_name}</div>
                            <div className="text-sm text-gray-600">{user.email}</div>
                            <div className="text-xs text-gray-500 mt-1">ID: <span className="font-mono bg-gray-100 px-1 rounded">{user.id}</span></div>
                        </li>
                    ))}
                </ul>
            </section>
        </main>
    );
}
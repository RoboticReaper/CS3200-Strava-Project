'use client';

import { useEffect, useState } from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
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
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline' }}>
                <h1 className="text-2xl font-bold mb-3">Sign In</h1>
            </div>
            <section className="pb-4 flex flex-col gap-3">
                <TextField id="userid" value={userId} onChange={(e) => { setUserId(e.target.value) }} label="User ID" required fullWidth />
                <Button variant="contained" onClick={signIn} fullWidth>Sign In</Button>
                <div className="text-sm text-gray-500 italic">
                    <Link href="/signup" className="underline font-semibold">Register new account →</Link>
                </div>
            </section>
            <section>
                <h2 className="font-bold mb-2">All Users</h2>
                <ul>
                    {users.length === 0 ? "Loading..." : users.map((user) => {
                        return <li key={user.id} className="mb-3 border p-3 rounded">

                            <div className="font-semibold">{user.first_name} {user.last_name}</div>
                            <div className="text-sm text-gray-500 italic">{user.email}</div>
                            <div className="text-sm text-gray-500 italic">ID: {user.id}</div>
                        </li>
                    })}
                </ul>
            </section>
        </main>
    );
}
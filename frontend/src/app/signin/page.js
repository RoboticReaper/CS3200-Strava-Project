'use client';

import { useEffect, useState } from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useRouter } from "next/navigation";


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
        <main className="max-w-lg mx-auto p-8">
            <h1 className="text-2xl font-bold">Type a user id to sign in as.</h1>

            <TextField id="userid" value={userId} onChange={(e) => { setUserId(e.target.value) }} />
            <br /><br />
            <div style={{ display: 'flex', gap: '1rem' }}>
                <Button variant="contained" onClick={signIn}>Sign In</Button>
            </div>
            <br /><br />
            <section>
                <h2 className="font-bold mb-2">All Users</h2>
                <ul>
                    {users.length === 0 ? "Loading..." : users.map((user) => {
                        return <li key={user.id}>
                            {user.first_name} {user.last_name} {user.email} ID: {user.id}
                        </li>
                    })}
                </ul>
            </section>
        </main>
    );
}
'use client';

import { useEffect, useState } from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useRouter } from "next/navigation";


export default function SignIn() {
    const [userId, setUserId] = useState('');
    const router = useRouter();

    function signIn() {
        // more checking needed
        router.push(`/?userid=${userId}`)
    }

    function signUp() {
        router.push(`/?userid=${userId}`)
    }

    return (
        <main className="max-w-lg mx-auto p-8">
            <h1 className="text-2xl font-bold">Type a user id to sign in or sign up as.</h1>
            
            <TextField id="userid" value={userId} onChange={(e) => {setUserId(e.target.value)}} />
            <br /><br />
            <Button variant="contained" onClick={signIn}>Sign In</Button>
            <br /><br />
            <Button variant="contained" onClick={signUp}>Sign Up</Button>
        </main>
    );
}
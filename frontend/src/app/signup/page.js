'use client';

import { useEffect, useState } from "react";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useRouter } from "next/navigation";
import Link from "next/link";


export default function SignUp() {
    const [firstName, setFirstName] = useState(''); 
    const [lastName, setLastName] = useState('');   
    const [email, setEmail] = useState('');     
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    function signUp() {
        if (!firstName || !lastName || !email) {
            alert("Please fill in all fields.");
            return;
        }
        setIsLoading(true)

        const userData = {
            first_name: firstName, // Ensure keys match the backend expectation
            last_name: lastName,
            email: email
        };

        fetch('http://localhost:4000/users/', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        }).then(res => {
            if (res.status === 201) {
                router.push("/signin")
            } else {
                alert("Error creating user.");
            }
        }).catch(err => {
            console.error("Error creating user", err);
            alert("Error creating user.");
        }).finally(() => {
            setIsLoading(false);
            setFirstName('');
            setLastName('');
            setEmail('');
        })
    }

    return (
        <main className="max-w-lg mx-auto p-8">
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline'}}>
                <h1 className="text-2xl font-bold mb-1">Sign Up</h1>
                <div className="text-sm text-gray-500 italic mb-1">
                    <Link href="/" className="underline font-semibold">Home →</Link>
                </div>
            </div>
            <section className="pb-4">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <TextField
                        id="firstname"
                        label="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        variant="outlined"
                        fullWidth
                        required
                    />
                    <TextField
                        id="lastname"
                        label="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        variant="outlined"
                        fullWidth
                        required
                    />
                    <TextField
                        id="email"
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        variant="outlined"
                        fullWidth
                        required
                    />
                    <Button variant="contained" onClick={signUp} loading={isLoading}>Sign Up</Button>
                </div>
                <div className="text-sm text-gray-500 italic mt-2 text-center">
                    <Link href="/signin" className="underline font-semibold">Already have an account? Sign In →</Link>
                </div>
            </section>
        </main>
    );
}
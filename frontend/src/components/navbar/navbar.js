'use client'
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Navbar({}) {
    const [currentUser, setCurrentUser] = useState(null);

    const searchParams = useSearchParams();
    const userId = searchParams.get("userid") || null;

    useEffect(() => {
        if (userId) {
            getUserFromID(userId).then((user) => setCurrentUser(user));
        }
    }, []);


    return (
        <nav className="bg-white border-b border-gray-200 fixed w-full z-10">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-strava-orange">STRAVA</h1>
                        <div className="ml-10 flex space-x-4">
                            <Link href="/feed" className="nav-link">
                                Feed
                            </Link>
                            <Link href="/runs" className="nav-link">
                                Training
                            </Link>
                            <Link href="/leaderboard" className="nav-link">
                                Leaderboard
                            </Link>
                            <Link href="/groups" className="nav-link">
                                Groups
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center">
                        {currentUser ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-gray-medium">
                                    Welcome, {currentUser.first_name}!
                                </span>
                                <Link href="/" className="btn-strava">
                                    Log Out
                                </Link>
                            </div>
                        ) : (
                            <div className="space-x-4">
                                <Link href="/signin" className="nav-link">
                                    Sign In
                                </Link>
                                <Link href="/signup" className="btn-strava">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

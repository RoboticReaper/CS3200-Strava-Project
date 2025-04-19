'use client'
import Link from "next/link";
import { useEffect, useState, useRef } from "react"; // Import useRef
import { useSearchParams } from "next/navigation";

function getUserFromID(user_id) {
    return fetch(`http://localhost:4000/users/${user_id}`)
        .then((res) => res.json())
        .then((data) => data[0]);
}

export default function Navbar({ }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown
    const dropdownRef = useRef(null); // Ref for dropdown closing logic

    const searchParams = useSearchParams();
    const userId = searchParams.get("userid") || null;

    useEffect(() => {
        if (userId) {
            getUserFromID(userId).then((user) => setCurrentUser(user));
        } else {
            setCurrentUser(null); // Clear user if no userId in URL
            setIsDropdownOpen(false); // Close dropdown if user logs out
        }
    }, [userId]); // Add userId as a dependency

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);


    return (
        <nav className="bg-white border-b border-gray-200 fixed w-full z-10">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href={userId ? `/?userid=${userId}` : "/"}>
                            <h1 className="text-2xl font-bold text-strava-orange">STRAVA</h1>
                        </Link>
                        <div className="ml-10 flex space-x-4">
                            <Link href={userId ? `/?userid=${userId}` : "/"} className="nav-link">
                                Home
                            </Link>
                            <Link href={userId ? `/feed?userid=${userId}` : "/feed"} className="nav-link">
                                Feed
                            </Link>
                            <Link href={userId ? `/runs?userid=${userId}` : "/runs"} className="nav-link">
                                Run
                            </Link>
                            <Link href={userId ? `/leaderboard?userid=${userId}` : "/leaderboard"} className="nav-link">
                                Leaderboard
                            </Link>
                            <Link href={userId ? `/groups?userid=${userId}` : "/groups"} className="nav-link">
                                Groups
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center">
                        {currentUser ? (
                            // Isolate the dropdown components in a relative container
                            <div className="relative" ref={dropdownRef}>
                                {/* Dropdown Toggle Button */}
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    // Added hover, cursor, padding, and rounded classes
                                    className="flex items-center text-gray-medium hover:text-strava-orange focus:outline-none px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer"
                                >
                                    <span>👤</span> {/* Placeholder icon */}
                                    <span className="ml-2">
                                        Welcome, {currentUser.first_name}!
                                    </span>
                                    {/* Conditional arrow */}
                                    <span className="ml-1">{isDropdownOpen ? '▲' : '▼'}</span>
                                </button>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 top-full w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20">
                                        <Link
                                            href={`/profile/?viewUserId=${userId}&userid=${userId}`}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-strava-orange"
                                            onClick={() => setIsDropdownOpen(false)} // Close dropdown on click
                                        >
                                            View Profile
                                        </Link>
                                        <Link
                                            href={`/myposts?userid=${userId}`}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-strava-orange"
                                            onClick={() => setIsDropdownOpen(false)} // Close dropdown on click
                                        >
                                            My Posts
                                        </Link>
                                        <div className="border-t border-gray-100 my-1"></div> {/* Separator */}
                                        {/* Log out should redirect to the home page without the user ID */}
                                        <Link
                                            href="/"
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-800"
                                            onClick={() => setIsDropdownOpen(false)} // Close dropdown on click
                                        >
                                            Log Out
                                        </Link>
                                    </div>
                                )}
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

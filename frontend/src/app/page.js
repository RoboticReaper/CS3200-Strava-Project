"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function getUserFromID(user_id) {
  return fetch(`http://localhost:4000/users/${user_id}`)
    .then((res) => res.json())
    .then((data) => data[0]);
}

export default function Home() {
  const [userNames, setUserNames] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [runs, setRuns] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const searchParams = useSearchParams();
  const userId = searchParams.get("userid") || null;

  useEffect(() => {
    // Fetch current user details if userId is present
    if (userId) {
      getUserFromID(userId).then((user) => setCurrentUser(user));
    } else {
      setCurrentUser(null); // Clear user if no userId
    }

    // Fetch global leaderboard data
    fetch("http://localhost:4000/leaderboard")
      .then((res) => res.json())
      .then(async (leaderboardEntries) => {
        // Fetch details for all users on the initial leaderboard
        const users = await Promise.all(
          leaderboardEntries.map((u) => getUserFromID(u.user_id))
        );

        // Create a map for quick lookup of user details and names
        const userMap = {};
        const userDetailsMap = {};
        users.forEach((user, i) => {
          if (user) { // Check if user fetch was successful
            const entry = leaderboardEntries[i];
            userMap[entry.user_id] = `${user.first_name} ${user.last_name}`;
            userDetailsMap[entry.user_id] = user; // Store full user details
          }
        });

        // Filter leaderboard entries to exclude hidden profiles
        const filteredEntries = leaderboardEntries.filter(entry => {
          const user = userDetailsMap[entry.user_id];
          // Keep if user exists and profile is not hidden
          return user && !user.profile_hidden;
        });

        // Update state with filtered leaderboard and corresponding names
        setLeaderboard(filteredEntries);
        setUserNames(userMap); // Keep the userMap for names, it's used in rendering
      })
      .catch((err) => console.error("Error fetching leaderboard:", err));

    // Fetch runs for the logged-in user if userId is present
    if (userId) {
      fetch(`http://localhost:4000/runs/${userId}`) // Fetch runs for the specific user
        .then((res) => res.json())
        .then((data) => setRuns(data))
        .catch((err) => console.error(`Error fetching runs for user ${userId}:`, err));
    } else {
      setRuns([]); // Clear runs if no user is logged in
    }
  }, [userId]); // Rerun effect when userId changes

  // Calculate stats based on the fetched runs for the current user
  const totalActivities = runs.length;
  const totalDistance = runs.reduce((acc, run) => acc + parseFloat(run.distance || 0), 0).toFixed(1);
  const totalCalories = runs.reduce((acc, run) => acc + parseInt(run.calories || 0), 0);

  return (
    <div className="min-h-screen bg-gray-light">
      <main className="pb-8">
        <div className="max-w-7xl mx-auto px-4">
          {currentUser ? (
            <>
              <h1 className="text-2xl font-bold mb-4">Welcome back, {currentUser.first_name}!</h1>
              {/* User-specific Stats */}
              <div className="stats-container">
                <div className="stat-card">
                  <div className="stat-value">{totalActivities}</div>
                  <div className="stat-label">Total Activities</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{totalDistance}</div>
                  <div className="stat-label">Total Distance (km)</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{totalCalories}</div>
                  <div className="stat-label">Total Calories</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                {/* User-specific Recent Activities */}
                <section className="strava-card">
                  <h2 className="text-xl font-semibold mb-4">Your Recent Activities</h2>
                  {runs.length > 0 ? (
                    <ul className="space-y-4">
                      {runs.slice(0, 5).map((r, i) => (
                        <li
                          key={r.id || i} // Use run id if available
                          className="flex items-center justify-between border-b last:border-0 pb-3"
                        >
                          <div>
                            {/* Assuming run object has date/time info - adapt as needed */}
                            <div className="font-medium">Run on {new Date(r.start_time || Date.now()).toLocaleDateString()}</div>
                            <div className="text-sm text-gray-medium">
                              {r.distance} km • {r.time} min • {r.avg_pace} min/km
                            </div>
                          </div>
                          <Link
                            href={`/map?id=${r.id}&userid=${userId}`}
                            className="text-accent-blue hover:underline"
                          >
                            View Map
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>You haven't recorded any activities yet.</p>
                  )}
                </section>

                {/* Global Leaderboard */}
                <section className="strava-card">
                  <h2 className="text-xl font-semibold mb-4">Leaderboard</h2>
                  <div className="overflow-hidden">
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Athlete</th>
                          <th>Distance</th>
                        </tr>
                      </thead>
                      <tbody>{/* Ensure no whitespace before/after map */}
                        {leaderboard.slice(0, 5).map((u, i) => (
                          <tr key={u.user_id} className="hover:bg-gray-light">{/* Ensure no whitespace inside tr */}
                            <td className="font-medium">{i + 1}</td>{/* Ensure no whitespace inside td */}
                            <td>{/* Ensure no whitespace inside td */}
                              <Link href={`/profile?viewUserId=${u.user_id}&userid=${userId}`} className="hover:text-strava-orange">
                                {userNames[u.user_id] || `User ${u.user_id}`}
                              </Link>
                            </td>
                            <td>{u.total_distance} km</td>{/* Ensure no whitespace inside td */}
                          </tr>
                        ))}
                      </tbody>{/* Ensure no whitespace before/after map */}
                    </table>
                    <div className="mt-4 text-center">
                       <Link href={userId ? `/leaderboard?userid=${userId}` : "/leaderboard"} className="text-accent-blue hover:underline">
                         View Full Leaderboard
                       </Link>
                    </div>
                  </div>
                </section>
              </div>
            </>
          ) : (
            // Content shown when no user is logged in
            <div className="text-center strava-card py-10">
              <h1 className="text-3xl font-bold mb-4">Welcome to Strava!</h1>
              <p className="text-gray-medium mb-6">Track your runs, connect with friends, and hit your goals.</p>
              <div className="space-x-4">
                 <Link href="/signup" className="btn-strava">Sign Up</Link>
                 <Link href="/signin" className="nav-link border border-gray-300 px-4 py-2 rounded">Sign In</Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

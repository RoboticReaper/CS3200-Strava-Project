"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from 'next/navigation'; // Import useSearchParams

export default function RunsPage() {
  const [runs, setRuns] = useState([]);
  const searchParams = useSearchParams(); // Get search params
  const userId = searchParams.get('userid'); // Get userId from query
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [formData, setFormData] = useState({ // State for form inputs
    distance: '',
    duration: '',
    time: '', // Consider using a date-time picker input type
    calories: '',
    avg_pace: ''
  });
  // Add state for current user's leaderboard totals
  const [currentUserTotals, setCurrentUserTotals] = useState({ distance: 0, time: 0 });

  // Function to fetch runs - extracted for reuse
  const fetchRuns = () => {
    if (userId) {
      fetch(`http://localhost:4000/runs/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setRuns(data);
          // Calculate initial totals from fetched runs
          const initialDistance = data.reduce((acc, run) => acc + parseFloat(run.distance || 0), 0);
          const initialTime = data.reduce((acc, run) => acc + parseFloat(run.duration || 0), 0);
          setCurrentUserTotals({ distance: initialDistance, time: initialTime });
        })
        .catch((err) => console.error(`Error fetching runs for user ${userId}:`, err));
    } else {
      setRuns([]);
      setCurrentUserTotals({ distance: 0, time: 0 }); // Reset totals if no user
      console.log("No user ID found in URL.");
    }
  };

  useEffect(() => {
    fetchRuns(); // Call fetchRuns on initial load and when userId changes
  }, [userId]);

  // Function to handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Updated function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      console.error("Cannot submit run: User ID is missing.");
      // Optionally show an error message to the user
      return;
    }

    const runData = {
      ...formData,
      user_id: parseInt(userId), // Ensure userId is an integer if required by backend
      // Convert numeric fields from string to number
      distance: parseFloat(formData.distance),
      duration: parseFloat(formData.duration),
      calories: parseFloat(formData.calories),
      avg_pace: parseFloat(formData.avg_pace),
      // Ensure time is in the correct format (e.g., ISO string) if needed by backend
      // The 'datetime-local' input type usually provides a suitable format
      time: formData.time
    };

    console.log("Submitting run data:", runData);

    try {
      const response = await fetch('http://localhost:4000/runs/', { // Assuming '/runs' is the endpoint for creating runs
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(runData),
      });

      if (!response.ok) {
        // Handle HTTP errors
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Run created successfully
      console.log('Run created successfully');

      // --- Start: Update Leaderboard Locally ---
      try {
        // 1. Calculate new totals locally
        const newTotalDistance = currentUserTotals.distance + runData.distance;
        const newTotalTime = currentUserTotals.time + runData.duration;

        // 2. Make PUT request to update leaderboard with new totals
        const updateLeaderboardRes = await fetch('http://localhost:4000/leaderboard', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: parseInt(userId),
            total_distance: parseFloat(newTotalDistance.toFixed(2)), // Send updated total
            total_time: parseFloat(newTotalTime.toFixed(2)),       // Send updated total
          }),
        });

        if (!updateLeaderboardRes.ok) {
           const errorData = await updateLeaderboardRes.json();
           throw new Error(errorData.message || `Failed to update leaderboard: ${updateLeaderboardRes.status}`);
        }

        console.log('Leaderboard updated successfully for user:', userId);

        // 3. Update local state for totals
        setCurrentUserTotals({ distance: newTotalDistance, time: newTotalTime });

      } catch (leaderboardError) {
        console.error("Error updating leaderboard:", leaderboardError);
        // Optionally alert the user about the leaderboard update failure
        // alert(`Run saved, but failed to update leaderboard: ${leaderboardError.message}`);
      }
      // --- End: Update Leaderboard Locally ---

      // Reset form and close modal
      setFormData({ distance: '', duration: '', time: '', calories: '', avg_pace: '' });
      setShowModal(false);

      // Refetch runs to update the list (this will also recalculate totals, ensuring consistency)
      fetchRuns();

    } catch (error) {
      console.error("Error submitting run:", error);
      // Optionally: Show an error message to the user in the UI
      alert(`Error submitting run: ${error.message}`); // Simple alert for feedback
    }
  };

  return (
    <div className="min-h-screen bg-gray-light">
      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Running Log</h1>
            <button onClick={() => setShowModal(true)} className="btn-strava">Record Activity</button>
          </div>
          <div className="stats-container mb-8">
            <div className="stat-card">
              <div className="stat-value">{runs.length}</div>
              <div className="stat-label">Activities</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {/* Use state for total distance */}
                {currentUserTotals.distance.toFixed(1)}
              </div>
              <div className="stat-label">Total Distance (km)</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {runs.reduce((acc, run) => acc + parseInt(run.calories), 0)}
              </div>
              <div className="stat-label">Total Calories</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {(
                  runs.reduce((acc, run) => acc + parseFloat(run.duration), 0) /
                    runs.length || 0
                ).toFixed(0)}
              </div>
              <div className="stat-label">Avg Time (min)</div>
            </div>
          </div>
          <div className="space-y-4">
            {/* Add a check for userId before mapping runs */}
            {!userId && <p className="text-center text-gray-medium">Please log in to view your runs.</p>}
            {userId && runs.length === 0 && <p className="text-center text-gray-medium">No runs recorded yet.</p>}
            {userId && runs.map((run, index) => (
              <div key={run.id || index} className="strava-card hover:cursor-pointer"> {/* Use run.id for key */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gray-light rounded-full flex items-center justify-center">
                        🏃‍♂️ {/* Could potentially show user avatar if fetched */}
                      </div>
                      <div>
                        {/* Removed user_name as it's the current user's log */}
                        {/* Update date format to include time */}
                        <h3 className="font-semibold">Run on {new Date(run.time || Date.now()).toLocaleString()}</h3> {/* Example: Show date and time */}
                        <p className="text-sm text-gray-medium">Activity Details</p> {/* Generic title */}
                      </div>
                    </div>
                    {/* Adjust grid columns to fit new data */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-4">
                      <div>
                        <div className="text-sm text-gray-medium">Distance</div>
                        <div className="font-semibold">{run.distance} km</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-medium">Duration</div>
                        <div className="font-semibold">{run.duration} min</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-medium">Pace</div>
                        <div className="font-semibold">{run.avg_pace} /km</div>
                      </div>
                      {/* Add Calories display */}
                      <div>
                        <div className="text-sm text-gray-medium">Calories</div>
                        <div className="font-semibold">{run.calories}</div>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/map?id=${run.id}`}
                    className="text-accent-blue hover:underline text-sm"
                  >
                    View Map
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal for Recording Activity */}
      {showModal && (
        // Add bg-black bg-opacity-50 and backdrop-blur-sm for blurred background effect
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm bg-black/10">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-300">
            <h2 className="text-xl font-semibold mb-6">Record New Run</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 mb-6">
                <input
                  type="number"
                  name="distance"
                  placeholder="Distance (km)"
                  value={formData.distance}
                  onChange={handleInputChange}
                  // Add border class
                  className="input-field border border-gray-300 p-2 rounded"
                  required
                  step="0.01"
                />
                <input
                  type="number"
                  name="duration"
                  placeholder="Duration (minutes)"
                  value={formData.duration}
                  onChange={handleInputChange}
                  // Add border class
                  className="input-field border border-gray-300 p-2 rounded"
                  required
                  step="0.1"
                />
                <input
                  type="datetime-local" // Use datetime-local for date and time input
                  name="time"
                  placeholder="Time"
                  value={formData.time}
                  onChange={handleInputChange}
                  // Add border class
                  className="input-field border border-gray-300 p-2 rounded"
                  required
                />
                <input
                  type="number"
                  name="calories"
                  placeholder="Calories Burned"
                  value={formData.calories}
                  onChange={handleInputChange}
                  // Add border class
                  className="input-field border border-gray-300 p-2 rounded"
                  required
                />
                <input
                  type="number"
                  name="avg_pace"
                  placeholder="Average Pace (min/km)"
                  value={formData.avg_pace}
                  onChange={handleInputChange}
                  // Add border class
                  className="input-field border border-gray-300 p-2 rounded"
                  required
                  step="0.01"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary" // Add appropriate styling
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-strava"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Basic input field styling (add to your global CSS or component styles)
/*
.input-field {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  width: 100%;
}
.btn-secondary {
  padding: 0.5rem 1rem;
  border: 1px solid #cbd5e1;
  background-color: white;
  color: #4a5568;
  border-radius: 0.375rem;
  cursor: pointer;
}
.btn-secondary:hover {
  background-color: #f7fafc;
}
*/

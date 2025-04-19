'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get IDs from URL parameters
  // viewUserId: The ID of the profile being viewed
  // userid: Assumed to be the ID of the currently logged-in user
  const viewProfileId = searchParams.get('viewUserId');
  const loggedInUserId = searchParams.get('userid');

  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // Separate state for saving indication
  const [error, setError] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State for success modal

  // Fetch profile data
  useEffect(() => {
    if (!viewProfileId) {
      setError("No profile user ID specified in the URL (expected 'viewUserId').");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setProfileData(null); // Reset profile data on ID change
    setIsEditing(false); // Reset editing state

    fetch(`http://localhost:4000/users/${viewProfileId}`)
      .then(res => {
        if (res.status === 404) {
            throw new Error("Profile not found.");
        }
        if (!res.ok) {
          throw new Error(`Failed to fetch profile (Status: ${res.status})`);
        }
        return res.json();
      })
      .then(data => {
        if (data && data.length > 0) {
          const userData = data[0];
          setProfileData(userData);
          // Initialize formData with fetched data, including fields needed for PUT
          setFormData({
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            email: userData.email || '',
            profile_hidden: userData.profile_hidden, // Keep existing value
            is_flagged: userData.is_flagged,       // Keep existing value
          });
          // Check if it's the logged-in user's profile
          setIsOwnProfile(loggedInUserId && loggedInUserId === viewProfileId);
        } else {
          // Handle case where API returns 200 OK but empty array
          throw new Error("Profile data is empty.");
        }
      })
      .catch(err => {
        console.error("Error fetching profile:", err);
        setError(err.message);
        setProfileData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [viewProfileId, loggedInUserId]); // Rerun if either ID changes

  // Handle input changes (updated for checkbox)
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Toggle edit mode
  const handleEditToggle = () => {
    if (isEditing && profileData) {
      // If canceling, reset form data to original profile data
      setFormData({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        email: profileData.email || '',
        profile_hidden: profileData.profile_hidden,
        is_flagged: profileData.is_flagged,
      });
    }
    setIsEditing(!isEditing);
  };

  // Handle save changes
  const handleSave = async (e) => {
    e.preventDefault();
    if (!isOwnProfile || !profileData) return;

    setSaving(true); // Indicate saving process
    setError(null);

    // Construct payload - ensure all required fields for PUT are present
    // Ensure boolean values are actual booleans if needed by API
    const updatePayload = {
        ...formData, // Use the current form data
        profile_hidden: !!formData.profile_hidden, // Ensure boolean
        is_flagged: !!formData.is_flagged,       // Ensure boolean
    };

    try {
      const response = await fetch(`http://localhost:4000/users/${viewProfileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update profile (Status: ${response.status})`);
      }

      // Update successful
      // Update profileData state with the new data from the form
      setProfileData(prev => ({ ...prev, ...formData }));
      setIsEditing(false); // Exit edit mode
      // alert("Profile updated successfully!"); // Replace alert with modal
      setShowSuccessModal(true); // Show success modal

    } catch (err) {
      console.error("Error updating profile:", err);
      setError(`Error updating profile: ${err.message}`);
      alert(`Error updating profile: ${err.message}`); // Show error to user
    } finally {
      setSaving(false);
    }
  };

  // Render logic
  if (loading) return <div className="pt-20 text-center">Loading profile...</div>;
  if (error) return <div className="pt-20 text-center text-red-600">Error: {error}</div>;
  if (!profileData) return <div className="pt-20 text-center">Profile not found or could not be loaded.</div>;

  // Check if the profile is hidden and not viewed by the owner
  if (profileData.profile_hidden && !isOwnProfile) {
    return (
      <main className="max-w-2xl mx-auto p-4 md:p-8 text-center">
        <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-700">Profile is Private</h1>
          <p className="text-gray-500 mt-2">This user has chosen to keep their profile private.</p>
        </div>
      </main>
    );
  }

  // Render profile details if not hidden or if it's the owner's profile
  return (
    <main className="max-w-2xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
        {profileData.first_name} {profileData.last_name}'s Profile
      </h1>

      {saving && <div className="text-center text-blue-600 mb-4">Saving changes...</div>}

      <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className="input mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-strava-orange focus:border-strava-orange sm:text-sm"
                required
                disabled={saving}
              />
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className="input mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-strava-orange focus:border-strava-orange sm:text-sm"
                required
                disabled={saving}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-strava-orange focus:border-strava-orange sm:text-sm"
                required
                disabled={saving}
              />
            </div>
            {/* Note: is_flagged is not editable here but is preserved */}
            {/* Add Checkbox for profile_hidden */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="profile_hidden"
                name="profile_hidden"
                checked={!!formData.profile_hidden} // Ensure boolean for checked state
                onChange={handleInputChange}
                className="h-4 w-4 text-strava-orange border-gray-300 rounded focus:ring-strava-orange"
                disabled={saving}
              />
              <label htmlFor="profile_hidden" className="ml-2 block text-sm text-gray-900">
                Hide Profile from Leaderboards and Public View
              </label>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={handleEditToggle}
                className="btn-secondary" // Use existing style
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-strava" // Use existing style
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 text-gray-700">
            <p><strong>First Name:</strong> {profileData.first_name}</p>
            <p><strong>Last Name:</strong> {profileData.last_name}</p>
            <p><strong>Email:</strong> {profileData.email}</p>
            {/* Fixed missing closing span tag */}
            <p><strong>User ID:</strong> <span className="font-mono bg-gray-100 px-1 rounded">{profileData.id}</span></p>
            {/* Optionally display other non-editable fields for info */}
            <p><strong>Profile Hidden:</strong> {profileData.profile_hidden ? 'Yes' : 'No'}</p>
            {/* Display is_flagged status */}
            <p><strong>Account Flagging:</strong> <span className={profileData.is_flagged ? 'text-red-600 font-semibold' : 'text-green-600'}>{profileData.is_flagged ? 'Flagged' : 'Normal'}</span></p>

            {isOwnProfile && (
              <div className="mt-6 text-right border-t pt-4">
                <button
                  onClick={handleEditToggle}
                  className="btn-strava" // Use existing style
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        )}
      </div>
       {/* Placeholder: Add sections for user's runs, stats, groups etc. below */}
       {/* Example: <UserActivity userId={viewProfileId} /> */}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm bg-black/30">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm border border-gray-300 text-center">
            <h2 className="text-xl font-semibold mb-4 text-green-600">Success!</h2>
            <p className="mb-6">Your profile has been updated successfully.</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="btn-strava" // Or another appropriate style
            >
              OK
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

// Basic input field styling (add to your global CSS or component styles if needed)
/*
.input {
  // Basic input styling
}
.btn-strava {
  // Strava button styling (ensure this exists globally or define here/import)
  background-color: #fc4c02;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s ease-in-out;
}
.btn-strava:hover {
  background-color: #db4000;
}
.btn-strava:disabled {
  background-color: #fd8c5a;
  cursor: not-allowed;
  opacity: 0.7;
}
.btn-secondary {
  // Secondary button styling (ensure this exists globally or define here/import)
  padding: 0.5rem 1rem;
  border: 1px solid #cbd5e1;
  background-color: white;
  color: #4a5568;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s ease-in-out;
}
.btn-secondary:hover {
  background-color: #f7fafc;
}
.btn-secondary:disabled {
  background-color: #e2e8f0;
  cursor: not-allowed;
   opacity: 0.7;
}
*/

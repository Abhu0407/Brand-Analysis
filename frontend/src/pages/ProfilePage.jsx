import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Landmark, GanttChartSquare, Save } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const [formData, setFormData] = useState({
    // This part is fine, but it's better to initialize inside the component
    // We'll update this slightly for reliability
    brandName: authUser?.brandName || "",
    timeline: authUser?.timeline || "month",
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(formData);
  };

  // --- (FIX 1) ---
  // Add a guard clause. If authUser is not loaded, show a loading message
  // instead of trying to render the profile with 'null' data.
  if (!authUser) {
    return (
      <div className="h-screen pt-20 flex justify-center items-center">
        {/* You can replace this with a DaisyUI spinner */}
        {/* <span className="loading loading-spinner loading-lg"></span> */}
        <p className="text-lg">Loading profile...</p>
      </div>
    );
  }

  // --- If authUser IS loaded, the rest of the component renders: ---
  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold ">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* avatar upload section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                // --- (FIX 2) ---
                // Added optional chaining '?' to prevent crash if authUser is null
                src={selectedImg || authUser?.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 "
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          {/* Static Info Section */}
          {/* This section will now render correctly because of FIX 1 */}
          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.fullName}</p>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
            </div>
          </div>

          {/* Form Section */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* --- Brand Name Input --- */}
              <div className="space-y-1.5">
                <label
                  htmlFor="brandName"
                  className="text-sm text-zinc-400 flex items-center gap-2 cursor-pointer"
                >
                  <Landmark className="w-4 h-4" />
                  Brand Name
                </label>
                <input
                  type="text"
                  id="brandName"
                  name="brandName"
                  value={formData.brandName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-base-200 rounded-lg border"
                  placeholder="Your company name"
                  disabled={isUpdatingProfile}
                />
              </div>

              {/* --- Time Line Preference Input --- */}
              <div className="space-y-1.5">
                <label
                  htmlFor="timeline"
                  className="text-sm text-zinc-400 flex items-center gap-2 cursor-pointer"
                >
                  <GanttChartSquare className="w-4 h-4" />
                  Time Line Preference
                </label>
                <select
                  id="timeline"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-base-200 rounded-lg border appearance-none"
                  disabled={isUpdatingProfile}
                >
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                </select>
              </div>

              {/* --- Submit Button --- */}
              <div>
                <button
                  type="submit"
                  className={`flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors
                    ${isUpdatingProfile ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                  disabled={isUpdatingProfile}
                >
                  <Save className="w-4 h-4" />
                  {isUpdatingProfile ? "Updating..." : "Update Preferences"}
                </button>
              </div>
            </form>
          </div>

          
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;
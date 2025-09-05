import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import singupImage from "../../public/onBoard2.png";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { onboard } from "../lib/api";

const OnBoardingPage = () => {
  const [formData, setFormData] = useState({
    profilePic: `https://api.dicebear.com/7.x/adventurer/svg?seed=${Math.random()}`,
    fullName: "",
    bio: "",
    nativeLanguage: "",
    learningLanguage: "",
    location: "",
  });

  const generateAvatar = () => {
    setFormData({
      ...formData,
      profilePic: `https://api.dicebear.com/7.x/adventurer/svg?seed=${Math.random()}`,
    });
  };
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = useMutation({
    mutationFn: onboard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Onboard Successful!");
      setFormData({ fullName: "", email: "", password: "" });
    },
    onError: () => {
          toast.error(error.res.data.message);
        },
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.fullName ||
      !formData.bio ||
      !formData.nativeLanguage ||
      !formData.learningLanguage ||
      !formData.location
    ) {
      toast.error("All fields are required!");
      return;
    }
    console.log("Form Data:", formData);
    mutate(formData);
  };

  return (
    <div
      className="min-h-screen bg-base-200 flex items-center justify-center px-6 py-12 md:px-12 lg:px-24"
      data-theme="forest"
    >

      <div className="flex flex-col md:flex-row w-full max-w-6xl shadow-2xl rounded-2xl overflow-hidden bg-base-100">
        {/* Left Column */}
        <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-12 lg:p-16 space-y-8">
          <div>
            <h1
              className="sm:text-5xl text-4xl font-bold text-transparent bg-clip-text 
                         bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 
                         animate-gradient font-orbitron text-center md:text-left"
              style={{ backgroundSize: "200% 200%" }}
            >
              Linkee
            </h1>
            <h2 className="text-3xl font-semibold mt-2 text-center md:text-left">
              Complete Your Profile
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <img
                src={formData.profilePic}
                alt="Avatar"
                className="w-24 h-24 rounded-full border-4 border-green-400 shadow-md"
              />
              <button
                type="button"
                onClick={generateAvatar}
                className="btn btn-outline btn-primary btn-sm"
              >
                Generate Random Avatar
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text text-base">Full Name</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text text-base">Bio</span>
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="textarea textarea-bordered w-full"
                  placeholder="Tell us something about yourself..."
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text text-base">Native Language</span>
                </label>
                <input
                  type="text"
                  name="nativeLanguage"
                  value={formData.nativeLanguage}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="E.g. English, Hindi, Spanish..."
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text text-base">
                    Learning Language
                  </span>
                </label>
                <input
                  type="text"
                  name="learningLanguage"
                  value={formData.learningLanguage}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="E.g. French, Japanese, German..."
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text text-base">Location</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="City, Country"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              disabled={isPending}
              type="submit"
              className="btn btn-success w-full hover:scale-105 transition-transform duration-200"
            >
              Save & Continue
            </button>
          </form>
        </div>

        {/* Right Column */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-base-100 p-6">
          <img
            src={singupImage}
            alt="Onboarding Illustration"
            className="max-w-xs md:max-w-md lg:max-w-lg mx-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default OnBoardingPage;

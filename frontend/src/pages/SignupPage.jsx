import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import singupImage from "../../public/signup.png";
import { Link } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../lib/api";

const SignupPage = () => {
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const queryClient = useQueryClient()
  const {mutate, isPending, error} = useMutation({
    mutationFn: signup,
    onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["authUser"] });
  toast.success("Signup Successful!");
  setSignupData({ fullName: "", email: "", password: "" });
}
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const handleChange = (e) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value,
    });
    console.log(signupData);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!signupData.fullName || !signupData.email || !signupData.password) {
      toast.error("All fields are required!");
      return;
    }
      if (signupData.password.length < 6) {
    toast.error("Password must be at least 6 characters!");
    return;
  }
  if(!acceptedTerms){
    toast.error("Please accept our terms and conditions");
    return;
  }
    mutate(signupData);
  };
  return (
    <div
      className="min-h-screen bg-base-200 flex items-center justify-center px-6 py-12 md:px-12 lg:px-24"
      data-theme="forest"
    >
      <div className="flex flex-col md:flex-row w-full max-w-6xl shadow-2xl rounded-2xl overflow-hidden bg-base-100 gap-y-8 md:gap-y-0 md:gap-x-12 p-6 md:p-12 lg:p-16 animate-fade-in">
        {/* Left Column - Form */}
        <div className="w-full md:w-1/2 space-y-8 animate-slide-in-left">
          <h1
            className="sm:text-5xl text-4xl font-bold text-transparent bg-clip-text 
                       bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 
                       animate-gradient font-orbitron"
            style={{ backgroundSize: "200% 200%" }}
          >
            Linkee
          </h1>
          {error && <div className="text-red-500">{error.response?.data?.message}</div>}

          <h2 className="text-3xl font-semibold">Create your account</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">
                <span className="label-text text-base">Full Name</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={signupData.fullName}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="JohnDoe"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text text-base">Email</span>
              </label>
              <input
                type="email"
                name="email"
                value={signupData.email}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text text-base">Password</span>
              </label>
              <input
                type="password"
                name="password"
                value={signupData.password}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="••••••••"
              />
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="checkbox mt-1"
              />
              <span className="text-sm">
                I agree to the{" "}
                <button
                  type="button"
                  className="text-blue-500 underline"
                  onClick={() => setShowModal(true)}
                >
                  Terms & Conditions
                </button>
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-success w-full hover:scale-105 transition-transform duration-200"
            >
              {isPending ? "Signing..." : "Create Account"}
            </button>
            <div className="mt-4 text-center">
      <p className="text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-blue-600 hover:underline font-medium"
        >
          Log in here
        </Link>
      </p>
    </div>
          </form>
        </div>

        {/* Right Column - Image */}
        <div className="w-full md:w-[50%] flex items-center justify-center animate-slide-in-right">
          <img
            src={singupImage}
            alt="Signup Illustration"
            className="max-w-xs md:max-w-md lg:max-w-lg mx-auto sm:scale-125 scale-60"
          />
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-base-100 max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6 rounded-lg shadow-lg relative">
            <h2 className="text-2xl font-bold mb-4">Terms & Conditions</h2>
            <div className="space-y-4 text-sm">
              <p>
                These Terms and Conditions govern your use of the chat and video call platform ("Service") operated by Aayush Bhadula ("we", "us", or "our").
              </p>
              <p>
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part, you may not access the Service.
              </p>

              <h3 className="font-semibold">1. User Accounts</h3>
              <p>
                You must provide accurate information and are responsible for maintaining your account's security.
              </p>

              <h3 className="font-semibold">2. Use of Service</h3>
              <ul className="list-disc pl-5">
                <li>Do not harass, abuse, or violate others’ rights.</li>
                <li>Do not transmit illegal or offensive content.</li>
                <li>Do not interfere with our systems.</li>
              </ul>

              <h3 className="font-semibold">3. Content Ownership</h3>
              <p>
                You retain ownership of your content, but we may store or transmit it to provide the Service.
              </p>

              <h3 className="font-semibold">4. Call and Chat Recording</h3>
              <p>
                Recording features may require legal consent based on your jurisdiction.
              </p>

              <h3 className="font-semibold">5. Termination</h3>
              <p>
                We may suspend your account if you violate these Terms.
              </p>

              <h3 className="font-semibold">6. Disclaimer</h3>
              <p>
                The service is provided “as is” with no warranties.
              </p>

              <h3 className="font-semibold">7. Limitation of Liability</h3>
              <p>
                We are not liable for any indirect or consequential damages.
              </p>

              <h3 className="font-semibold">8. Governing Law</h3>
              <p>
                These Terms are governed by the laws of India.
              </p>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="btn btn-sm btn-error mt-6"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupPage;

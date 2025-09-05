import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import loginImage from "../../public/login.png"; // You can replace with a proper login illustration
import { Link } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../lib/api"; // You'll need to implement this API call

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Login Successful!");
      setFormData({ email: "", password: "" });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || "Invalid credentials, please try again.";
      toast.error(errorMessage);
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
    if (!formData.email || !formData.password) {
      toast.error("Both fields are required!");
      return;
    }
    mutate(formData);
  };

  return (
    <div
      className="min-h-screen bg-base-200 flex items-center justify-center px-6 py-12 md:px-12 lg:px-24"
      data-theme="forest"
    >

      <div className="flex flex-col md:flex-row w-full max-w-4xl shadow-2xl rounded-2xl overflow-hidden bg-base-100">
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
              Welcome Back
            </h2>
            <p className="text-center md:text-left text-sm opacity-70">
              Please login to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="label">
                <span className="label-text text-base">Email</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="label">
                <span className="label-text text-base">Password</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="********"
              />
            </div>

            {/* Submit */}
            <button
              disabled={isPending}
              type="submit"
              className="btn btn-success w-full hover:scale-105 transition-transform duration-200"
            >
              {isPending ? "Logging in..." : "Login"}
            </button>

            {/* Register Link */}
            <p className="text-center text-sm">
              Don’t have an account?{" "}
              <Link
                to="/signup"
                className="text-primary hover:underline font-medium"
              >
                Sign Up
              </Link>
            </p>
          </form>
        </div>

        {/* Right Column */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-base-100 p-6">
          <img
            src={loginImage}
            alt="Login Illustration"
            className="max-w-xs md:max-w-md lg:max-w-lg mx-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

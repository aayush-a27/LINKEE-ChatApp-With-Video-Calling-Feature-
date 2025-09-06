import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { upsertStreamUser } from "../lib/stream.js";

// Utility function to sanitize log inputs
const sanitizeForLog = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/[\r\n\t]/g, '_').substring(0, 100);
};
export async function signup(req, res) {
  const { fullName, email, password } = req.body;
  console.log(fullName);
  try {
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "length of the password must be greater than 6" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message:
          "User already exist with this email, please user different one",
      });
    }
    const index = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${index}.png`;

    const newUser = await User.create({
      fullName,
      email,
      password,
      profilePic: randomAvatar,
    });

    try {
      await upsertStreamUser({
        id: newUser._id,
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
      console.log(`Stream user is created ${sanitizeForLog(newUser.fullName)}`);
    } catch (error) {
      console.log("Error creating Stream user : ", error);
    }

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
}
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "please provide email or password" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or pasword" });
    }
    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or pasword" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ success: true, user, message: "user logged in" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
}
export function logout(req, res) {
  res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "user logged out" });
}
export async function onboard(req, res) {
  try {
    const userId = req.user._id;
    const { fullName, bio, nativeLanguage, learningLanguage, location } =
      req.body;
    if (
      !fullName ||
      !bio ||
      !nativeLanguage ||
      !learningLanguage ||
      !location
    ) {
      return res
        .status(400)
        .json({
          message: "All fields are required",
          missingFields: [
            !fullName && "fullName",
            !bio && "bio",
            !nativeLanguage && "nativeLanguage",
            !learningLanguage && "learningLanguage",
            !location && "location",
          ].filter(Boolean),
        });
    }
    const updatedUser = await User.findByIdAndUpdate(userId,{
      ...req.body,
      isOnBoarding:true,
    },{new:true})
    if(!updatedUser){
      return res.status(404).json({message:"User not found"});
    }
    try {
      await upsertStreamUser({
      id: updatedUser._id.toString(),
      name:updatedUser.fullName,
      image:updatedUser.profilePic||"",
    });
    console.log(`Stream user updated after onboarding for ${sanitizeForLog(updatedUser.fullName)}`);
    } catch (error) {
      console.log("Error updating Stream user during onboarding : ", error.message);
    }
    res.status(200).json({success:true, user:updatedUser})
  } catch (error) {
    console.log(error);
    res.status(500).json({message:"Internal server error"});
  }
}

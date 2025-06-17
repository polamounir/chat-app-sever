import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import fs from "fs/promises";

import jwt from "jsonwebtoken";

/**
 * Validates email format
 * @param {string} email
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Creates a new user with profile picture handling
 * @param {Object} userData
 * @param {Object} fileData
 * @param {string} baseUrl
 * @returns {Promise<Object>}
 */

/**
 * Gets all active users
 * @returns {Promise<Array>}
*/

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
export const createUserService = async (
  userData,
  fileData = null,
  baseUrl = process.env.BASE_URL || "http://localhost:5000"
) => {
  const { name, email, password } = userData;

  // Validate required fields
  if (!name || !email || !password) {
    throw new Error("Name, email, and password are required fields");
  }

  // Validate email format
  if (!isValidEmail(email)) {
    throw new Error("Invalid email format");
  }

  // Validate password strength
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (fileData) {
        await fs.unlink(fileData.path);
      }
      throw new Error("Email already registered");
    }

    // Add profile picture path if file was uploaded
    if (fileData) {
      userData.profilePicture = `${baseUrl}/uploads/${fileData.filename}`;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Prepare response
    const userResponse = newUser.toObject();
    delete userResponse.password;
    delete userResponse.tokens;

    if (userResponse.profilePicture && baseUrl) {
      userResponse.profilePicture = `${baseUrl}/${userResponse.profilePicture}`;
    }

    return userResponse;
  } catch (error) {
    if (fileData) {
      try {
        await fs.unlink(fileData.path);
      } catch (unlinkError) {
        console.error("Error deleting uploaded file:", unlinkError);
      }
    }
    throw error;
  }
};

// -----------------------------------------------
export const loginUserService = async (email, password) => {
  const user = await User.findOne({ email }).select("+password +tokens");
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  // Generate access token
  const accessToken = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "1d" }
  );


  // Generate refresh token
  const refreshToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });

  // Save refresh token to user (optional: rotate or limit tokens)
  user.refreshTokens = user.refreshTokens || [];
  user.refreshTokens.push(refreshToken);

  await user.save();

  // Prepare user response without sensitive info
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.tokens;

  return {
    email: userResponse.email,
    name: userResponse.name,
    accessToken,
    refreshToken,
  };
};

export const refreshTokenService = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("Refresh token not provided");
  }

  try {
 
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    // console.log("Decoded refresh token:", decoded);

 
    const user = await User.findOne({ email: decoded.email }).select(
      "+refreshTokens"
    );

    if (!user) {
      throw new Error("User not found");
    }

    const tokenIsValid = user.refreshTokens.includes(refreshToken);
    // console.log("Token is valid:", tokenIsValid);

    if (!tokenIsValid) {
      throw new Error("Invalid refresh token");
    }

    
    const accessToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m" }
    );

 
    const newRefreshToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
    );

 
    const index = user.refreshTokens.indexOf(refreshToken);
    if (index !== -1) {
      user.refreshTokens[index] = newRefreshToken;
    }

    await user.save();

    return { accessToken, refreshToken: newRefreshToken, email: user.email };
  } catch (err) {
    console.error(err);
    throw new Error("Invalid or expired refresh token");
  }
};

// ----------------------------------------------------------------

export const getUserByIdService = async (id) => {
  try {
    const user = await User.findById(id).select("-password -tokens");
    return user;
  } catch (error) {
    throw new Error("Error fetching user: " + error.message);
  }
};
// ------------------------------------------------------------
export const getUserInfoService = async (userId) => {


  try {
    // Fetch user info from the database
    const user = await User.findById(userId).select(
      "-password  -__v  -updatedAt -accessTokens -refreshTokens"
    );
    if (!user) {
      throw new Error("User not found");
    }

    // Prepare and format the user response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.accessTokens;
    delete userResponse.refreshTokens;

    // if (userResponse.profilePicture && process.env.BASE_URL) {
    //   userResponse.profilePicture = `${process.env.BASE_URL}/${userResponse.profilePicture}`;
    // }

    return userResponse;
  } catch (error) {
    throw new Error("Error fetching user info: " + error.message);
  }
};

// ----------------------------------------------
export const getAllUsersService = async () => {
  try {
    const users = await User.find({ isActive: true })
      .select("-password -tokens")
      .sort({ createdAt: -1 });
    return users;
  } catch (error) {
    throw new Error("Error fetching users: " + error.message);
  }
};

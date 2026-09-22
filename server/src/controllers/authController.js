import User from "../models/User.js";

import generateToken from "../utils/generateToken.js";

export const registerUser =
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        department,
      } = req.body;

      if (
        !name ||
        !email ||
        !password
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Name, email and password are required",
          });
      }

      if (
        password.length < 6
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Password must contain at least 6 characters",
          });
      }

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      const existingUser =
        await User.findOne({
          email:
            normalizedEmail,
        });

      if (existingUser) {
        return res
          .status(409)
          .json({
            success: false,

            message:
              "User with this email already exists",
          });
      }

      const user =
        await User.create({
          name,
          email:
            normalizedEmail,
          password,
          department,

          role: "student",

          isActive: true,
        });

      const token =
        generateToken(
          user._id
        );

      res.status(201).json({
        success: true,

        message:
          "Registration successful",

        token,

        user: {
          id: user._id,
          name: user.name,
          email:
            user.email,
          role: user.role,

          department:
            user.department,

          isActive:
            user.isActive,
        },
      });
    } catch (error) {
      console.error(
        "Register error:",
        error
      );

      if (
        error.code === 11000
      ) {
        return res
          .status(409)
          .json({
            success: false,

            message:
              "User with this email already exists",
          });
      }

      res.status(500).json({
        success: false,

        message:
          "Server error during registration",
      });
    }
  };

export const loginUser =
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      if (
        !email ||
        !password
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Email and password are required",
          });
      }

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      const user =
        await User.findOne({
          email:
            normalizedEmail,
        }).select(
          "+password"
        );

      if (!user) {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "Invalid email or password",
          });
      }

      if (
        user.isActive ===
        false
      ) {
        return res
          .status(403)
          .json({
            success: false,

            message:
              "Your account has been deactivated. Please contact the administrator.",
          });
      }

      const passwordMatches =
        await user.comparePassword(
          password
        );

      if (!passwordMatches) {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "Invalid email or password",
          });
      }

      const token =
        generateToken(
          user._id
        );

      res.status(200).json({
        success: true,

        message:
          "Login successful",

        token,

        user: {
          id: user._id,
          name: user.name,
          email:
            user.email,
          role: user.role,

          department:
            user.department,

          isActive:
            user.isActive,
        },
      });
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      res.status(500).json({
        success: false,

        message:
          "Server error during login",
      });
    }
  };

export const getMyProfile =
  async (req, res) => {
    res.status(200).json({
      success: true,

      user: {
        id:
          req.user._id,

        name:
          req.user.name,

        email:
          req.user.email,

        role:
          req.user.role,

        department:
          req.user.department,

        isActive:
          req.user.isActive,
      },
    });
  };
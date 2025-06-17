import { Router } from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  getUserInfo,
  loginUser,
  refreshUserToken,

} from "../controllers/auth.controller.js";
import upload from "../middlewares/multer.js";
import { tokenValidate } from "../middlewares/tokenValidate.js";

const router = Router();

// Public routes
router.get("/", getAllUsers);
router.post("/register", upload.single("profilePicture"), createUser);
router.post("/login", loginUser);
router.post("/refresh", refreshUserToken);

// Protected routes
router.get("/me", tokenValidate, getUserInfo);

// router.get("/:id", tokenValidate, getUserById);

export default router;

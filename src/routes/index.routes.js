import { Router } from "express";
import authRoutes from "./auth.route.js";
import searchRoutes from "./search.route.js";
import userRoutes from "./user.route.js";
const router = Router();

router.use("/auth", authRoutes);
router.use("/", searchRoutes);
router.use("/user", userRoutes);


export default router;

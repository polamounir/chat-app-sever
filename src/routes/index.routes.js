import { Router } from "express";
import authRoutes from "./auth.route.js";
import searchRoutes from "./search.route.js";
import userRoutes from "./user.route.js";
const router = Router();

router.use("/auth", authRoutes);
router.use("/", searchRoutes);
router.use("/user", userRoutes);
router.get("/test", (req, res) => {
  res.send("Test route is working!");
});

export default router;

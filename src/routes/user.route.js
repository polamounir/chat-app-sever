import { Router } from "express";

import { tokenValidate } from "../middlewares/tokenValidate.js";
import { getFriends } from "../controllers/user.controller.js";

const router = Router();


router.get("/",tokenValidate, getFriends);

;

export default router;
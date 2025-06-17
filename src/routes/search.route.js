// routes/user.route.js
import { Router } from "express";
import {
  addFriend,
  // getAllUsers,
  searchUser,
  addFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend
} from "../controllers/search.controller.js";
import { tokenValidate } from "../middlewares/tokenValidate.js";

const router = Router();

// router.get("/", getAllUsers);
router.get("/search", tokenValidate, searchUser);
router.post("/friend/add/:userId", tokenValidate, addFriend);
router.post("/friend/request/:userId", tokenValidate, addFriendRequest);
router.delete("/friend/reject/:userId", tokenValidate, rejectFriendRequest);
router.delete("/friend/cancel/:userId", tokenValidate, cancelFriendRequest);
router.delete("/friend/remove/:userId", tokenValidate, removeFriend);


// router.post("/friend/remove/:userId", tokenValidate, removeFriend);


export default router;

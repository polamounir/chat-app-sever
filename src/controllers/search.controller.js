import { addFriendRequestService, addFriendService, cancelFriendRequestService, rejectFriendRequestService, removeFriendService, searchUserService } from "../services/search.service.js";
import { sendError, sendSuccess } from "../utils/response.js";

export const searchUser = async (req, res) => {
  const { query, page = 1, limit = 10 } = req.query;

  if (!query) {
    return res.status(400).json({
      data: { message: "Search query is required" },
      status: 400,
    });
  }

  try {
    const userId = req.user.id; 
    // console.log(userId , "userId");
    const result = await searchUserService(query, userId, page, limit);

    if (result.users.length === 0) {
      return res.status(404).json({
        data: { message: "No users found" },
        status: 404,
      });
    }

    res.status(200).json({
      data: {
        message: "Users fetched successfully",
        users: result.users,
        pagination: {
          total: result.total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(result.total / limit),
        },
      },
      status: 200,
    });
  } catch (error) {
    res.status(400).json({
      data: { message: error.message || "Error fetching users" },
      status: 400,
    });
  }
};
// ------------------------------------------------------------
// ------------------------------------------------------------

export const addFriend = async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    try {
        const result = await addFriendService(currentUserId, userId);
        sendSuccess(res, result.message);
    } catch (error) {
        sendError(res, error, "Error adding friend");
    }
};

export const addFriendRequest = async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    try {
        const result = await addFriendRequestService(currentUserId, userId);
        sendSuccess(res, result.message);
    } catch (error) {
        sendError(res, error, "Error sending friend request");
    }
};

export const rejectFriendRequest = async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    try {
        const result = await rejectFriendRequestService(currentUserId, userId);
        sendSuccess(res, result.message);
    } catch (error) {
        sendError(res, error, "Error rejecting friend request");
    }
};

export const cancelFriendRequest = async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    try {
        const result = await cancelFriendRequestService(currentUserId, userId);
        sendSuccess(res, result.message);
    } catch (error) {
        sendError(res, error, "Error canceling friend request");
    }
};

export const removeFriend = async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    try {
        const result = await removeFriendService(currentUserId, userId);
        sendSuccess(res, result.message);
    } catch (error) {
        sendError(res, error, "Error removing friend");
    }
};// ------------------------------------------------------------

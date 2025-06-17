import { getFriendsService } from "../services/user.service.js";
import { sendError, sendSuccess } from "../utils/response.js";

export const getFriends = async (req, res) => {
  const { type } = req.query;
  const currentUser = req.user.id;

  try {
    const friends = await getFriendsService(currentUser, type);
    sendSuccess(res, "Friends fetched successfully", { data: friends });
  } catch (error) {
    sendError(res, error, "Error fetching friends");
  }
};

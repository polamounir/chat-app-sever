import User from "../models/User.model.js";

export const getFriendsService = async (currentUserId, type) => {
  const baseUrl = process.env.BASE_URL || "http://localhost:5000";

  const user = await User.findById(currentUserId)
    .populate("friends", "name email profilePicture _id username")
    .populate("incomingFriendRequests", "name email profilePicture _id username")
    .populate("outgoingFriendRequests", "name email profilePicture _id username");

  if (!user) {
    throw new Error("User not found");
  }

//   // Helper function to format profile picture
//   const formatProfilePicture = (u) => {
//     if (u.profilePicture && !u.profilePicture.startsWith("http")) {
//       u.profilePicture = `${baseUrl}${u.profilePicture}`;
//     }
//   };
    // Helper function to format profile picture
    const formatProfilePicture = (u) => {
        if (u.profilePicture) {
          const filename = u.profilePicture.split("/").pop();
          u.profilePicture = `${baseUrl}/uploads/${filename}`;
        }
      };
    

  // Format profile pictures of all populated users
  const formatUserList = (list) => list.map(friend => {
    const formatted = friend.toObject();
    formatProfilePicture(formatted);
    return formatted;
  });

  switch (type) {
    case "friends":
      return formatUserList(user.friends);
    case "requests":
      return formatUserList(user.incomingFriendRequests);
    case "sent":
      return formatUserList(user.outgoingFriendRequests);
    default:
      throw new Error("Invalid type");
  }
};

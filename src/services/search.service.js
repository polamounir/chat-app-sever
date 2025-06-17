import User from "../models/User.model.js";

export const searchUserService = async (query, currentUserId, page = 1, limit = 10) => {
  if (!query) throw new Error("Query parameter is required");

  const skip = (page - 1) * limit;

  const currentUser = await User.findById(currentUserId).select("outgoingFriendRequests incomingFriendRequests friends");
  console.log(currentUser , "currentUser");

  if (!currentUser) {
    throw new Error("Authenticated user not found");
  }

  const requestedUserIds = currentUser.incomingFriendRequests || [];
  const requestedByMeUserIds = currentUser.outgoingFriendRequests || [];
  const friendsUserIds = currentUser.friends || [];

  // Exclude self and already requested users
  const filters = {
    // _id: { $ne: currentUserId, $nin: requestedUserIds },
    _id: { $ne: currentUserId },
    $or: [
      { name: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
      { username: { $regex: query, $options: "i" } },
    ],
  };

  const [total, users] = await Promise.all([
    User.countDocuments(filters),
    User.find(filters)
      .select("-password -tokens -accessTokens -refreshTokens")
      .skip(skip)
      .limit(limit),
  ]);

  const formattedUsers = users.map((user) => {
    const {
      password,
      accessTokens,
      refreshTokens,
      __v,
      updatedAt,
      createdAt,
      isActive,
      role,
      friendRequests,
      friends,
      groups,
      chats,
      lastLogin,
      notifications,
      bio,
      incomingFriendRequests,
      outgoingFriendRequests,
      ...safeData
    } = user.toObject();

    // if (safeData.profilePicture && process.env.BASE_URL) {
    //   safeData.profilePicture = `${process.env.BASE_URL}/${safeData.profilePicture}`;
    // }
    safeData.isFriend = friendsUserIds.includes(safeData._id);
    safeData.isRequested = requestedUserIds.includes(safeData._id);
    safeData.isRequestedByMe = requestedByMeUserIds.includes(safeData._id);


    return safeData;
  });

  return { users: formattedUsers, total };
};


// -----------------------------------------

// Helper to get both users
const getUsers = async (currentUserId, userId) => {
    const [currentUser, user] = await Promise.all([
        User.findById(currentUserId),
        User.findById(userId)
    ]);
    if (!currentUser || !user) throw new Error("User not found");
    return { currentUser, user };
};

export const addFriendRequestService = async (currentUserId, userId) => {
    const { currentUser, user } = await getUsers(currentUserId, userId);

    if (!currentUser.outgoingFriendRequests.includes(userId)) {
        currentUser.outgoingFriendRequests.push(userId);
    }

    if (!user.incomingFriendRequests.includes(currentUserId)) {
        user.incomingFriendRequests.push(currentUserId);
    }

    await Promise.all([currentUser.save(), user.save()]);
    return { message: "Friend request sent" };
};

export const rejectFriendRequestService = async (currentUserId, userId) => {
    const { currentUser, user } = await getUsers(currentUserId, userId);

    currentUser.incomingFriendRequests = currentUser.incomingFriendRequests.filter(id => id.toString() !== userId);
    user.outgoingFriendRequests = user.outgoingFriendRequests.filter(id => id.toString() !== currentUserId);

    await Promise.all([currentUser.save(), user.save()]);
    return { message: "Friend request rejected" };
};

export const cancelFriendRequestService = async (currentUserId, userId) => {
    const { currentUser, user } = await getUsers(currentUserId, userId);

    currentUser.outgoingFriendRequests = currentUser.outgoingFriendRequests.filter(id => id.toString() !== userId);
    user.incomingFriendRequests = user.incomingFriendRequests.filter(id => id.toString() !== currentUserId);

    await Promise.all([currentUser.save(), user.save()]);
    return { message: "Friend request canceled" };
};

export const addFriendService = async (currentUserId, userId) => {
    const { currentUser, user } = await getUsers(currentUserId, userId);

    // Remove from friend requests
    currentUser.incomingFriendRequests = currentUser.incomingFriendRequests.filter(id => id.toString() !== userId);
    user.outgoingFriendRequests = user.outgoingFriendRequests.filter(id => id.toString() !== currentUserId);

    // Add to friends list if not already present
    if (!currentUser.friends.includes(userId)) currentUser.friends.push(userId);
    if (!user.friends.includes(currentUserId)) user.friends.push(currentUserId);

    await Promise.all([currentUser.save(), user.save()]);
    return { message: "Friend added successfully" };
};

export const removeFriendService = async (currentUserId, userId) => {
    const { currentUser, user } = await getUsers(currentUserId, userId);

    currentUser.friends = currentUser.friends.filter(id => id.toString() !== userId);
    user.friends = user.friends.filter(id => id.toString() !== currentUserId);

    await Promise.all([currentUser.save(), user.save()]);
    return { message: "Friend removed" };
};


// ------------------------------------------------------------

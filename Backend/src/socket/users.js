const users = new Map();

export const addUser = (
  userId,
  socketId
) => {
  users.set(userId.toString(), {
    socketId,
    connectedAt: new Date(),
  });
};

export const removeUser = (
  socketId
) => {
  for (const [
    userId,
    user,
  ] of users.entries()) {
    if (user.socketId === socketId) {
      users.delete(userId);
      break;
    }
  }
};

export const getSocketId = (
  userId
) => {
  return users.get(userId.toString())
    ?.socketId;
};

export const getOnlineUsers =
  () => {
    return users;
  };
import jwt from "jsonwebtoken";
export const tokenValidate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      data: { message: "Token not provided" },
      status: 401,
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    return res.status(401).json({
      data: { message: "Invalid token" },
      status: 401,
    });
  }
};

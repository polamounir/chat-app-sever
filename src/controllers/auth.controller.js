import {
  createUserService,
  getAllUsersService,
  getUserByIdService,
  getUserInfoService,
  loginUserService,
  refreshTokenService,
  
} from "../services/auth.service.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsersService();
    res.json(users);
  } catch (error) {
    res.status(500).json({
      data: {
        message: error.message,
        data: error.message,
      },
      status: 500,
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const user = await createUserService(req.body, req.file, baseUrl);

    res.status(201).json({
      data: {
        message: "User created successfully",
        data: user,
      },
      status: 201,
    });
  } catch (error) {
    // Handle specific validation errors
    if (
      error.message.includes("required fields") ||
      error.message.includes("Email already registered") ||
      error.message.includes("Invalid email format") ||
      error.message.includes("Password must be")
    ) {
      return res
        .status(400)
        .json({
          data: { message: error.message, data: error.message },
          status: 400,
        });
    }

    res.status(500).json({
      data: {
        message: "Error creating user",
        data: error.message,
      },
      status: 500,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        data: { message: 'Email and password are required' },
        status: 400,
      });
    }

    const userData = await loginUserService(email, password);

    return res.status(200).json({
      data: {
        message: 'User logged in successfully',
       data: userData,
      },
      status: 200,
    });
  } catch (error) {
    return res.status(400).json({
      data: {
        message: error.message || 'Invalid email or password',
      },
      status: 400,
    });
  }
};
// ------------------------------------------
export const refreshUserToken = async (req, res) => {
  const { refreshToken } = req.body;
  const token = req.headers.authorization?.split(' ')[1]; 
  // console.log("Refresh token:", refreshToken );


  if (!refreshToken) {
    return res.status(400).json({
      data: { message: 'Refresh token is required' },
      status: 400,
    });
  }


  try {
    const tokens = await refreshTokenService(refreshToken , token);
    res.status(200).json({
      data: {
        message: "Token refreshed successfully",
         ...tokens,
      },
      status: 200,
    });
  } catch (error) {
    res.status(401).json({
      data: {
        message: error.message,
      },
      status: 401,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await getUserByIdService(req.params.id);
    res.status(200).json({
      data: {
        message: "User fetched successfully",
        data: user,
      },
      status: 200,
    });
  } catch (error) {
    res.status(500).json({
      data: {
        message: "Error fetching user",
        data: error.message,
      },
      status: 500,
    });
  }
};

export const getUserInfo = async (req, res) => {
  try {
    const user = await getUserInfoService(req.user.id);

    res.status(200).json({
      data: { message: "User Fetched Successfuly ", data: user },
      status: 200,
    });
  } catch (error) {
    res.status(401).json({
      data: { message:'Unauthorized' , data: error.message },
      status: 401,
    });
  }
};



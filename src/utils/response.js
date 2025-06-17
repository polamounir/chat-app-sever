// utils/response.js
export const sendSuccess = (res, message, data = {}) => {
    return res.status(200).json({
        data: { message, ...data },
        status: 200,
    });
};

export const sendError = (res, error, fallback = "An error occurred") => {
    return res.status(400).json({
        data: { message: error.message || fallback },
        status: 400,
    });
};

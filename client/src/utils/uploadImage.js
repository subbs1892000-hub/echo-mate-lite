import axiosInstance from "../api/axiosInstance";

const uploadImageIfNeeded = async (imageValue, folder = "echomatelite") => {
  if (!imageValue || !imageValue.startsWith("data:image/")) {
    return imageValue;
  }

  try {
    const { data } = await axiosInstance.post("/uploads/image", {
      imageData: imageValue,
      folder
    });

    return data.url;
  } catch (error) {
    if (error.response?.status === 503) {
      return imageValue;
    }

    throw error;
  }
};

export default uploadImageIfNeeded;

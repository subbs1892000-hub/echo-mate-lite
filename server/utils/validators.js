const isValidUrl = (value) => {
  if (!value) {
    return true;
  }

  if (value.startsWith("data:image/")) {
    return true;
  }

  try {
    new URL(value);
    return true;
  } catch (error) {
    return false;
  }
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

module.exports = { isValidUrl, isValidEmail };

const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const app = require("./app");
const { requestLogger } = require("./utils/logger");

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  requestLogger(`Server running on port ${PORT}`);
});

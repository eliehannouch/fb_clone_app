const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");
const path = require("path");
const port = 8000;
const app = express();

//Routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const conversationRoutes = require("./routes/conversationsRoutes");
const messageRoutes = require("./routes/messagesRoutes");

dotenv.config();

mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connection successful! ✅✅ "))
  .catch((err) => {
    console.log("Database Connection Error ⚠️  " + err);
    process.exit(1);
  });

// middleware's
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    // cb(null, file.originalname);
    cb(null, req.body.name);
  },
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File uploded successfully");
  } catch (error) {
    console.error(error);
  }
});

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

const server = app.listen(port, () =>
  console.log("Backend Server listening on port " + port)
);

server.once("error", function (err) {
  if (err.code === "EADDRINUSE") {
    app.listen(process.env.PORT, () =>
      console.log(
        " Backend Server listening on the 2nd port " + process.env.PORT
      )
    );
  }
});

/* Controllers & Middleware */
import { register } from './controllers/auth.js';
import { createPost } from './controllers/posts.js';
import { verifyToken } from './middleware/auth.js';

/* Default middleware */
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { users, posts } from './data/index.js';

/* Extended middleware */
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import bodyParser from "body-parser";
import cors from "cors";
import multer from "multer";

/* Routes */
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import User from './models/User.js';
import Post from './models/Post.js';

/* Configurations */
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
dotenv.config();

// Express
const app = express();
app.use(express.json());
app.use("/assets", express.static(path.join(__dirname, "public/assets"))); // put this in cloud storage like s3 in real life production

// Helmet - Secures HTTP Headers (protects from XSS, CSRF, etc)
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin"}));

// Morgan - Logs incoming HTTP requests
app.use(morgan("common"));

// Body Parser - Make parsing data in req.body much simpler
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

// Cross Origin Resource Sharing (cors) - Allows you to specify origins that are allowed to access your application. Web browsers have a default same-origin policy
app.use(cors());

/* File Storage */
// multer - used for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "public/assets");
    },
    filename: function(req, file, cb) { 
        cb(null, file.originalname);
    }
});

const upload = multer({ storage })

/* Routes with upload files */
app.post('/auth/register', upload.single("picture"), register);
app.post('/posts', verifyToken, upload.single("picture"), createPost);

/* Routes */
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/posts', postRoutes);

/* Mongoose Database Connect */
const PORT = process.env.PORT || 6001;
console.log(process.env.PORT)
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
    /* Add once 
    User.insertMany(users);
    Post.insertMany(posts);
    */
}).catch(err => console.error(err));


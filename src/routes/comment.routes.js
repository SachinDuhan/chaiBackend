import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getVideoComments, addComment, updateComment } from "../controllers/comment.controller.js";

const router = Router();

router.route("/getVideoComments/:videoId").get(getVideoComments);
router.route("/addComment/:videoId").post(verifyJWT, addComment);
router.route("/u/update/:commentId").post(verifyJWT, updateComment);

export default router;
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos } from "../controllers/like.controller.js";

const router = Router();

router.route("/toggleVideoLike/:videoId").post(verifyJWT, toggleVideoLike);

router.route("/toggleCommentLike/:commentId").post(verifyJWT, toggleCommentLike); // NEED TO BE TESTED
router.route("/toggleTweetLike/:tweetId").post(verifyJWT, toggleTweetLike); // NEED TO BE TESTED

router.route("/getLikedVideos").get(verifyJWT, getLikedVideos);

export default router;
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet, getUserTweets, updateTweet, deleteTweet } from "../controllers/tweet.controller.js";

const router = Router();

router.route("/createTweet").post(verifyJWT, createTweet);
router.route("/getUserTweets/:userId").get(verifyJWT, getUserTweets);
router.route("/u/updateTweet/:tweetId").post(verifyJWT, updateTweet);
router.route("/d/deleteTweet/:tweetId").post(verifyJWT, deleteTweet);

export default router;
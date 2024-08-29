import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllVideos, publishAVideo, getVideoById } from "../controllers/video.controller.js";

const router = Router()

router.route("/getAllVideos").get(getAllVideos);
router.route("/createVideo").post(verifyJWT, upload.fields([
    {
        name: "videoFile",
        maxCount: 1
    },
    {
        name: "thumbnail",
        maxCount: 1
    }
]) , publishAVideo);

router.route("/getVideoById/v/:videoId").get(getVideoById);

export default router;
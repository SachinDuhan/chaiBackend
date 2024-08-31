import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType = "desc" } = req.query;
  //TODO: get all videos based on query, sort, pagination
  const options = {
    // options for the pagination
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const sortDirection = sortType.toLowerCase() === "asc" ? 1 : -1; // to sort the content in assending or descending order (if input is 'asc' then 1 i.e ascending and otherwise -1 i.e. descending)

  const pipeline = [
    {
      $lookup: {
        // looks up the user from the users collection using the id in the owner field in the video collection and get's the username, fullName and avatar of user
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ];

  if (query) {
    // if we have query, it's search stage inserted to the 0 index of the pipeline
    const searchStage = {
      $search: {
        index: "videoFinder",
        text: {
          query: query,
          path: ["title", "description"],
        },
      },
    };

    pipeline.unshift(searchStage);
  }

  if (sortType) {
    // if we have the sortBy field, this is inserted at the end of the pipeline
    const sort = {
      $sort: { [sortBy]: sortDirection },
    };

    pipeline.push(sort);
  }

  const aggregate = Video.aggregate(pipeline); // defines the aggregate (yes it's not supposed to be awaited)

  const paginatedContent = await Video.aggregatePaginate(aggregate, options); // this acutallyy excutes the pipeline after adding the pagination related stages to it

  return res
    .status(200)
    .json(
      new ApiResponse(200, paginatedContent, "Videos fetched successfully")
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description, isPublished } = req.body;
  // TODO: get video, upload to cloudinary, create video

  if ([title, isPublished].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // const videoFileLocalPath = req.files?.video[0]?.path;
  // const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  let videoFileLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.videoFile) &&
    req.files.videoFile.length > 0
  ) {
    videoFileLocalPath = req.files.videoFile[0].path;
  }
  let thumbnailLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.thumbnail) &&
    req.files.thumbnail.length > 0
  ) {
    thumbnailLocalPath = req.files.thumbnail[0].path;
  }

  if (!videoFileLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Both Video and Thumbnail are required");
  }

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  // console.log(videoFile);
  // console.log(thumbnail);

  if (!videoFile || !thumbnail) {
    throw new ApiError(400, "Both Video and Thumbnail are required");
  }

  const owner = req.user?._id;

  const videoObject = await Video.create({
    videoFile: videoFile.url,
    videoPublidId: videoFile.public_id,
    thumbnail: thumbnail.url,
    thumbnailPublicId: thumbnail.public_id,
    title,
    description: description || "",
    isPublished: Boolean(parseInt(isPublished)),
    owner,
  });

  const createdVideo = await Video.findById(videoObject._id);

  if (!createdVideo) {
    throw new ApiError(
      500,
      "Something went wrong while creating the video object"
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdVideo, "Video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => { 
  const { videoId } = req.params;
  //TODO: get video by id
  if (videoId?.trim() === "") {
    throw new ApiError(400, "Invalid video id provided");
  }

  let video;

  try {
    video = await Video.findById(videoId);
    // console.log(video);
  } catch (error) {
    throw new ApiError(404, "Video not found", error);
  }

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  let vid, user;

  try {
      vid = await Video.updateOne({_id: videoId}, {$inc: {views: 1}});  // increase video views and add to user watch history
      user = req.body.user ? await User.updateOne({_id: req.body.user}, {$push: {watchHistory: videoId}}) : null;
  } catch (error) {
    throw new ApiError(500, error.message, error)
  }


  return res
    .status(200)
    .json(new ApiResponse(200, {video, vid, user}, "Video found successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail

  const { newtitle, newdescription } = req.body;

  if ([newtitle].some((thing) => thing?.trim() === "")) {
    throw new ApiError(400, "Title required");
  }

  let result;
  let currentVideo;
  let thumbnailFileLocalPath;

  try {
    currentVideo = await Video.find(
      { _id: videoId },
      {
        thumbnail: 1,
        description: 1,
        title: 1,
        thumbnailPublicId: 1,
        videoPublidId: 1,
      }
    );

    const updateFields = {};
    if (newtitle && newtitle !== currentVideo.title) {
      updateFields.title = newtitle;
    }
    let thumbnailLocalPath;
    if (
      req.files &&
      Array.isArray(req.files.thumbnail) &&
      req.files.thumbnail.length > 0
    ) {
      thumbnailLocalPath = req.files.thumbnail[0].path;
    }
    if (!thumbnailLocalPath) {
      throw new ApiError(400, "Thumbnail are required");
    }
    if (thumbnailLocalPath && thumbnailLocalPath !== currentVideo.thumbnail) {
      const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
      if (!thumbnail) {
        throw new ApiError(400, "Thumbnail are required");
      }
      updateFields.thumbnail = thumbnail.url;
      updateFields.thumbnailPublicId = thumbnail.public_id;
      try {
        const thumbnailFile = await deleteFromCloudinary(
          currentVideo[0].thumbnailPublicId,
          "image"
        );
      } catch (error) {
        console.log("cloudinary delete: ", error);
      }
    }
    if (newdescription && newdescription !== currentVideo.description) {
      updateFields.description = newdescription;
    }

    result = await Video.updateOne({ _id: videoId }, { $set: updateFields });
    result = await Video.findById(videoId);
  } catch (error) {
    throw new ApiError(500, error.message, error);
  }

  if (result.matchedCount === 0) {
    throw new ApiError(404, "Video not found");
  }

  if (result.modifiedCount === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, currentVideo, "No changes made to the video"));
  }

  return res
    .status(202)
    .json(new ApiResponse(201, result, "video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => { // delete the connected comments and likes
  const { videoId } = req.params;
  //TODO: delete video

  try {
      const result = await Video.findByIdAndDelete(videoId);
    
      return res
      .status(204)
      .json(new ApiResponse(204, result, "Video deleted successfully"))
  } catch (error) {
    throw new ApiError(500, error.message, error)
  }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  try {
    const video = await Video.findByIdAndUpdate(videoId, [
        { $set: { isPublished: { $not: "$isPublished" } } }
      ], { new: true });

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Video publish status toggled successfully"))
  } catch (error) {
    throw new ApiError(400, error.message, error)
  }
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};

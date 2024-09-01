import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const user = req?.user;
    try {
        const stats = await User.aggregate([
            {
                $match: {
                    _id: user?._id
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "_id",
                    foreignField: "owner",
                    as: "videosArray",
                    pipeline: [
                        {
                            $lookup: {
                                from: "likes",
                                localField: "_id",
                                foreignField: "video",
                                as: "like"
                            }
                        },
                        {
                            $addFields: {
                                like: {$size: "$like"}
                            }
                        }
                    ]
                
            }},
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscription"
                }
            },
            {
                $addFields: {
                    totalVideos: {$size: "$videosArray"},
                    totalSubscribers: {$size: "$subscription"},
                    totalViews: {$sum: "$videosArray.views"},
                    totalLikes: {$sum: "$videosArray.like"}
                }
            },
            {
                $project: {
                    videosArray: 1,
                    subscription: 1,
                    totalVideos: 1,
                    totalSubscribers: 1,
                    totalViews: 1,
                    totalLikes: 1
                }
            }
        ])

        if (!stats) {
            throw new ApiError(500, "There was a problem while fetching the channel statistics")
        }

        // console.log(stats);
        return res.status(200).json(new ApiResponse(200, stats))
        
    } catch (error) {
        throw new ApiError(500, error.message, error)
    }
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    try {
        const {userId} = req.params;
    
        const videos = await Video.find({owner: userId});
    
        if (!videos) {
          throw new ApiError(500, "There was a problem fetching user's videos")
        }
    
        return res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"))
      } catch (error) {
        throw new ApiError(500, error.message, error)
      }
})

export {
    getChannelStats, 
    getChannelVideos
    }
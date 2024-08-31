import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    try {
            const comments = Comment.aggregate([
                {
                    $match: {video: new mongoose.Types.ObjectId(videoId)}
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        as: "owner",
                        pipeline: [
                            {
                                $project: {
                                    username: 1,
                                    avatar: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $addFields: {
                        owner: {$first: "$owner"}
                    }
                }
            ]);
        
            const commentsPaginate = await Comment.aggregatePaginate(comments, {page: parseInt(page), limit: parseInt(limit)})

            if (commentsPaginate.docs.length == 0) {
                return res.status(200).json(new ApiResponse(200, commentsPaginate, "No Comments"))
            }

            if (!commentsPaginate) {
                throw new ApiError(500, "Comments could not be loaded")
            }

            return res.status(200).json(new ApiResponse(200, commentsPaginate, "Comments loaded successfully"));
    } catch (error) {
        throw new ApiError(500, error.message, error)
    }

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params;
    const {comment} = req.body;

    if (comment?.trim() === "" || !comment) {
        throw new ApiError(400, "Comment content is required")
    }

    const user = req.user;

    try {
        const newComment = await Comment.create({
            content: comment,
            video: videoId,
            owner: user
        })

        const createdComment = await Comment.findById(newComment._id)

        if (!createdComment) {
            throw new ApiError(500, "Something went wrong while creating the comment")
        }

        return res.status(200).json(new ApiResponse(200, createdComment, "Comment created successfully"))
        
    } catch (error) {
        throw new ApiError(500, error.message, error)
    }

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params;
    const {content} = req.body;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment body in required")
    }

    try {
        const updatedComment = await Comment.updateOne({_id: commentId}, {content}, {new: true})

        if (!updateComment) {
            throw new ApiError(500, "There was a problem updating the comment");
        }

        return res.status(200).json(new ApiResponse(200, updatedComment, "Comment updated successfully"))
    } catch (error) {
        throw new ApiError(500, error.message, error)
    }
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
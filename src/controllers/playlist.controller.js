import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    const user = req?.user;

    try {
        if (!name || name.trim() === "") {
            throw new ApiError(400, "Name is required for the playlist")
        }

        const newPlaylist = await Playlist.create({
            name: name,
            description: description ? description : null,
            owner: user?._id
        })

        if (!newPlaylist) {
            throw new ApiError(500, "There was a problem creating the playlist")
        }

        return res.status(200).json(new ApiResponse(200, newPlaylist, "New playlist created successfully"))
    } catch (error) {
        throw new ApiError(500, error.message, error)
    }
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    try {
        const playlists = await Playlist.find({owner: userId});

        if (!playlists) {
            throw new ApiError(500, "There was a problem fetching the playlists")
        }

        return res.status(200).json(new ApiResponse(200, playlists, "Playlists fetched successfully"))
    } catch (error) {
        throw new ApiError(500, error.message, error)
    }
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    try {
        // const playlist = await Playlist.findById(playlistId);
        const playlist = await Playlist.aggregate([
            {
                $match: {_id: new mongoose.Types.ObjectId(playlistId)}
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "videos",
                    foreignField: "_id",
                    as: "videos",
                    pipeline: [
                        {$lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar:1
                                    }
                                }
                            ]
                        }},
                        {
                            $addFields: {owner: {$first: "$owner"}}
                        },
                        {
                            $project: {
                                title: 1,
                                thumbnail: 1,
                                duration: 1,
                                views: 1,
                                owner: 1
                            }
                        }
                    ]
                }
            }
        ])

        if (!playlist) {
            return res.status(404).json(new ApiResponse(404, playlist, "Playlist not found"))
        }

        return res.status(200).json(new ApiResponse(200, playlist, ))
    } catch (error) {
        throw new ApiError(500, error.message, error)
    }
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    try {
        const addVid = await Playlist.updateOne({_id: playlistId}, {$push: {videos, videoId}})

        if (!addVid || addVid.modifiedCount == 0) {
            throw new ApiError(500, "There was a problem adding the video to the playlist")
        }

        return res.status(200).json(new ApiResponse(200, addVid, "Video added to playlist"))
    } catch (error) {
        throw new ApiError(500, error.message, error)
    }
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    try {
        const deleteVideo = await Playlist.updateOne({_id: playlistId}, {$pull: {videos: videoId}}, {new: true})

        if (!deleteVideo || deleteVideo.modifiedCount == 0) {
            throw new ApiError(500, "There was a problem removing the video from the playlist")
        }

        return res.status(200).json(new ApiResponse(200, deleteVideo, "Video removed from the playlist successfully"))
    } catch (error) {
        throw new ApiError(500, error.message, error)
    }

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    try {
        const deletedPlaylist = await Playlist.deleteOne({_id: playlistId});

        if (!deletedPlaylist) {
            throw new ApiError(500, "There was a problem deleting the playlist")
        }

        return res.status(200).json(new ApiResponse(200, deletedPlaylist, "Playlist deleted successfully"))
    } catch (error) {
        throw new ApiError(500, error.message, error)
    }
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    try {
        if (!name || name.trim() === "") {
            throw new ApiError(500, "Name of the playlist is required")
        }

        const updatedPlaylist = await Playlist.updateOne({_id: playlistId}, {name, description}, {new: true});

        if (!updatedPlaylist, updatedPlaylist.modifiedCount == 0) {
            throw new ApiError(500, "There was a problem updating the playlist")
        }

        return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"))
    } catch (error) {
        throw new ApiError(500, error.message, error)
    }
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
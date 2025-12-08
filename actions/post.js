'use server'

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { uploadFile } from "./uploadFile";
import { checkPostForTrends } from "@/utils";
import { getAllFollowersAndFollowingsInfo } from "./user";

export const createPost = async (post) => {
    try {
        const {postText, media} = post;

        const user = await currentUser()

        let cld_id;
        let assetUrl

        if(media) {
            const res = await uploadFile(media, `/posts/${user?.id}`)
            const {public_url, secure_url} = res;
            cld_id = public_url;
            assetUrl = secure_url
        }

        const newPost = await db.post.create({
            data: {
                postText,
                media: assetUrl,
                cld_id,
                author: {
                    connect: {
                        id: user?.id
                    }
                }
            }
        })
        const trends = checkPostForTrends(postText)
        if(trends.length > 0) {
            createTrends(trends, newPost.id)
        }
        return {
            data: newPost
        }
    } catch (e) {
        console.log(e?.message);
        throw new Error("Failed to create post")
    }
}

export const getPosts = async (lastCursor, id) => {
    try {
        const take = 5;
        const where = id !== "all" ? { author: { id } } : ""

        const posts = await db.post.findMany({
            include: {
                author: true,
                likes: true,
                comments: {
                    include: {
                        author: true
                    }
                }
            },
            where,
            take,
            ...(lastCursor && {
                skip: 1,
                cursor: {
                    id: lastCursor
                }
            }),
            orderBy: {
                createdAt: 'desc'
            }
        })

        if(posts.length === 0) {
            return {
                data: [],
                metaData: {
                    lastCursor: null,
                    hasMore: false
                }
            }
        }

        const lastPostInResults = posts[posts.length - 1]
        const cursor = lastPostInResults.id;
        const morePosts = await db.post.findMany({
            where,
            skip: 1,
            cursor: {
                id: cursor
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return {
            data: posts,
            metaData: {
                lastCursor: cursor,
                hasMore: morePosts.length > 0
            }
        }
    } catch (e) {
        console.log(e)
        throw new Error("Failed to fetch posts")
    }
}

export const getMyFeedPosts = async (lastCursor) => {
    try {
        const {id} = await currentUser();
        const { followers, following } = await getAllFollowersAndFollowingsInfo(id);
        const followingIds = following.map((f) => f.followingId);
        const followersIds = followers.map((f) => f.followerId);
        
        const userIds = [...new Set([...followingIds, ...followersIds, id])];

        const take = 5;
        const where = {author: {id: {in: userIds}}}
        const posts = await db.post.findMany({
            include: {
                author: true,
                likes: true,
                comments: {
                    include: {
                        author: true
                    }
                }
            },
            where,
            take,
            ...(lastCursor && {
                skip: 1,
                cursor: {
                    id: lastCursor
                }
            }),
            orderBy: {
                createdAt: 'desc'
            }
        })

        if(posts.length === 0) {
            return {
                data: [],
                metaData: {
                    lastCursor: null,
                    hasMore: false
                }
            }
        }

        const lastPostInResults = posts[posts.length - 1]
        const cursor = lastPostInResults.id;
        const morePosts = await db.post.findMany({
            where,
            skip: 1,
            cursor: {
                id: cursor
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return {
            data: posts,
            metaData: {
                lastCursor: cursor,
                hasMore: morePosts.length > 0
            }
        }
    } catch (e) {
        console.error("Create post error:", e)
        throw new Error("Failed to create post")
    }
}

export const updatePostLike = async (postId, type) => {
    try {
        const { id: userId } = await currentUser()

        const post = await db.post.findUnique({
            where: {
                id: postId
            },
            include: {
                likes: true
            }
        })

        if(!post) {
            return {
                error: "Post not found"
            }
        }

        const like = post.likes.find((like) => like.authorId === userId)

        if(like) {
            if(type === 'like') {
                return {
                    data: post
                }
            }

        else {
            await db.like.delete({
                where: {
                    id: like.id
                }
            })
            
            console.log("like deleted")
        }
    } else {
        if(type === "unlike") {
            return {
                data: post
            }
        } else {
            await db.like.create({
                data: {
                    post: {
                        connect: {
                            id: postId
                        }
                    },
                    author: {
                        connect: {
                            id: userId
                        }
                    }
                }
            });
            console.log("like created")
        }
    }

    const updatedPost = await db.post.findUnique({
        where: {
            id: postId
        },
        include: {
            likes : true
        }
    })
    console.log("Update post", updatedPost);
    return {
        data: updatedPost
    }

    } catch(e) {
        console.log(e)
        throw new Error("Failed to update the post likes")
    }
}

export const addComment = async(postId, comment) => {
    try {
        const {id: userId} = await currentUser()
        const newComment = await db.comment.create({
            data: {
                comment,
                post: {
                    connect: {
                        id: postId
                    }
                },
                author: {
                    connect: {
                        id: userId
                    }
                }
            }
        })
    } catch (e) {
        console.log(e)
        throw new Error("Failed to add comment")
    }
}

export const createTrends = async(trends, postId) => {
    try {
        const newTrends = await db.trend.createMany({
            data: trends.map((trend) => ({
                name: trend, 
                postId: postId
            }))
        });
        return {
            data: newTrends
        }
    } catch (e) {
        throw e
    }
}

export const getPopularTrends = async() => {
    try {
        const trends = await db.trend.groupBy({
            by: ['name'],
            _count: {
                name: true
            },
            orderBy: {
                _count: {
                    name: 'desc'
                }
            },
            take: 3
        });
        return {
            data: trends
        }
    } catch (e) {
        throw e
    }
}
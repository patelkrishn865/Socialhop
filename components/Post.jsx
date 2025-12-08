import React from 'react'
import css from "@/styles/post.module.css"
import Box from './Box/Box'
import { Avatar, Flex, Image, Typography } from 'antd'
import dayjs from 'dayjs'
import { getFileTypeFromUrl } from '@/utils'
import LikeButton from './LikeButton'
import CommentButton from './CommentButton'
import CommentSection from './CommentSection'
import Link from 'next/link'

const Post = ({data, queryId}) => {
  return (
    <div className={css.wrapper}>
        <Box>
            <div className={css.container}>
                <Flex align='center' justify='space-between'>
                    <Flex gap={'.5rem'} align='center'>
                        <Link passHref href={`/profile/${data?.author?.id}?person=${data?.author?.first_name}`}>
                        <Avatar size={40} src={data?.author?.image_url} />
                        </Link>
                        <Flex vertical >
                            <Typography className='typoSubtitle2'>
                                {data?.author?.first_name}{data?.author?.last_name}
                            </Typography>

                            <Typography.Text className='typoCaption' type='secondary' strong>
                                {dayjs(data?.created_at).format("DD MMM YYYY")}
                            </Typography.Text>
                        </Flex>
                    </Flex>
                </Flex>
                <Typography.Text>
                    <div 
                        dangerouslySetInnerHTML={{
                            __html: (data?.postText)?.replace(/\n/g, "<br/>")
                        }}
                    />
                </Typography.Text>
                {
                    getFileTypeFromUrl(data?.media) === "image" && (
                        <div className={css.media}>
                            <Image 
                               src={data?.media}
                               alt='post media'
                               style={{objectFit: 'cover'}}
                            /> 
                        </div>
                    )
                }
                {
                    getFileTypeFromUrl(data?.media) === "video" && (
                        <div className={css.media}>
                            <video 
                               src={data?.media}
                               controls
                               style={{width: '100%', height: '100%'}}
                            /> 
                        </div>
                    )
                }
                <Flex>
                    <LikeButton postId={data?.id} likes={data?.likes} queryId={queryId} />
                    <CommentButton comments={data?.comments?.length} />
                </Flex>
                <CommentSection
                    comments={data?.comments}
                    postId={data?.id}
                    queryId={queryId}
                />
            </div>
        </Box>
    </div>
  )
}

export default Post
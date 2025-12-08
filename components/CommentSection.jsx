import { Icon } from '@iconify/react'
import { Button, Flex } from 'antd'
import React, { useEffect, useState } from 'react'
import css from '@/styles/commentSection.module.css'
import CommentInput from './CommentInput'
import Comment from './Comment'
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { animateScroll } from 'react-scroll'

const CommentSection = ({comments, postId, queryId}) => {
    const [expanded, setExpanded] = useState(false);
    const [parent] = useAutoAnimate()

    useEffect(() => {
        if(expanded) {
            animateScroll.scrollToBottom({
                containerId: "comments-container",
                smooth: true,
                duration: 300 
            })
        }
    })

  return (
    <Flex vertical gap={'1rem'}>
        <>
        {
            comments?.length > 1 && (
                <Button type='text' onClick={() => setExpanded((prev) => !prev)}>
                    <Flex align='center' gap={'.5rem'} justify='center'>
                        <Icon icon="ic:outline-expand-more" />
                        Show more comments
                    </Flex>
                </Button>
            )
        }

        {
            comments?.length > 0 && (
                 <Flex ref={parent} id='comments-container' vertical gap={'.5rem'} className={css.commentsContainer}>
                    {!expanded ? (
                        <Comment data={comments[comments.length - 1]} />
                    ) : (
                        comments.map((comment, index) => (
                            <Comment key={index} data={comment} />
                        ))
                    )}
                 </Flex>
            )
        }
        </>

        <CommentInput setExpanded={setExpanded} queryId={queryId} postId={postId} />
    </Flex>
  )
}

export default CommentSection
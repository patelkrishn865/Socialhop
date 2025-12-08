// LikeButton.js
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Icon } from "@iconify/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Flex, Typography } from "antd";
import { HappyProvider } from "@ant-design/happy-work-theme";
import { updatePostLike } from "@/actions/post";

const LikeButton = ({ postId, likes = [], queryId = "posts" }) => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  // Track whether the post was liked initially (so we can compute displayed count correctly)
  const [initiallyLiked, setInitiallyLiked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const safeLikes = Array.isArray(likes) ? likes : [];
    const liked = !!safeLikes.find((l) => l?.authorId === user?.id);
    setInitiallyLiked(liked);
    setIsLiked(liked);
  }, [likes, user?.id]);

  // Compute displayed like count based on incoming likes prop and optimistic toggle
  const baseLikesCount = Array.isArray(likes) ? likes.length : 0;
  const displayedLikes =
    baseLikesCount +
    (isLiked && !initiallyLiked ? 1 : !isLiked && initiallyLiked ? -1 : 0);

  const actionType = isLiked ? "unlike" : "like";

  const { mutate, isLoading } = useMutation({
    mutationFn: () => updatePostLike(postId, actionType),

    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["posts", queryId] });

      // Snapshot previous value for rollback
      const previousPosts = queryClient.getQueryData(["posts", queryId]);

      // Optimistically update cache
      queryClient.setQueryData(["posts", queryId], (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((post) => {
              if (post.id !== postId) return post;

              const safePostLikes = Array.isArray(post.likes) ? post.likes : [];
              const alreadyLiked = safePostLikes.some(
                (l) => l?.authorId === user?.id
              );

              return {
                ...post,
                likes: alreadyLiked
                  ? safePostLikes.filter((l) => l.authorId !== user?.id)
                  : [...safePostLikes, { authorId: user?.id }],
              };
            }),
          })),
        };
      });

      return { previousPosts };
    },

    onError: (_err, _variables, context) => {
      // rollback
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts", queryId], context.previousPosts);
      }
      // restore local state to initial snapshot (safest)
      setIsLiked((prev) => !prev);
    },

    onSettled: () => {
      // Ensure we re-fetch so server is source of truth
      queryClient.invalidateQueries({ queryKey: ["posts", queryId] });
    },
  });

  const handleClick = () => {
    // Immediate local toggle for instant color change and count update
    setIsLiked((prev) => !prev);
    mutate();
  };

  return (
    <HappyProvider>
      <Button
        size="small"
        style={{ background: "transparent", border: "none", boxShadow: "none" }}
        onClick={handleClick}
        disabled={isLoading}
      >
        <Flex gap=".5rem" align="center">
          <Icon
            icon="ph:heart-fill"
            width="22px"
            style={{ color: isLiked ? "var(--primary)" : "grey" }}
          />
          <Typography.Text className="typoBody2">
            {displayedLikes === 0 ? "Like" : `${displayedLikes} Likes`}
          </Typography.Text>
        </Flex>
      </Button>
    </HappyProvider>
  );
};

export default LikeButton;

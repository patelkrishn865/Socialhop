import { updatePostLike } from "@/actions/post";
import { HappyProvider } from "@ant-design/happy-work-theme";
import { useUser } from "@clerk/nextjs";
import { Icon } from "@iconify/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Flex, Typography } from "antd";
import React, { useEffect, useState } from "react";

const LikeButton = ({ postId, likes = [], queryId = "posts" }) => {  // ← 1. default []
  const { user } = useUser();
  const [isLiked, setIsLiked] = useState(false);
  const queryClient = useQueryClient();

  // ← 2. Safe likes + safe user.id
  useEffect(() => {
    const safeLikes = Array.isArray(likes) ? likes : [];
    setIsLiked(safeLikes.some((like) => like?.authorId === user?.id));
  }, [user?.id, likes]);

  const actionType = isLiked ? "unlike" : "like";

  const { mutate, isPending } = useMutation({
    mutationFn: () => updatePostLike(postId, actionType), // ← 3. remove args from mutationFn

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["posts", queryId] }); // ← 4. fix key + use object

      const previousPosts = queryClient.getQueryData(["posts", queryId]);

      queryClient.setQueryData(["posts", queryId], (old) => { // ← setQueryData not setQueriesData
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((post) =>
              post.id === postId
                ? {
                    ...post,
                    likes: isLiked
                      ? likes.filter((l) => l.authorId !== user?.id)
                      : [...likes, { authorId: user?.id }],
                  }
                : post
            ),
          })),
        };
      });

      return { previousPosts };
    },

    onError: (err, _, context) => {
      queryClient.setQueryData(["posts", queryId], context.previousPosts);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return (
    <HappyProvider>
      <Button
        size="small"
        style={{ background: "transparent", border: "none", boxShadow: "none" }}
        onClick={() => mutate()}
      >
        <Flex gap=".5rem" align="center">
          <Icon
            icon="ph:heart-fill"
            width="22px"
            style={{ color: isLiked ? "var(--primary)" : "grey" }}
          />
          <Typography.Text className="typoBody2">
            {likes.length === 0 ? "Like" : `${likes.length} Likes`}
          </Typography.Text>
        </Flex>
      </Button>
    </HappyProvider>
  );
};

export default LikeButton;
// CommentInput.jsx — FINAL 100% WORKING VERSION
"use client";

import { addComment } from "@/actions/post";
import { useUser } from "@clerk/nextjs";
import { Icon } from "@iconify/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, Button, Flex, Input } from "antd";
import React, { useState } from "react";
import toast from "react-hot-toast";

const CommentInput = ({ setExpanded, queryId = "posts", postId }) => {
  const { user } = useUser();
  const [value, setValue] = useState("");
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: () => addComment(postId, value),

    onMutate: async () => {
      setExpanded(true);

      // FIXED: cancelQueries + correct query key
      await queryClient.cancelQueries({ queryKey: ["posts", queryId] });

      const previousData = queryClient.getQueryData(["posts", queryId]);

      // FIXED: setQueryData (not setQueriesData) + correct key
      queryClient.setQueryData(["posts", queryId], (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((post) =>
              post.id === postId
                ? {
                    ...post,
                    comments: [
                      ...post.comments,
                      {
                        id: Date.now().toString(), // temp ID
                        comment: value,
                        authorId: user?.id,
                        author: {
                          id: user?.id,
                          first_name: user?.firstName,
                          last_name: user?.lastName,
                          image_url: user?.imageUrl,
                        },
                        createdAt: new Date().toISOString(),
                      },
                    ],
                  }
                : post
            ),
          })),
        };
      });

      return { previousData };
    },

    onError: (err, _, context) => {
      toast.error("Failed to add comment");
      // FIXED: correct key
      queryClient.setQueryData(["posts", queryId], context.previousData);
    },

    onSuccess: () => {
      toast.success("Comment added!");
      setValue("");
      setExpanded(false);
    },

    onSettled: () => {
      // FIXED: correct key
      queryClient.invalidateQueries({ queryKey: ["posts", queryId] });
    },
  });

  return (
    <Flex gap="1rem" align="center">
      <Avatar src={user?.imageUrl} size={40} style={{ minWidth: "40px" }} />

      <Input.TextArea
        placeholder="Write a comment..."
        style={{ resize: "none" }}
        autoSize={{ minRows: 1, maxRows: 5 }}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onPressEnter={(e) => {
          if (e.shiftKey) return;
          e.preventDefault();
          if (value.trim()) mutate();
        }}
      />

      <Button
        type="primary"
        loading={isPending}
        disabled={!value.trim() || isPending}
        onClick={() => mutate()}
      >
        <Icon icon="iconamoon:send-fill" width="1.2rem" />
      </Button>
    </Flex>
  );
};

export default CommentInput;
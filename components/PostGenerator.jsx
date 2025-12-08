"use client";
import React, { useRef, useState } from "react";
import css from "@/styles/postGenerator.module.css";
import Box from "./Box/Box";
import { Avatar, Button, Flex, Image, Input, Spin, Typography } from "antd";
import { useUser } from "@clerk/nextjs";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "@/actions/post";

const PostGenerator = () => {
  const { user } = useUser();
  const [postText, setPostText] = useState("");
  const imgInputRef = useRef(null);
  const vidInputRef = useRef(null);
  const [fileType, setFileType] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const queryClient = useQueryClient()
  const {mutate: execute, isPending} = useMutation({
    mutationFn: (data) => createPost(data),
    onSuccess: () => {
      handleSuccess();
      queryClient.invalidateQueries("posts")
    },
    onError: () => showError("Something went wrong. Try Again!")
  })

  const handleSuccess = () => {
    setSelectedFile(null)
    setFileType(null)
    setPostText("")
    toast.success("Post created successfully")
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5mb");
      return;
    }

    if (
      (file && file.type.startsWith("image/")) ||
      file.type.startsWith("video/")
    ) {
      setFileType(file.type.split("/")[0]);

      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => {
        setSelectedFile(reader.result);
      };
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileType(null);
  };

  const showError = (msg= "Something went wrong! Try again.") => {
    toast.error(msg)
  }

  const submitPost = () => {
    if((postText === "" || !postText) && !selectedFile) {
      showError("Can't make an empty post")
      return
    }

    execute({postText, media: selectedFile})
  }

  return (
    <>
    <Spin 
    spinning={isPending}
    tip={
      <Typography className="typoBody1" style={{ marginTop: '1rem' }}>Uploading post...</Typography>
    }
    >
      <div className={css.postGenWrapper}>
        <Box className={css.container}>
          <Flex vertical gap={"1rem"} align="flex-start">
            <Flex style={{ width: "100%" }} gap={"1rem"}>
              <Avatar
                src={user?.imageUrl}
                style={{
                  width: "2.6rem",
                  height: "2.6rem",
                  boxShadow: "var(--avatar-shadow)",
                }}
              />

              <Input.TextArea
                placeholder="Share what you are thinking..."
                style={{ height: 80, resize: "none", flex: 1 }}
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              />
            </Flex>

            {fileType && (
              <div className={css.previewContainer}>
                <Button
                  type="default"
                  className={css.remove}
                  style={{ position: "absolute" }}
                >
                  <Typography
                    className="typoCaption"
                    onClick={handleRemoveFile}
                  >
                    Remove
                  </Typography>
                </Button>
                {fileType === "image" && (
                  <Image
                    src={selectedFile}
                    className={css.preview}
                    alt="preview of post"
                    height={"350px"}
                    width={"100%"}
                  />
                )}

                {fileType === "video" && (
                  <video
                    src={selectedFile}
                    className={css.preview}
                    controls
                    height={"350px"}
                  />
                )}
              </div>
            )}

            <Flex className={css.bottom} align="center" justify="space-between">
              <Button
                type="text"
                style={{ background: "borderColor" }}
                onClick={() => imgInputRef.current.click()}
              >
                <Flex align="center" gap={"0.5rem"}>
                  <Icon
                    icon={"solar:camera-linear"}
                    width={"1.2rem"}
                    color="var(--primary)"
                  />
                  <Typography className="typeSubtitle2">Image</Typography>
                </Flex>
              </Button>

              <Button
                type="text"
                style={{ background: "borderColor" }}
                onClick={() => vidInputRef.current.click()}
              >
                <Flex align="center" gap={"0.5rem"}>
                  <Icon
                    icon={"gridicons:video"}
                    width={"1.2rem"}
                    color="#5856D6"
                  />
                  <Typography className="typeSubtitle2">Video</Typography>
                </Flex>
              </Button>

              <Button type="primary" onClick={submitPost} style={{ marginLeft: "auto" }}>
                <Flex align="center" gap={"0.5rem"}>
                  <Icon icon={"iconamoon:send-fill"} width={"1.2rem"} />
                  <Typography
                    className="typeSubtitle2"
                    style={{ color: "white" }}
                  >
                    Post
                  </Typography>
                </Flex>
              </Button>
            </Flex>
          </Flex>
        </Box>
      </div>
      </Spin>

      <input
        type="file"
        accept="image/*"
        multiple={false}
        style={{ display: "none" }}
        ref={imgInputRef}
        onChange={(e) => handleFileChange(e)}
      />

      <input
        type="file"
        accept="video/*"
        multiple={false}
        style={{ display: "none" }}
        ref={vidInputRef}
        onChange={(e) => handleFileChange(e)}
      />
    </>
  );
};

export default PostGenerator;

'use client'
import { useUser } from '@clerk/nextjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react'
import css from '@/styles/userBox.module.css'
import Box from './Box/Box';
import { Avatar, Button, Flex, Typography } from 'antd';
import { Icon } from '@iconify/react';
import { updateFollow } from '@/actions/user';

const UserBox = ({ data, type, loggedInUserData }) => {

    const [followed, setFollowed] = useState(false);
    const { user: currentUser } = useUser();
    const personId = data?.[type]?.id

    const queryClient = useQueryClient();

    useEffect(() => {
        if(
            loggedInUserData?.following 
            ?.map((person) => person?.followingId)
            .includes(data?.[type === "follower" ? "followerId" : "followingId"])
        ) {
            setFollowed(true)
        }

        else {
            setFollowed(false)
        }
    },[loggedInUserData, data, setFollowed, type])

    const {mutate, isPending} = useMutation({
        mutationFn: updateFollow,
        onMutate: async (params) => {
            await queryClient.cancelQueries(["user", currentUser?.id, "followInfo"]);
            await queryClient.cancelQueries(["user", personId, "followInfo"]);
            await queryClient.cancelQueries(["user", "followSuggestions"]);
            
            const previousData = queryClient.getQueryData([
              "user",
              currentUser?.id,
              "followInfo",
            ]);
      
            queryClient.setQueryData(
              ["user", currentUser?.id, "followInfo"],
              (old) => {
                const newData = {
                  ...old,
                  following:
                    params?.type === "follow"
                      ? [
                          ...old.following,
                          {
                            followingId: params.id,
                            followerId: currentUser?.id,
                            following: data[type],
                          },
                        ]
                      : old.following.filter(
                          (person) => person.followingId !== params.id
                        ),
                }
                return newData;
              }
            );
      
            queryClient.setQueryData(["user", "followSuggestions"], (old) => {
              return old.filter((person) => person.id !== params.id);
            });
      
            return { previousData };
          },
    })

  return (
    <Box className={css.container}>
        <div className={css.left}>
        <Avatar src={data?.[type]?.image_url} size={40} />
        <div className={css.details}>
          <Typography.Text className={"typoSubtitle2"} ellipsis>
            {data?.[type]?.first_name} {data?.[type]?.last_name}
          </Typography.Text>
          <Typography.Text className={"typoCaption"} type="secondary">
            {data?.[type]?.username}
          </Typography.Text>
        </div>
      </div>

      {
        data?.[type]?.id === currentUser?.id ? (
            <div className={css.right}></div>
        ) : 

        <div className={css.right}>
      {
        !followed ? (
            <Button type="text" size='small' className={css.button} onClick={() => mutate({ id: personId, type: "follow"})}>
                <Typography.Text>
                    {
                        isPending ? "Loading..." : "Follow"
                    }
                </Typography.Text>
            </Button>
        ) : (
            <Button type="text" size='small' onClick={() => mutate({ id: personId, type: "unfollow"})}>
                <Flex gap={10} align='center'>
                    <Icon icon={'charm:tick'} width={18} color="#3db66a" />
                    <Typography.Text>{ isPending ? "Loading..." : "Followed" }</Typography.Text>
                </Flex>
            </Button>
        )
      }
      </div> }
    </Box>
  )
}

export default UserBox
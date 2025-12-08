import { getAllFollowersAndFollowingsInfo } from '@/actions/user'
import { useQuery } from '@tanstack/react-query'
import { Alert, Skeleton, Typography } from 'antd';
import React from 'react'
import css from '@/styles/followPersonsBody.module.css'
import UserBox from './UserBox';
import { useUser } from '@clerk/nextjs';

const FollowPersonsBody = ({id, type}) => {
  const {user: currentUser} = useUser(); 
    const {data: userData, isLoading: userDataLoading, isError: userDataError} = useQuery({
      queryKey: ["user", id, "followInfo"],
      queryFn: () => getAllFollowersAndFollowingsInfo(id),
      enabled: !!id,
      staleTime: 1000 * 60 * 20
    });

    const {data: currentUserData } = useQuery({
      queryKey: ["user", currentUser?.id, "followInfo"],
      queryFn: () => getAllFollowersAndFollowingsInfo(currentUser?.id),
      enabled: !!currentUser?.id,
      staleTime: 1000 * 60 * 20
    });

    if(userDataLoading) {
      return (
        <Skeleton.Button 
          active={true}
          size='large'
          style={{ width: "100%", height: "3.5rem"}}
        />
      )
    }

    if(userDataError) {
      return <Alert message="Error while fetching data" type='error' />
    }
  return (
    <div className={css.container}>
      <div className={css.head}>
        <Typography className='typoH5'>
          {type}
        </Typography>
      </div>
      {
        userData?.[type]?.length === 0 ? (
          <Alert message={"No " + type} type='info' />
        ) : (
          <div className={css.body}>
            {
              userData?.[type]?.map((person) => (
                <UserBox
                  key={
                    person?.[type === "followers" ? "followerId" : "followingId"]
                  } 
                  type={type === "followers" ? "follower" : "following"}
                  data={person}
                  loggedInUserData={currentUserData}
                />
              ))
            }
          </div>
        )
      }
    </div>
  )
}

export default FollowPersonsBody
import { getAllFollowersAndFollowingsInfo } from '@/actions/user'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import css from '@/styles/followInfoBox.module.css'
import Box from './Box/Box'
import { Skeleton, Space, Typography } from 'antd'

const FollowInfoBox = ({ id }) => {

    const { data, isLoading, isError } = useQuery({
        queryKey: ['user', id, 'followInfo'],
        queryFn: () => getAllFollowersAndFollowingsInfo(id),
        enabled: !!id,
        staleTime: 1000 * 60 * 20
    })

    if(isLoading) {
        return (
            <Skeleton.Button 
               active={true}
               size='large'
               style={{ width: '100%', height: '6rem'}}
            />
        )
    }
  return (
    <Box className={css.container}>
        <Space direction='vertical' align='center'>
            <Typography className={'typoH5'}>{data?.followers?.length}</Typography>
            <Typography className={'typoSubtitle2'}>Followers</Typography>
        </Space>
        <Space direction='vertical' align='center'>
            <Typography className={'typoH5'}>{data?.following?.length}</Typography>
            <Typography className={'typoSubtitle2'}>Followings</Typography>
        </Space>
    </Box>
  )
}

export default FollowInfoBox 
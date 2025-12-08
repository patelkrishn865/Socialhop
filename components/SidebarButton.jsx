'use client'
import { useSettingsContext } from '@/context/settings/settings-context'
import { Icon } from '@iconify/react'
import { Button, Typography } from 'antd'
import React from 'react'

const SidebarButton = () => {
    const { setSettings } = useSettingsContext();
  return (
    <Button
      type='text'
      onClick={() => 
        setSettings((prev) => ({
            ...prev,
            isSidebarOpen: !prev.isSidebarOpen
        }))
      }
    >
        <Typography>
            <Icon icon="heroicons-solid:menu-alt-2" width="22px" />
        </Typography>
    </Button>
  )
}

export default SidebarButton
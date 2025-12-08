'use client'

import { useSettingsContext } from '@/context/settings/settings-context'
import { Icon } from '@iconify/react'
import { Button } from 'antd'
import React from 'react'

const ModeButton = () => {
  const { setSettings } = useSettingsContext()

  return (
    <Button
      type="text"
      size="large"
      onClick={() =>
        setSettings((prev) => ({
          ...prev,
          theme: prev.theme === 'dark' ? 'light' : 'dark',
        }))
      }
    >
      <Icon
        icon="icon-park-solid:dark-mode"
        width="24"
        height="24"
      />
    </Button>
  )
}

export default ModeButton
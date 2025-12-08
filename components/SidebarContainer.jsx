// components/SidebarContainer.js   (or any path you like)

'use client' // ← Important! Makes it a Client Component

import { useState, useEffect } from "react"
import useWindowDimensions from "@/hooks/useWindowsDimensions"
import dynamic from "next/dynamic"
import css from "@/styles/sidebar.module.css"

// Dynamically import Drawer – this removes the SSR warning completely
const Drawer = dynamic(() => import("antd").then((mod) => mod.Drawer), {
  ssr: false,        // ← never renders on server
  loading: () => null // optional: avoids flash
})

const SidebarContainer = ({
  isDrawerOpen,
  setIsDrawerOpen,
  children,
  ...other
}) => {
  const { width } = useWindowDimensions()

  // If screen is small → show mobile drawer
  if (width <= 1268) {
    return (
      <Drawer
        open={isDrawerOpen}
        placement="left"
        onClose={() => setIsDrawerOpen(false)}
        width={280}
        className={css.sidebarContainer}
        {...other}
      >
        <div className={css.drawerContainer}>
          {children}
        </div>
      </Drawer>
    )
  }

  // Desktop → just show the sidebar normally
  return <>{children}</>
}

export default SidebarContainer
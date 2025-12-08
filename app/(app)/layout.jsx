import Box from "@/components/Box/Box";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { SettingsContextProvider } from "@/context/settings/settings-provider";
import ThemeProvider from "@/lib/ThemeProvider";
import css from "@/styles/homeLayout.module.css";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import React from "react";
import { Toaster } from "react-hot-toast";

const HomeLayout = ({ children }) => {
  const queryClient = new QueryClient()
  return (
    <SettingsContextProvider>
      <ThemeProvider>
        <HydrationBoundary state={dehydrate(queryClient)}>
        <Box
          type="baseBg"
          style={{
            position: "relative",
            width: "100vw",
            height: "100vh",
          }}
        >
          <div className={css.wrapper}>
            <Header />
            <div className={css.container}>
              <Sidebar />
              <div className={css.page_body}>
              {children}
            </div>
            </div>
          </div>
        </Box>
        </HydrationBoundary>
        <Toaster />
      </ThemeProvider>
    </SettingsContextProvider>
  );
};

export default HomeLayout;

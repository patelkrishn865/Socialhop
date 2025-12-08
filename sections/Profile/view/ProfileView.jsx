"use client";
import { useState } from "react";
import css from "@/styles/profileView.module.css";
import ProfileHead from "@/components/ProfileHead";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/actions/user";
import ProfileBody from "../ProfileBody";
import FollowPersonsBody from "@/components/FollowPersonsBody";

const ProfileView = ({ userId }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUser(userId),
  });
  const [Tab, setTab] = useState("1");

  return (
    <div className={css.wrapper}>
      <div className={css.container}>
        <ProfileHead
          data={data}
          isLoading={isLoading}
          isError={isError}
          userId={userId}
          Tab={Tab}
          setTab={setTab}
        />
        {Tab === "1" && (
          <ProfileBody
            userId={userId}
            data={data}
            isLoading={isLoading}
            isError={isError}
          />
        )}

        {Tab === "2" && (
          <FollowPersonsBody type={"followers"} id={userId} />
        )}

        {
          Tab === "3" && (
            <FollowPersonsBody type={"following"} id={userId} />
          )
        }
      </div>
    </div>
  );
};

export default ProfileView;

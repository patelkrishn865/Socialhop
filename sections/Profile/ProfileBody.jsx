import React from "react";
import css from "@/styles/profileView.module.css";
import FollowButton from "@/components/FollowButton";
import FollowInfoBox from "@/components/FollowInfoBox";
// import FriendsSuggestion from "@/components/FriendsSuggestion";
import PostGenerator from "@/components/PostGenerator";
import Posts from "@/components/Posts";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
const ProfileBody = ({ userId }) => {
  const { user: currentUser } = useUser();
  const isCurrentUser = currentUser?.id === userId;

  return (
    <div className={css.profileBody}>
      <div className={css.left}>
        <div className={css.sticky}>
          {!isCurrentUser && <FollowButton id={userId} />}

          <FollowInfoBox id={userId} />
        </div>
      </div>
      <div className={css.right}>
        {isCurrentUser && <PostGenerator />}
        <Posts id={userId} />
      </div>
    </div>
  );
};

export default ProfileBody;
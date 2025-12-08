import { SignIn } from "@clerk/nextjs";
import React from "react";

export const metadata = {
  title: 'Authentication'
}

const SignInPage = () => {
  return <SignIn />;
};

export default SignInPage;
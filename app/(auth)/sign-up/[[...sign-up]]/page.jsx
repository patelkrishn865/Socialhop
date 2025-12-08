import { SignUp } from "@clerk/nextjs";
import React from "react";

export const metadata = {
    title: 'Authentication'
  }
  

const SignUpPage = () => {
    return <SignUp />
}

export default SignUpPage
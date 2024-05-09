"use client";

import { signIn } from "next-auth/react";
import { Button } from "../ui/button";

export const SignIn = () => {
  return (
    <Button
      onClick={() => {
        void signIn();
      }}
    >
      Sign in
    </Button>
  );
};

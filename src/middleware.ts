import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname === "/") {
          return true;
        }

        return !!token?.email;
      },
    },
  },
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|auth|join|favicon.ico|robots.txt|$).*)"],
};

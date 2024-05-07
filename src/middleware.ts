export { auth as middleware } from "./server/auth";

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|auth|join|integrations|favicon.ico|robots.txt|$).*)",
  ],
};

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "../../../../prisma";

const GOOGLE_CLIENT_ID = process.env.NEXT_GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.NEXT_GOOGLE_CLIENT_SECRET!;

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error", // Error code passed in query string as ?error=
    verifyRequest: "/auth/verify-request", // (used for check email message)
  },
  callbacks: {},
});

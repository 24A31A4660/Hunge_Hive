import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDB from '../../../../lib/db';
import User from '../../../../models/User';
import { generateToken } from '../../../../lib/auth';

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        await connectDB();
        // find or create user based on email
        let dbUser = await User.findOne({ email: user.email });
        if (!dbUser) {
          // New Google users default to 'donor' role.
          // They can change their role from the profile/settings page.
          dbUser = await User.create({
            name: user.name,
            email: user.email,
            auth_provider: 'google',
            role: 'donor',
            isVerified: true,
            isActive: true,
            avatar: user.image
          });
        }
        return true;
      } catch (error) {
        console.error('OAuth signIn error:', error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: user.email });
          if (dbUser) {
            token.appToken = generateToken(dbUser._id, dbUser.role);
            token.appUser = {
              id: dbUser._id.toString(),
              name: dbUser.name,
              email: dbUser.email,
              role: dbUser.role,
              phone: dbUser.phone,
              avatar: dbUser.avatar,
              badges: dbUser.badges,
              totalDonations: dbUser.totalDonations,
              totalMeals: dbUser.totalMeals,
            };
          }
        } catch (error) {
          console.error('OAuth jwt error:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.appToken = token.appToken;
      session.appUser = token.appUser;
      return session;
    }
  },
  session: { strategy: "jwt" },
  pages: {
    signIn: '/login',
  }
});

export { handler as GET, handler as POST };

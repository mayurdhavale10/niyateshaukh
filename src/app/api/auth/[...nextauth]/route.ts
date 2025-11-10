import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from '@/lib/mongodb';
import AdminModel from '@/lib/models/Admin';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  
  callbacks: {
    async signIn({ user }) {
      // Allow ALL users to sign in
      try {
        if (user.email === 'niyateshaukkalyan@gmail.com') {
          await connectDB();
          await AdminModel.findOneAndUpdate(
            { email: user.email },
            {
              email: user.email,
              name: user.name || 'Admin',
              role: 'super_admin',
              lastLogin: new Date(),
            },
            { upsert: true, new: true }
          );
        }
      } catch (error) {
        console.error('DB error (but allowing sign in):', error instanceof Error ? error.message : String(error));
      }

      return true; // Always allow sign in
    },

    async redirect({ url, baseUrl }) {
      // After successful sign in, redirect to homepage
      return baseUrl;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.role = user.email === 'niyateshaukkalyan@gmail.com' ? 'super_admin' : 'user';
      }
      return token;
    },
  },

  pages: {
    signIn: '/admin/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
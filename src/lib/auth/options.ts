import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import bcrypt from "bcryptjs";
import { getClientPromise, getDatabase } from "@/lib/mongo";

/**
 * Only wire up the MongoDB adapter when a connection string is configured.
 * In local dev without MONGODB_URI this avoids building a rejected client
 * promise at module load, which would otherwise surface as an unhandled
 * promise rejection and crash the dev server. Session strategy is JWT, so
 * auth still functions (sign-in flows that need the DB simply fail safely).
 */
const clientPromise =
  typeof process.env.MONGODB_URI === "string" && process.env.MONGODB_URI
    ? getClientPromise()
    : null;
// Attach a no-op catch so a missing/unreachable DB never becomes an
// unhandled rejection at startup.
clientPromise?.catch(() => {});

export const authOptions: NextAuthOptions = {
  ...(clientPromise
    ? { adapter: MongoDBAdapter(clientPromise, { databaseName: "aimtrainer" }) }
    : {}),
  providers: [
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const { email, password } = credentials;

        // Validate password length (8–128 characters)
        if (password.length < 8 || password.length > 128) {
          return null;
        }

        const db = await getDatabase();
        const user = await db.collection("users").findOne({ email });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.displayName || user.email,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID ?? "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

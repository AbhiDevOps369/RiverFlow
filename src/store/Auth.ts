import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";

import {AppwriteException, ID, Models} from "appwrite"
import { account } from "@/models/client/config";


export interface UserPrefs {
  reputation: number
}

interface IAuthStore {
  session: Models.Session | null;
  jwt: string | null
  user: Models.User<UserPrefs> | null
  hydrated: boolean

  setHydrated(): void;
  verfiySession(): Promise<void>;
  login(
    email: string,
    password: string
  ): Promise<
  {
    success: boolean;
    error?: AppwriteException| null
  }>
  createAccount(
    name: string,
    email: string,
    password: string
  ): Promise<
  {
    success: boolean;
    error?: AppwriteException| null
  }>
  forgotPassword(email: string, url: string): Promise<{ success: boolean; error?: AppwriteException | null }>;
  resetPassword(userId: string, secret: string, password: string): Promise<{ success: boolean; error?: AppwriteException | null }>;
  loginWithOAuth(provider: string): Promise<void>;
  logout(): Promise<void>
}


export const useAuthStore = create<IAuthStore>()(
  persist(
    immer((set) => ({
      session: null,
      jwt: null,
      user: null,
      hydrated: false,

      setHydrated() {
        set({hydrated: true})
      },

      async verfiySession() {
        try {
          const session = await account.getSession("current")
          set({session})

        } catch (error) {
          console.log(error)
        }
      },

      async login(email: string, password: string) {
        try {
          const session = await account.createEmailPasswordSession(email, password)
          const [user, {jwt}] = await Promise.all([
            account.get<UserPrefs>(),
            account.createJWT()

          ])
          if (!user.prefs?.reputation) await account.updatePrefs<UserPrefs>({
            reputation: 0
          })

          set({session, user, jwt})
          
          return { success: true}

        } catch (error) {

          console.log(error)
          return {
            success: false,
            error: error instanceof AppwriteException ? error: null,
            
          }
        }
      },

      async createAccount(name:string, email: string, password: string) {
        try {
          await account.create(ID.unique(), email, password, name)
          return {success: true}
        } catch (error) {
          console.log(error)
          return {
            success: false,
            error: error instanceof AppwriteException ? error: null,
            
          }
        }
      },

      async forgotPassword(email: string, url: string) {
        try {
          await account.createRecovery(email, url);
          return { success: true };
        } catch (error) {
          console.log(error);
          return {
            success: false,
            error: error instanceof AppwriteException ? error : null,
          };
        }
      },

      async resetPassword(userId: string, secret: string, password: string) {
        try {
          await account.updateRecovery(userId, secret, password, password);
          return { success: true };
        } catch (error) {
          console.log(error);
          return {
            success: false,
            error: error instanceof AppwriteException ? error : null,
          };
        }
      },

      async loginWithOAuth(provider: string) {
        try {
          await account.createOAuth2Session(
            provider,
            `${window.location.origin}/`,
            `${window.location.origin}/login`
          );
        } catch (error) {
          console.log(error);
        }
      },

      async logout() {
        try {
          await account.deleteSessions()
          set({session: null, jwt: null, user: null})
          
        } catch (error) {
          console.log(error)
        }
      },
    })),
    {
      name: "auth",
      onRehydrateStorage(){
        return (state, error) => {
          if (!error) state?.setHydrated()
        }
      }
    }
  )
)
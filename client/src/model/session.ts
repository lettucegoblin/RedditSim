// in a pure MVC pattern we wouldn't include vue in the model.
import { reactive } from 'vue'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'
import * as myFetch from './myFetch' // This messes with tree shaking. It's better to import only what you need.
import type { DataEnvelope } from './myFetch'
//import { type User, getUserByEmail } from './users'

const toast = useToast()

const session = reactive({
  user: null as User | null,
  token: null as string | null,
  redirectUrl: null as string | null,
  messages: [] as {
    type: string
    text: string
  }[],
  loading: 0 // number of pending requests loading. When it's 0, we hide the loading indicator.
})

export interface User {
  _id: string
  username: string
  role: string
}

export interface UserPending {
  username: string
  passcode: string
  createdAt: number
}

export function api(action: string, body?: unknown, method?: string, headers?: any) {
  session.loading++

  if(session.token){
    headers = headers ?? {};
    headers['Authorization'] = `Bearer ${session.token}`;
  }
  return myFetch
    .api(`${action}`, body, method, headers)
    .catch(err=> showError(err))
    .finally(() => session.loading--)
}

export function showError(error: string | { message: string }) {
  const errMessage = typeof error === 'string' ? error : error.message
  console.error(errMessage)
  toast.error(errMessage)
}

// We don't expose the session object directly, but rather expose a function that returns it.
// So that the view isnt tempted to modify the session object directly.
export function getSession() {
  return session
}
export async function createUser(user: UserPending): Promise<DataEnvelope<UserPending>> {
  return await api('users/register', user, 'POST')
}

export function useLogin(){
  const router = useRouter();

  return {
    async login(username: string, passcode: string): Promise< User | null> {
      const response = await api("users/login", { username, passcode }, "POST");

      session.user = response.user;
      session.token = response.token;

      router.push(session.redirectUrl || "/");
      return session.user;
    },
    logout(){
      session.user = null;
      router.push("/login");
    }
  }
}

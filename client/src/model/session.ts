
// in a pure MVC pattern we wouldn't include vue in the model. 
import { reactive } from 'vue';
import { useToast } from 'vue-toastification'
import * as myFetch from './myFetch' // This messes with tree shaking. It's better to import only what you need.
//import { type User, getUserByEmail } from './users'

const toast = useToast();

const session = reactive({
  //user: null as User | null,
  redirectUrl: null as string | null,
  messages: [] as {
    type: string,
    text: string
  }[],
  loading: 0 // number of pending requests loading. When it's 0, we hide the loading indicator.
})

export function api(action: string, body?: unknown, method?: string) {
  session.loading++;
  return myFetch.api(`${action}`, body, method)
  .catch(showError)
  .finally(() => session.loading--);
}

export function showError(error: string | { message: string }) {
  const errMessage = typeof error === 'string' ? error : error.message;
  console.error(errMessage);
  toast.error(errMessage)
}

// We don't expose the session object directly, but rather expose a function that returns it.
// So that the view isnt tempted to modify the session object directly.
export function getSession() {
  return session;
}

export function getSubredditPosts(subreddit: string) {
  return api(`subreddits/${subreddit}/posts`);
}

/*
export function useLogin() {
  const router = useRouter();
  return { 
    async login(email: string, password: string): Promise<User | null> {
      session.user = await api("users/login", { email, password })
      router.push(session.redirectUrl || '/')
      return session.user;
    }, 
    logout() {
      session.user = null;
      router.push('/login');
    }
  }
}
*/
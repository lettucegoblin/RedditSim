<script setup lang="ts">
import { ref } from 'vue'
// router
import { RouterLink } from 'vue-router'
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems
} from '@headlessui/vue'
import SearchVue from '@/components/Search.vue'
const darkMode = ref(true)
import { getSession, useLogin } from '@/model/session'
const session = getSession()
const { login, logout } = useLogin()
const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
  if (darkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const navigation = [
  { name: 'Dashboard', href: '#', current: true },
  { name: 'Team', href: '#', current: false },
  { name: 'Projects', href: '#', current: false },
  { name: 'Calendar', href: '#', current: false }
]
</script>

<template>
  <header>
    <Disclosure as="nav" v-slot="{ open }">
      <div class="">
        <div class="relative flex h-20 items-center justify-between border-b reddit-divider-color">
          <div class="flex">
            <div class="inset-y-0 left-0 flex items-center sm:hidden">
              <!-- Mobile menu button-->
              <DisclosureButton
                class="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <span class="absolute -inset-0.5" />
                <span class="sr-only">Open main menu</span>
                <font-awesome-icon v-if="!open" icon="bars" class="block h-6 w-6" />
                <font-awesome-icon v-else icon="times" class="block h-6 w-6" />
              </DisclosureButton>
            </div>
            <div class="flex flex-shrink-0 items-center">
              <RouterLink to="/">
                <img class="h-10 w-auto" src="@/assets/logo.png" alt="Reddit Sim" />
              </RouterLink>
            </div>
          </div>
          <SearchVue searchType="posts" class="ml-6"/>
          <div class="flex static inset-auto ml-6 pr-0">
            <div class="flex items-center space-x-2">
              <button
                type="button"
                class="relative rounded-full w-10 h-10 hover:text-gray-500 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                <span class="absolute -inset-1.5" />
                <span class="sr-only">View notifications</span>
                <font-awesome-icon icon="bell" class="h-6 w-6" />
              </button>
              <button
                @click="toggleDarkMode"
                type="button"
                class="relative rounded-full w-10 h-10 hover:text-gray-500 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                <span class="absolute -inset-1.5" />
                <span class="sr-only">Toggle Dark Mode</span>
                <font-awesome-icon :icon="darkMode ? 'moon' : 'sun'" class="h-6 w-6" />
              </button>
            </div>
            <!-- Profile dropdown -->
            <Menu v-if="session.user"  as="div" class="relative ml-3">
              <div>
                <MenuButton
                  class="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 "
                >
                  <span class="absolute -inset-1.5" />
                  <span class="sr-only">Open user menu</span>
                  <img
                    class="h-10 w-auto rounded-full"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
                  />
                </MenuButton>
              </div>
              <transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <MenuItems
                  class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-reddit-primary-dark"
                >
                  <MenuItem v-slot="{ active }">
                    <a
                      href="#"
                      :class="[
                        active ? 'bg-gray-100' : '',
                        'block px-4 py-2 text-sm text-gray-700'
                      ]"
                      >Your Profile</a
                    >
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <a
                      href="#"
                      :class="[
                        active ? 'bg-gray-100' : '',
                        'block px-4 py-2 text-sm text-gray-700'
                      ]"
                      >Settings</a
                    >
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <a
                      href="#"
                      :class="[
                        active ? 'bg-gray-100' : '',
                        'block px-4 py-2 text-sm text-gray-700'
                      ]"
                      >Sign out</a
                    >
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>
            <div v-else>
            <RouterLink  to="/login" class="ml-3">
              <button
                type="button"
                class="relative rounded-full w-10 h-10 hover:text-gray-500 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                <span class="absolute -inset-1.5" />
                <span class="">Sign In</span>
                <font-awesome-icon icon="sign-in-alt" class="h-6 w-6" />
              </button>
            </RouterLink>
            <!--Sign Up-->
            <RouterLink to="/signup" class="ml-3">
              <button
                type="button"
                class="relative rounded-full w-10 h-10 hover:text-gray-500 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                <span class="absolute -inset-1.5" />
                <span class="">Sign Up</span>
                <font-awesome-icon icon="user-plus" class="h-6 w-6" />
              </button>
            </RouterLink>
          </div>
          </div>
        </div>
      </div>

      <DisclosurePanel class="sm:hidden">
        <div class="space-y-1 px-2 pb-3 pt-2">
          <DisclosureButton
            v-for="item in navigation"
            :key="item.name"
            as="a"
            :href="item.href"
            :class="[
              item.current
                ? 'text-gray-800 bg-gray-200 dark:bg-gray-900 dark:text-white'
                : 'text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white',
              'block rounded-md px-3 py-2 text-base font-medium'
            ]"
            :aria-current="item.current ? 'page' : undefined"
            >{{ item.name }}</DisclosureButton
          >
        </div>
      </DisclosurePanel>
    </Disclosure>
  </header>
</template>

<style scoped></style>

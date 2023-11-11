//import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './tailwind.css'

// ------------------ Font Awesome ------------------
/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'
/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
/* import specific icons */
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'
/* add icons to the library */
library.add(faSun, faMoon)
// ------------------ Font Awesome ------------------

const app = createApp(App)
.use(createPinia())
.use(router)
.component('font-awesome-icon', FontAwesomeIcon)
.mount('#app')

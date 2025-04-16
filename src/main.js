import './assets/main.css'

import { createApp } from 'vue'
import { createStore } from 'vuex'
import App from './App.vue'
import router from './router'

// Create Vuex store
const store = createStore({
  state() {
    return {
      // Your state here
    }
  },
  mutations: {
    // Your mutations here
  },
  actions: {
    // Your actions here
  }
})

const app = createApp(App)
app.use(store)
app.use(router)
app.mount('#app')

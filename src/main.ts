import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import Antd from 'ant-design-vue'
import router from './router'
import { i18n } from './i18n'
import App from './App.vue'
import './index.css'

const app = createApp(App)

app.use(Antd)
app.use(VueQueryPlugin)
app.use(router)
app.use(i18n)

app.mount('#app')

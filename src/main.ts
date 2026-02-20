import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import Antd from 'ant-design-vue'
import App from './App.vue'
import './index.css'

const app = createApp(App)

app.use(Antd)
app.use(VueQueryPlugin)

app.mount('#app')

import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import Antd from 'ant-design-vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import router from './router'
import { i18n } from './i18n'
import App from './App.vue'
import './index.css'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent])

const app = createApp(App)

app.use(Antd)
app.use(VueQueryPlugin)
app.use(router)
app.use(i18n)

app.config.errorHandler = (err, instance, info) => {
  console.error('[Vue Global Error]', err)
  console.error('Component:', instance)
  console.error('Info:', info)
}

app.mount('#app')

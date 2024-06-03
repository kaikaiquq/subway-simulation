import axios from 'axios'
import qs from 'qs'
import { Message, Loading } from 'element-ui'

let loadingInstance = null
// 携带session
// axios.defaults.withCredentials = true
// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_OUR_SERVICES, // api 的 base_url
  timeout: 60000 // 请求超时时间
})

// 请求 拦截器
service.interceptors.request.use(config => {
  // POST 请求采用 form表单还是 json 上传，默认form
  if (config.headers['Content-Type'] === 'application/json;charset=UTF-8') {
    return config
  }
  if (config.method.toUpperCase() === 'POST' && (!config.dataType || config.dataType.toUpperCase() !== 'FORM')) {
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    config.transformRequest = [data => qs.stringify(data)]
  }
  return config
})

// response 拦截器
service.interceptors.response.use(response => {
  startLoading()
  /**
   * code为非200是抛错 可结合自己业务进行修改
   */
  const data = response.data
  if (response.status !== 200) {
    // Message({
    //   message: response.message,
    //   type: 'error',
    //   duration: 5 * 1000
    // })
    endLoading()
    return Promise.reject(new Error('error'))
  } else {
    if (response.status === 200) {
      if (data.code === 200 || data.server_status === 200) {
        endLoading()
        return data
      } else if (data.code === 401) {
        endLoading()
        return Promise.reject(data)
      } else if (data.code === 40102) {
        endLoading()
        return Promise.reject(data)
      } else {
        endLoading()
        return Promise.reject(data)
      }
    }
  }
}, error => {
  console.log('err' + error) // for debug
  // Message({
  //   message: error.message,
  //   type: 'error',
  //   duration: 5 * 1000
  // })
  endLoading()
  return Promise.reject(error)
})

function startLoading () {
  loadingInstance = Loading.service({
    lock: true,
    customClass: 'create-isLoading', // *这里设置他的class名称,这里最重要
    text: '数据加载中......',
    spinner: 'el-icon-loading',
    background: 'rgba(0, 0, 0, 0.2)',
    fullscreen: true
  })
}

function endLoading () {
  setTimeout(() => {
    loadingInstance.close()
  }, 100)
}

export default service

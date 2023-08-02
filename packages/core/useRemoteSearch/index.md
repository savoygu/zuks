---
category: Form 表单组件
---

# useRemoteSearch

远程搜索

## 使用

### 基本使用

默认情况下会使用 `@vueuse/core` 下的 `useFetch` 来发送 `POST` 请求获取远程搜索数据。`data` 对象包含请求的结果，`loading` 对象将指示请求是否正在加载，`onRemoteSearch` 函数用于传入输入的值并进行远程搜索调用。

```ts
import { useRemoteSearch } from 'zuks'

const { data, loading, onRemoteSearch } = useRemoteSearch({ url })
```

### 支持 GET 请求

对于 GET 请求会在调用 `onRemoteSearch 函数时将请求参数拼接到 url 上。

```ts
import { useRemoteSearch } from 'zuks'

const { data, loading, onRemoteSearch } = useRemoteSearch({
  url,
  fetchOptions: { method: 'GET' }
})
```

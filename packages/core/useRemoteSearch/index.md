---
category: Form 表单组件
---

# useRemoteSearch

远程搜索 - 通常用于下拉选项(Select)

## 使用

### 基本使用

默认情况下会使用 `@vueuse/core` 下的 `useFetch` 来发送 `POST` 请求获取远程搜索数据。

- `data` 对象包含请求的结果；
- `loading` 对象将指示请求是否正在加载；
- `onRemoteSearch` 函数用于传入输入的值并进行远程搜索调用。

```ts
import { useRemoteSearch } from '@zuks/core'

const { data, loading, onRemoteSearch } = useRemoteSearch({ url })
```

由于默认是 `POST` 请求，请求参数的属性默认是 `name`，当然，也可以通过 `requestKey` 来覆盖：

```ts
import { useRemoteSearch } from '@zuks/core'

const { data, loading, onRemoteSearch } = useRemoteSearch({
  url,
  requestKey: 'value'
})
```

在这种情况下，请求参数会是如下格式：

```json
{
  "value": "<input>"
}
```

### 支持 GET 请求

对于 GET 请求会在调用 `onRemoteSearch` 函数时将请求参数拼接到 url 上。

```ts
import { useRemoteSearch } from '@zuks/core'

const { data, loading, onRemoteSearch } = useRemoteSearch({
  url,
  fetchOptions: { method: 'GET' }
})
```

### 支持额外的请求参数

有时，会在搜索时附加额外参数，这里可以通过 `extraData` 来指定：

> extraData 可以是一个对象，也可以是一个 ref 或 compute。

```ts
import { useRemoteSearch } from '@zuks/core'

const { data, loading, onRemoteSearch } = useRemoteSearch({
  url,
  extraData: {
    belongToId: '<uuid>'
  }
})
```

在这种情况下，请求参数会是如下格式：

```json
{
  "name": "<input>",
  "belongToId": "<uuid>"
}
```

### 自定义响应结果处理

对于响应结果，也许有不同的格式，这里通常认为是一个对象格式的，其中返回的数据应该通过 `data` 来承载。如果不是 `data` 可以通过 `responseKey` 来做控制。

这里也做了一些兼容处理：

- 如果不是 `data` 会尝试用 `result`
- 如果直接返回了一个数组，则直接当做响应结果返回。

当然了，可能还会有数据格式上的不同，对于下拉选项组件，通常是 `label` 和 `value` 作为 props 的。如果响应的数据是其他的属性，可以通过 `kvOrCb` 来做设置。

如果只是属性上的不同，比如返回的数据格式是 `[{ "name": "<name>", "id": "<id>" }]` ，那么会帮你转换为 `label` 和 `value` 的格式：

```ts
import { useRemoteSearch } from '@zuks/core'

const { data, loading, onRemoteSearch } = useRemoteSearch({
  url,
  kvOrCb: ['name', 'id']
})
```

在这种情况下，将返回如下格式：

```json
[
  { "label": "<name>", "value": "<id>" }
]
```

如果你想自己去处理响应结果，`kvOrCb` 也支持回调函数的格式，其中回调函数的参数 `result` 为响应结果：

> 处理后的结果会赋值给 `useRemoteSearch` 返回的 `data`

```ts
import { useRemoteSearch } from '@zuks/core'

const { data, loading, onRemoteSearch } = useRemoteSearch({
  url,
  kvOrCb: (result) => {
    return []
  }
})
```

### 首次自动请求

在某些场景下，下拉选项会需要默认展示一些数据，在这种情况下可以通过 `firstAutoSearch` 来进行一次自动请求，需要说明的是，此时的搜索值为空字符串。

```ts
import { useRemoteSearch } from '@zuks/core'

const { data, loading, onRemoteSearch } = useRemoteSearch({
  url,
  firstAutoSearch: true
})
```

### 自定义 fetch

默认的 `useFetch` 并不能很好的应对一些场景，比如出现服务器异常的情况。

比较好的实践是在项目中对 `useFetch` 统一封装，覆盖请求的通用场景。

```ts
import { useRemoteSearch } from '@zuks/core'

const { data, loading, onRemoteSearch } = useRemoteSearch({
  url,
  fetcher: myUseFetch,
  // fetcherOptions: {} // 指定 fetcher 参数项
})
```

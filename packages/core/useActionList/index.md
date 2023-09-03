---
category: Data 数据展示
---

# useActionList

列表操作 - 通常用于表格(Table)

## 使用

### 基本使用

最常见的场景是应用于表格的操作列，比如删除，状态修改操作等，需要表格的每一行的操作按钮做 loading，同时搭配弹窗做二次确认等。

```ts
import { useActionList } from '@zuks/core'

const { actionVisible, operating, currentRow, toggleAction, onActionRow, makeActionMap } = useRemoteSearch()
```

- `actionVisible` 可以控制弹窗显示/隐藏。
- `operating` 在执行请求时，表示请求状态。
- `currentRow` 表示当前正在操作的行。
- `toggleAction` 用来设置、清空当前行的数据并控制 `actionVisible` 的值。
- `onActionRow` 用来做请求，同时控制请求状态 `operating`。

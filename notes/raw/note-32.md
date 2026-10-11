---
date: 2026-07-18
aliases:
  - UART
  - RS-232
---
# 数据通信
![笔记截图](../../assets/notes/256.webp)
![笔记截图](../../assets/notes/257.webp)
![笔记截图](../../assets/notes/258.webp)
![笔记截图](../../assets/notes/259.webp)
![笔记截图](../../assets/notes/260.webp)
# 串口-232
![笔记截图](../../assets/notes/261.webp)
![笔记截图](../../assets/notes/262.webp)
![笔记截图](../../assets/notes/263.webp)
![笔记截图](../../assets/notes/264.webp)
![笔记截图](../../assets/notes/265.webp)
# USART
![笔记截图](../../assets/notes/266.webp)
![笔记截图](../../assets/notes/267.webp)
![笔记截图](../../assets/notes/268.webp)
![笔记截图](../../assets/notes/269.webp)
## 设置波特率
### F1
![笔记截图](../../assets/notes/270.webp)
man是整数，fra是小数
![笔记截图](../../assets/notes/271.webp)
### F4
![笔记截图](../../assets/notes/272.webp)
![笔记截图](../../assets/notes/273.webp)
### H7
![笔记截图](../../assets/notes/274.webp)

## 寄存器
![笔记截图](../../assets/notes/275.webp)
![笔记截图](../../assets/notes/276.webp)
![笔记截图](../../assets/notes/277.webp)
![笔记截图](../../assets/notes/278.webp)
![笔记截图](../../assets/notes/279.webp)
![笔记截图](../../assets/notes/280.webp)

# STM32 UART 中断接收总结笔记

## 1. 工程现状

当前工程可以正常编译，Keil 构建结果为：

```
0 Error(s), 0 Warning(s)
```

后续修改时，如果把 `g_rx_buffer` 也加上 `volatile`，可能会出现类型不匹配警告。

## 2. 当前实现逻辑

程序使用 USART1 进行中断接收：

```
HAL_UART_Receive_IT(&huart1, g_rx_buffer, 1);
```

含义是：每次接收 1 个字节，接收完成后进入 UART 接收完成回调函数。

当前逻辑大致是：

```
flowchart TD
    A["开启 UART 中断接收 1 字节"] --> B["收到 1 字节"]
    B --> C["进入 HAL_UART_RxCpltCallback"]
    C --> D["设置 g_usart_rx_flag = 1"]
    D --> E["主循环检测 flag"]
    E --> F["发送 g_rx_buffer 中的数据"]
```

## 3. 主要问题

### 3.1 `g_usart_rx_flag` 应该加 `volatile`

`g_usart_rx_flag` 同时被中断和主循环访问：

```
g_usart_rx_flag = 1;
```

主循环中读取：

```
if (g_usart_rx_flag == 1)
```

这类变量应该声明为：

```
volatile uint8_t g_usart_rx_flag = 0;
```

原因是：  
中断会随时修改这个变量，`volatile` 可以提醒编译器每次都从内存读取它，而不是使用缓存值。

### 3.2 `g_rx_buffer` 不建议加 `volatile`

不要写成：

```
volatile uint8_t g_rx_buffer[1];
```

因为 HAL 函数原型需要的是普通指针：

```
uint8_t *
```

如果传入 `volatile uint8_t *`，Keil 会警告：

```
warning: #167-D: argument of type "volatile uint8_t *" is incompatible with parameter of type "uint8_t *"
```

推荐写法：

```
uint8_t g_rx_buffer[1];
volatile uint8_t g_usart_rx_flag = 0;
```

### 3.3 不建议在 `USART1_IRQHandler()` 里重新开启接收

不推荐这样写：

```
void USART1_IRQHandler(void)
{
    HAL_UART_IRQHandler(&huart1);
    HAL_UART_Receive_IT(&huart1, g_rx_buffer, 1);
}
```

原因是：  
`USART1_IRQHandler()` 是串口总中断入口，不一定每次进来都是“接收完成”。  
更合适的位置是接收完成回调函数。

### 3.4 `printf("\r\n")` 不一定会从串口发出

如果没有实现 `fputc()` 或 `__io_putchar()` 重定向，`printf()` 不一定会通过 USART1 输出。

因此推荐直接使用：

```
HAL_UART_Transmit(&huart1, (uint8_t *)"\r\n", 2, 1000);
```

### 3.5 等待 TC 标志可能卡死

原代码中有：

```
while(__HAL_UART_GET_FLAG(&huart1, UART_FLAG_TC) != 1);
```

这个等待没有超时机制。  
如果 UART 状态异常，程序可能一直卡在这里。

`HAL_UART_Transmit()` 本身已经带有超时参数，一般不需要再手动等待 TC。

## 4. 推荐修改方式

### 4.1 修改 `usart.c`

```
uint8_t g_rx_buffer[1];
volatile uint8_t g_usart_rx_flag = 0;
```

### 4.2 修改 `usart.h`

```
extern uint8_t g_rx_buffer[1];
extern volatile uint8_t g_usart_rx_flag;
```

### 4.3 修改 `USART1_IRQHandler()`

```
void USART1_IRQHandler(void)
{
    HAL_UART_IRQHandler(&huart1);
}
```

### 4.4 修改接收完成回调函数

```
void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart)
{
    if (huart->Instance == USART1)
    {
        g_usart_rx_flag = 1;
        HAL_UART_Receive_IT(&huart1, g_rx_buffer, 1);
    }
}
```

### 4.5 修改主循环处理逻辑

```
if (g_usart_rx_flag == 1)
{
    uint8_t ch = g_rx_buffer[0];
    g_usart_rx_flag = 0;

    HAL_UART_Transmit(&huart1, &ch, 1, 1000);
    HAL_UART_Transmit(&huart1, (uint8_t *)"\r\n", 2, 1000);
}
else
{
    HAL_Delay(10);
}
```

## 5. 推荐后的程序流程

```
flowchart TD
    A["MX_USART1_UART_Init"] --> B["HAL_UART_Receive_IT 开启第一次接收"]
    B --> C["USART1 收到 1 字节"]
    C --> D["USART1_IRQHandler"]
    D --> E["HAL_UART_IRQHandler"]
    E --> F["HAL_UART_RxCpltCallback"]
    F --> G["设置 g_usart_rx_flag = 1"]
    G --> H["重新开启下一次 HAL_UART_Receive_IT"]
    H --> I["主循环检测 flag"]
    I --> J["保存 g_rx_buffer[0] 到 ch"]
    J --> K["清除 g_usart_rx_flag"]
    K --> L["通过 HAL_UART_Transmit 回显 ch"]
```

## 6. 最终结论

对于“收到 1 个字节就回显 1 个字节”的实验，推荐使用：

```
uint8_t g_rx_buffer[1];
volatile uint8_t g_usart_rx_flag = 0;
```

关键点：

- `g_usart_rx_flag` 要加 `volatile`
    
- `g_rx_buffer` 不加 `volatile`
    
- 在 `HAL_UART_RxCpltCallback()` 里重新开启接收
    
- 不用 `printf()` 输出换行，直接用 `HAL_UART_Transmit()`
    
- 不要使用没有超时的死等语句
    

如果后续要接收字符串、连续数据或不定长数据，建议升级为：

- 环形缓冲区
    
- DMA 接收
    
- 空闲中断接收



---
date: 2026-07-17
aliases:
  - NVIC
  - EXTI
---

# NVIC
## 概念总简图
![笔记截图](../../assets/notes/113.webp)
## 原理
![笔记截图](../../assets/notes/114.webp)
- NVIC 物理上**属于 Cortex‑M 内核**，不是外设；
- 但内核内部有两套管理单元：NVIC 只管外设中断，SCB 专门管内核系统异常；
- **NVIC 嵌套向量中断控制器**（集成在内核内部，和 CPU 同一时钟域，不是片上外设）
- SCB 系统控制块（和 NVIC 共用一块内核系统地址区，同属内核系统模块）
![笔记截图](../../assets/notes/115.webp)
![笔记截图](../../assets/notes/116.webp)
![笔记截图](../../assets/notes/117.webp)
- 外部外设中断：优先级存在 **IPR**（NVIC 寄存器）
- 内核系统异常：优先级存在 **SHPR**（System Handler Priority Register，SCB 寄存器）
- AIRCR 统一控制**优先级分组规则**（抢占位 + 子优先级分配），两套寄存器共用同一套分组逻辑。
这是内核中断以及它的总表![笔记截图](../../assets/notes/118.webp)
![笔记截图](../../assets/notes/119.webp)
## 中断优先级
![笔记截图](../../assets/notes/120.webp)
![笔记截图](../../assets/notes/121.webp)
![笔记截图](../../assets/notes/122.webp)
## 使用NVIC
![笔记截图](../../assets/notes/123.webp)
# EXTI
## EXTI总述
![笔记截图](../../assets/notes/124.webp)
![笔记截图](../../assets/notes/125.webp)
![笔记截图](../../assets/notes/126.webp)
## EXTI工作原理（F1/F4/F7）
![笔记截图](../../assets/notes/127.webp)
## EXTI工作原理（H7）
![笔记截图](../../assets/notes/128.webp)
![笔记截图](../../assets/notes/129.webp)
## EXTI的映射关系
![笔记截图](../../assets/notes/130.webp)
关于AFIO本身![笔记截图](../../assets/notes/131.webp)
![笔记截图](../../assets/notes/132.webp)
![笔记截图](../../assets/notes/133.webp)
![笔记截图](../../assets/notes/134.webp)
![笔记截图](../../assets/notes/135.webp)

# 实操问题
````
## 问题现象

使用 PA11 外接按键，想通过按键中断控制 PB5 上的 LED 亮灭。

一开始出现的问题：

- 按下 PA11 按键后，PB5 LED 没有反应
- 后来修改后，LED 只翻转了一次，之后又不响应

---

## 硬件逻辑

按键模块接法：

```text
S / OUT -> PA11
+       -> 3.3V
- / GND -> GND
````

按键电平逻辑：

```
松开按键：PA11 = 高电平
按下按键：PA11 = 低电平
```

所以按下按键的瞬间，PA11 的电平变化是：

```
高电平 -> 低电平
```

这属于**下降沿**。

---

## 错误 1：中断触发沿配置错误

一开始 PA11 配置成了：

```
GPIO_InitStruct.Mode = GPIO_MODE_IT_RISING;
GPIO_InitStruct.Pull = GPIO_PULLUP;
```

这个配置表示：

- PA11 使用上拉
- PA11 默认是高电平
- 只有从低电平变成高电平时，才触发中断

但是我的按键是按下时变成低电平，也就是：

```
高电平 -> 低电平
```

所以按下时不会触发上升沿中断。

更关键的是，我在中断回调里还写了判断：

```
if(HAL_GPIO_ReadPin(GPIOA, GPIO_PIN_11) == 0)
{
    HAL_GPIO_TogglePin(GPIOB, GPIO_PIN_5);
}
```

如果使用上升沿触发，中断发生时 PA11 已经是高电平，所以这个判断不会成立。

### 正确配置

PA11 应该配置成下降沿中断：

```
GPIO_InitStruct.Pin = GPIO_PIN_11;
GPIO_InitStruct.Mode = GPIO_MODE_IT_FALLING;
GPIO_InitStruct.Pull = GPIO_PULLUP;
HAL_GPIO_Init(GPIOA, &GPIO_InitStruct);
```

CubeMX 中对应配置：

```
GPIO mode: External Interrupt Mode with Falling edge trigger detection
GPIO Pull-up/Pull-down: Pull-up
NVIC: EXTI line[15:10] interrupt Enable
```

---

## 错误 2：在中断回调函数里使用 HAL_Delay

一开始我在中断回调里写了：

```
void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin)
{
    HAL_Delay(20);

    if(GPIO_Pin == GPIO_PIN_11)
    {
        if(HAL_GPIO_ReadPin(GPIOA, GPIO_PIN_11) == 0)
        {
            HAL_GPIO_TogglePin(GPIOB, GPIO_PIN_5);
        }
    }
}
```

这里的问题是：

> `HAL_Delay()` 不适合放在中断服务函数或中断回调函数里。

`HAL_Delay()` 依赖 `SysTick` 系统滴答计时。

如果当前外部中断的优先级高于 `SysTick`，程序进入外部中断后，`SysTick` 可能无法正常打断当前中断，导致 `HAL_Delay()` 一直等不到时间变化。

结果就是程序可能卡在中断里，表现为：

- 第一次按键可能有反应
- 后续按键不再响应
- 程序像卡死了一样

---

## 正确写法：中断中只做简单操作

最简单的测试写法：

```
void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin)
{
    if(GPIO_Pin == GPIO_PIN_11)
    {
        HAL_GPIO_TogglePin(GPIOB, GPIO_PIN_5);
    }
}
```

这个写法可以验证：

- PA11 中断是否正常进入
- PB5 LED 是否可以正常翻转

---

## 如果需要按键消抖

不要在中断里使用 `HAL_Delay()`。

可以使用 `HAL_GetTick()` 做时间判断：

```
void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin)
{
    static uint32_t last_tick = 0;

    if(GPIO_Pin == GPIO_PIN_11)
    {
        if(HAL_GetTick() - last_tick > 20)
        {
            last_tick = HAL_GetTick();
            HAL_GPIO_TogglePin(GPIOB, GPIO_PIN_5);
        }
    }
}
```

这样不会在中断里阻塞等待。

---

## 本次问题总结

这次主要错在两个地方：

1. PA11 中断触发沿配置错误  
    按键按下是 `高电平 -> 低电平`，应该使用下降沿中断。
    
2. 在中断回调里使用了 `HAL_Delay()`  
    `HAL_Delay()` 依赖 `SysTick`，放在中断中可能导致程序卡死。
    

---

## 经验记录

判断按键中断配置时，先看按键按下时的电平变化：

```
按下：低电平 -> 高电平    使用上升沿 RISING
按下：高电平 -> 低电平    使用下降沿 FALLING
```

中断函数编写原则：

```
中断里代码越短越好
不要在中断里使用 HAL_Delay()
不要在中断里使用 while 等待
不要在中断里执行耗时任务
```
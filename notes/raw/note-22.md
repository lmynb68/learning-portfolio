---
date: 2026-07-21
aliases:
  - TIM
---

# 定时器概述
![笔记截图](../../assets/notes/136.webp)
![笔记截图](../../assets/notes/137.webp)
![笔记截图](../../assets/notes/138.webp)
![笔记截图](../../assets/notes/139.webp)
# 基本定时器
![笔记截图](../../assets/notes/140.webp)
![笔记截图](../../assets/notes/141.webp)
TRGO:当溢出时触发更新事件，使能后自动触发此信号
![笔记截图](../../assets/notes/142.webp)
![笔记截图](../../assets/notes/143.webp)
### 寄存器
![笔记截图](../../assets/notes/144.webp)
![笔记截图](../../assets/notes/145.webp)
![笔记截图](../../assets/notes/146.webp)
![笔记截图](../../assets/notes/147.webp)
![笔记截图](../../assets/notes/148.webp)
![笔记截图](../../assets/notes/149.webp)
### 公式
![笔记截图](../../assets/notes/150.webp)
### STM32 TIM2 控制 LED 一直亮的问题复盘

#### 问题现象

程序下载后，LED 一直亮着，没有看到预期的闪烁或翻转效果。

目标是使用 TIM2 定时器中断，在中断回调函数里翻转 LED 引脚，让 LED 周期性亮灭。

#### 当前相关代码

##### GPIO 初始化

在 `Core/Src/gpio.c` 中，PB5 被配置成了推挽输出：

```c
HAL_GPIO_WritePin(GPIOB, GPIO_PIN_5, GPIO_PIN_RESET);

GPIO_InitStruct.Pin = GPIO_PIN_5;
GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_PP;
GPIO_InitStruct.Pull = GPIO_PULLDOWN;
GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_LOW;
HAL_GPIO_Init(GPIOB, &GPIO_InitStruct);
```

这里先把 PB5 写成了 `GPIO_PIN_RESET`，也就是低电平。

如果板载 LED 是低电平点亮，那么程序一开始就会让 LED 点亮。

##### TIM2 初始化

在 `Core/Src/tim.c` 中，TIM2 的参数类似：

```c
htim2.Instance = TIM2;
htim2.Init.Prescaler = 0;
htim2.Init.CounterMode = TIM_COUNTERMODE_UP;
htim2.Init.Period = 4999;
htim2.Init.ClockDivision = TIM_CLOCKDIVISION_DIV1;
htim2.Init.AutoReloadPreload = TIM_AUTORELOAD_PRELOAD_DISABLE;
```

这只是配置了 TIM2 的参数，还没有真正启动 TIM2。

##### 中断回调函数

在 `Core/Src/stm32f1xx_it.c` 中：

```c
void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef *htim)
{
    if(htim->Instance == TIM2)
    {
        HAL_GPIO_TogglePin(GPIOB, GPIO_PIN_5);
    }
}
```

这段代码的作用是：当 TIM2 产生一次周期中断时，翻转 PB5 的电平。

但是这个回调函数不会自己运行，必须先让 TIM2 开始计数并开启中断。

#### 原因分析

##### 1. 一开始忘记配置 GPIO

LED 想要被程序控制，首先对应的引脚必须被配置成 GPIO 输出模式。

如果 PB5 没有配置成输出模式，那么即使代码里写了：

```c
HAL_GPIO_TogglePin(GPIOB, GPIO_PIN_5);
```

也不一定能正常控制 LED。

GPIO 配置至少需要包括：

- 使能 GPIOB 时钟
- 配置 PB5 为输出模式
- 设置初始电平

CubeMX 生成的 `MX_GPIO_Init()` 会完成这些工作，但主函数里也必须调用它：

```c
MX_GPIO_Init();
```

如果忘记配置 GPIO 或忘记调用 `MX_GPIO_Init()`，LED 引脚就没有进入正确的输出状态。

##### 2. 只初始化 TIM2，不等于启动 TIM2

`MX_TIM2_Init();` 的作用只是配置 TIM2：

```c
MX_TIM2_Init();
```

它相当于把定时器的参数准备好，比如分频值、计数周期、中断优先级等。

但是它不会自动让 TIM2 开始计数。

如果想让 TIM2 产生中断，必须在初始化完成后调用：

```c
HAL_TIM_Base_Start_IT(&htim2);
```

推荐放在 `main.c` 的 `USER CODE BEGIN 2` 中：

```c
MX_GPIO_Init();
MX_TIM2_Init();

/* USER CODE BEGIN 2 */
HAL_TIM_Base_Start_IT(&htim2);
/* USER CODE END 2 */
```

这样 TIM2 才会真正开始运行，并且允许周期中断触发。

##### 3. 当前 TIM2 频率太快，肉眼看起来也像常亮

当前参数是：

```c
Prescaler = 0;
Period = 4999;
```

如果 TIM2 时钟是 72 MHz，那么中断频率大约是：

```text
72 MHz / (0 + 1) / (4999 + 1) = 14400 Hz
```

LED 每次中断翻转一次，所以亮灭变化非常快。

这种频率远远超过人眼可分辨范围，即使 TIM2 已经正常工作，看起来也可能像一直亮着。

#### 正确做法

##### 第一步：确认 GPIO 已经配置

确认 `main.c` 中有：

```c
MX_GPIO_Init();
```

确认 PB5 已配置为输出模式。

##### 第二步：启动 TIM2 中断

在 `main.c` 中加入：

```c
HAL_TIM_Base_Start_IT(&htim2);
```

推荐位置：

```c
/* Initialize all configured peripherals */
MX_GPIO_Init();
MX_TIM2_Init();

/* USER CODE BEGIN 2 */
HAL_TIM_Base_Start_IT(&htim2);
/* USER CODE END 2 */
```

##### 第三步：把定时器调慢

如果 TIM2 时钟是 72 MHz，可以设置成 1 秒中断一次：

```c
htim2.Init.Prescaler = 7200 - 1;
htim2.Init.Period = 10000 - 1;
```

计算过程：

```text
72 MHz / 7200 = 10000 Hz
10000 次计数 = 1 秒
```

这样 LED 会每 1 秒翻转一次，效果就是：

```text
亮 1 秒
灭 1 秒
亮 1 秒
灭 1 秒
```

肉眼就能明显看到 LED 闪烁。

#### 中断执行流程

```text
HAL_TIM_Base_Start_IT(&htim2)
        ↓
TIM2 开始计数，并打开更新中断
        ↓
计数到 Period 后溢出
        ↓
进入 TIM2_IRQHandler()
        ↓
HAL_TIM_IRQHandler(&htim2)
        ↓
HAL_TIM_PeriodElapsedCallback()
        ↓
HAL_GPIO_TogglePin(GPIOB, GPIO_PIN_5)
        ↓
LED 状态翻转
```

#### 最终结论

LED 一直亮，主要有三个原因需要排查：

1. GPIO 是否配置正确  
   如果一开始忘记配置 GPIO，LED 引脚可能根本没有被设置成输出模式。

2. TIM2 是否真正启动  
   `MX_TIM2_Init()` 只是初始化，必须调用 `HAL_TIM_Base_Start_IT(&htim2);` 才会开始产生中断。

3. TIM2 频率是否太快  
   如果中断频率太高，LED 虽然在翻转，但肉眼看起来还是常亮。

#### 记忆点

```text
GPIO 负责控制引脚
TIM 负责产生周期事件
Start_IT 负责真正启动中断
Callback 负责写中断触发后要做什么
```

一句话总结：

> 配好了 GPIO，LED 才能被控制；启动了 TIM2 中断，回调函数才会执行；频率调慢，LED 翻转才看得见。
# 通用定时器
![笔记截图](../../assets/notes/151.webp)
![笔记截图](../../assets/notes/152.webp)
1.时钟源
- 来自内部时钟
- ITRx，内部触发输入时钟
- TIMx_ETR，IO口复用，外部时钟模式2
- TI1F_ED,TI1FP1,TI1FP2,来自通道1，2，外部时钟模式1
2.控制器
- Timer Trigger Output（定时器触发输出）TRGO至其它定时器，会到达ITRx
## 计数器时钟源
![笔记截图](../../assets/notes/153.webp)
![笔记截图](../../assets/notes/154.webp)
![笔记截图](../../assets/notes/155.webp)
![笔记截图](../../assets/notes/156.webp)
![笔记截图](../../assets/notes/157.webp)
## 输出比较
![笔记截图](../../assets/notes/158.webp)
![笔记截图](../../assets/notes/159.webp)
![笔记截图](../../assets/notes/160.webp)
## PWM
![笔记截图](../../assets/notes/161.webp)
![笔记截图](../../assets/notes/162.webp)
## TIM3 PWM 呼吸灯问题记录

### 遇到的问题

想用 `TIM3_CH2` 重映射到 `PB5` 输出 PWM，控制接在 `PB5` 上的 LED 做呼吸灯，但一开始 LED 不亮。

### 问题 1：TIM3 通道模式选错

一开始 `Channel2` 选的是：

```text
Output Compare CH2
```

这不是 PWM 输出模式，所以不能正常输出 PWM 波形。

解决方法：

```text
Channel2 改成 PWM Generation CH2
```

### 问题 2：没有启动 PWM

CubeMX 生成 TIM3 初始化代码后，还需要在 `main.c` 里手动启动 PWM。

解决方法：

```c
HAL_TIM_PWM_Start(&htim3, TIM_CHANNEL_2);
```

### 问题 3：HSE 时钟模式选错

后来 PWM 配置已经正确，但 LED 还是不亮。

原因是 `HSE` 被配置成了：

```text
Bypass Clock Source
```

普通 STM32F103 小板一般是外部晶振，不是外部有源时钟输入。选成 `Bypass` 后，程序可能卡在时钟初始化里，后面的 PWM 根本没有运行。

解决方法：

```text
RCC -> HSE 改成 Crystal/Ceramic Resonator
```

重新生成代码后，应看到：

```c
RCC_OscInitStruct.HSEState = RCC_HSE_ON;
```
## 输入捕获
![笔记截图](../../assets/notes/163.webp)
![笔记截图](../../assets/notes/164.webp)
![笔记截图](../../assets/notes/165.webp)
# 高级定时器
![笔记截图](../../assets/notes/166.webp)
![笔记截图](../../assets/notes/167.webp)
![笔记截图](../../assets/notes/168.webp)
## 输出比较
![笔记截图](../../assets/notes/169.webp)
## 互补输出 死区控制
![笔记截图](../../assets/notes/170.webp)
![笔记截图](../../assets/notes/171.webp)
死区控制的作用是防止电平转换期间电路短路烧坏
![笔记截图](../../assets/notes/172.webp)
![笔记截图](../../assets/notes/173.webp)
![笔记截图](../../assets/notes/174.webp)
![笔记截图](../../assets/notes/175.webp)
## 输入捕获PWM
![笔记截图](../../assets/notes/176.webp)



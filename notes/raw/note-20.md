---
date: 2026-07-16
aliases:
  - GPIO
tags:
---
# 概念
![笔记截图](../../assets/notes/091.webp)
![笔记截图](../../assets/notes/092.webp)
1.电压太高就往上 3.3V 电源泄流、电压太低就往 0V 地补流，把引脚电压牢牢锁在 `-0.3V ~ 3.6V` 安全区间，保护 IO 内部电路不被过压 / 负压打坏，这个限位动作就叫**钳位**。
2.电阻范围一般为30-50k，i=3.3/40000=0.825mA，所以驱动力非常小，才叫弱上拉/下拉模式
3.施密特触发器：是一种整形电路，可以将非标准方波，整形成方波![笔记截图](../../assets/notes/093.webp)
4.MOS管![笔记截图](../../assets/notes/094.webp)
# GPIO的模式
![笔记截图](../../assets/notes/095.webp)
1.关于弱上拉下拉![笔记截图](../../assets/notes/096.webp)
2.关于输出模式
首先P-MOS需要栅极为0才能导通，N-MOS需要栅极为1才能导通
举例ODR寄存器，要想当寄存器为0值，N-MOS管导通——也就是是电平为0V，就需要**在输出控制内部有一个反转器**，同理P-MOS也一样
3.F1与其他系列的区别
![笔记截图](../../assets/notes/097.webp)
F1是内部的上拉下拉，其他是外部的上拉下拉。
# GPIO的寄存器
![笔记截图](../../assets/notes/098.webp)
![笔记截图](../../assets/notes/099.webp)
## F1
### CRH/L
![笔记截图](../../assets/notes/100.webp)
那么就会出现一个很隐蔽的问题，根据数据手册上GPIO寄存器的描述，10；为上拉/下拉输入模式，那究竟是哪种模式呢，就要通过配置PxODR寄存器了——也就是ODR寄存器
![笔记截图](../../assets/notes/101.webp)
### IDR寄存器
![笔记截图](../../assets/notes/102.webp)
### ODR寄存器
![笔记截图](../../assets/notes/103.webp)
### BSRR寄存器
![笔记截图](../../assets/notes/104.webp)
## 其他系列
### MODER
![笔记截图](../../assets/notes/105.webp)
### OTYPER
![笔记截图](../../assets/notes/106.webp)
### OSPEEDR
![笔记截图](../../assets/notes/107.webp)
### PUPDR
![笔记截图](../../assets/notes/108.webp)
其他寄存器跟F1系列一样
# GPIO配置环节
![笔记截图](../../assets/notes/109.webp)
Q：void HAL_GPIO_Init (GPIO_TypeDef *GPIOx, GPIO_InitTypeDef *GPIO_Init) 前面的 GPIO_TypeDef 结构体有一些东西跟 GPIO_InitTypeDef 所要配置的内容重复了，那这么做的意义何在
A：1. **GPIO_TypeDef**：硬件外设本身，记录芯片 IO 当前真实状态，读写直接影响硬件；
2. **GPIO_InitTypeDef**：软件配置模板，记录你希望 IO 变成什么状态，仅用于给库函数提供配置参数。

二者信息看似重复，实则是**“目标参数” 和 “硬件载体”**的分层设计，是嵌入式库标准化、易复用、易阅读的核心设计思路。
![笔记截图](../../assets/notes/110.webp)
Q：我只想问这个，意思函数前面的我还能自定义么
A：函数最前面的 `GPIO_PinState` 是**函数返回值类型，这块你想换成任何合法 C 数据类型都行。
前面的返回值类型必须是**C 语言合法数据类型**：

- 基础类型：`uint8_t` / `int` / `char` / `uint16_t` / `void`
- 指针类型：`uint8_t*`
- 自定义类型：自己 typedef 的枚举、结构体
# 判断GPIO的模式
![笔记截图](../../assets/notes/111.webp)
![笔记截图](../../assets/notes/112.webp)



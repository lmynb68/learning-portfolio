---
date: 2026-07-15
aliases:
  - 时钟树
tags:
  - stm32
---
# 时钟树
## systick
![笔记截图](../../assets/notes/209.webp)
它的值是cortex系统时钟
![笔记截图](../../assets/notes/210.webp)
![笔记截图](../../assets/notes/211.webp)
## 配置系统时钟
![笔记截图](../../assets/notes/212.webp)
## F1
![笔记截图](../../assets/notes/213.webp)

![笔记截图](../../assets/notes/214.webp)
![笔记截图](../../assets/notes/215.webp)
flash工作最大频率为24MHz，所以分为0-24，24-48，48-72三个范围
![笔记截图](../../assets/notes/216.webp)
- MCO：向外输出时钟
- 晶体会比RC材料精确度高很多
- I2S：I2S 是飞利浦推出的串行音频专用总线，专门传输数字音频采样数据，分离时钟 / 数据 / 声道信号，区分于通用串口 SPI。
适用场景：MCU + 音频 Codec、蓝牙模块、MP3、扬声器、麦克风录音。
## F4
![笔记截图](../../assets/notes/217.webp)
![笔记截图](../../assets/notes/218.webp)
F407和F429在时钟树上的区别
1 是PLL分频后/R，407无东西，429有SAI音频
2 以太网也有区别
### F407
![笔记截图](../../assets/notes/219.webp)
![笔记截图](../../assets/notes/220.webp)
### F429
![笔记截图](../../assets/notes/221.webp)
![笔记截图](../../assets/notes/222.webp)
## H7
![笔记截图](../../assets/notes/223.webp)
![笔记截图](../../assets/notes/224.webp)
![笔记截图](../../assets/notes/225.webp)
![笔记截图](../../assets/notes/226.webp)
![笔记截图](../../assets/notes/227.webp)
![笔记截图](../../assets/notes/228.webp)
![笔记截图](../../assets/notes/229.webp)
![笔记截图](../../assets/notes/230.webp)
![笔记截图](../../assets/notes/231.webp)






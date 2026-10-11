const projects = [
  {
    "id": "stm32",
    "category": "embedded",
    "label": "嵌入式实践",
    "title": "从中断到传感器",
    "subtitle": "STM32 · 串口 · MPU6050",
    "description": "以串口中断接收、MPU6050 和平衡车工程为入口，梳理外设输入、数据处理与控制输出之间的关系。",
    "status": "练习工程 · 完成情况待补充",
    "origin": "本地学习目录",
    "evidence": "rm / keil / 项目 / 作业",
    "topics": [
      "串口中断接收",
      "MPU6050 传感器",
      "平衡车工程"
    ],
    "detail": "目录中有三个练习工程。当前展示的是学习范围，尚未据此认定每个工程已经完成调试或实物验证。"
  },
  {
    "id": "pid",
    "category": "notes",
    "label": "控制学习笔记",
    "title": "理解 PID 的每一项",
    "subtitle": "比例 · 积分 · 微分",
    "description": "围绕控制器基本形式、参数整定、响应振荡以及双环控制，记录从公式到实际调参的学习过程。",
    "status": "笔记资料 · 持续整理",
    "origin": "本地学习笔记",
    "evidence": "rm / 培训 / pid",
    "topics": [
      "PID 基本形式",
      "参数整定与响应分析",
      "双环 PID"
    ],
    "detail": "已核对笔记主题。网站提供主题导航，原文中的公式和技术表述还需要逐条复核后再公开为教程。"
  },
  {
    "id": "rtos",
    "category": "notes",
    "label": "实时系统笔记",
    "title": "任务如何一起工作",
    "subtitle": "FreeRTOS · 调度 · 通信",
    "description": "从任务控制块和任务状态入手，整理调度、队列、信号量、互斥锁及中断相关的学习笔记。",
    "status": "笔记资料 · 持续整理",
    "origin": "本地学习笔记",
    "evidence": "rm / 培训 / freertos参考",
    "topics": [
      "TCB 与任务状态",
      "调度与上下文切换",
      "队列、信号量与互斥锁"
    ],
    "detail": "已核对本地笔记包含这些主题。展示不代表已完成独立 RTOS 内核实现；技术内容仍需校核。"
  },
  {
    "id": "pcb",
    "category": "hardware",
    "label": "硬件设计",
    "title": "一块核心板的初版",
    "subtitle": "STM32F429IGT6 · 双层 PCB",
    "description": "从主控、供电、时钟和调试接口出发，整理 CompactCore PCB 初版、引脚表与制造文件。",
    "status": "PCB 初版 · 尚未实物验证",
    "origin": "本地工程与说明",
    "evidence": "项目 / Astra / STM32F429IGT6",
    "topics": [
      "STM32F429IGT6 主控",
      "供电、时钟与 SWD",
      "工程、引脚表与 Gerber"
    ],
    "detail": "工程说明记录了 PCB 布线和制造文件导出，也明确保留一项网表错误，未完成完整原理图与 PCB 一致性验证，尚未实物验证。这里不宣称硬件已验收。"
  },
  {
    "id": "weather",
    "category": "web",
    "label": "Python 网页实践",
    "title": "把天气变成一个页面",
    "subtitle": "Python · Flask · API",
    "description": "通过城市输入、天气接口和中文页面，把一次 API 请求串成完整的网页交互。",
    "status": "本地示例 · 运行状态未复测",
    "origin": "本地示例工程",
    "evidence": "vs / README.md",
    "topics": [
      "Flask 页面路由",
      "天气 API 请求",
      "中文界面与天气图标"
    ],
    "detail": "README 描述了城市天气查询功能；本次未配置 API Key，也未启动应用。因此仅展示工程及其学习目标，不标记为在线演示。"
  },
  {
    "id": "godot",
    "category": "web",
    "label": "作品展示实践",
    "title": "给游戏一个收藏馆",
    "subtitle": "HTML · JavaScript · Godot",
    "description": "用轻量作品卡片组织封面、分类和游戏入口，探索游戏资源与展示网站分开发布的方式。",
    "status": "本地站点 · 作者贡献待补充",
    "origin": "本地收藏馆工程",
    "evidence": "项目 / 05_Web / 网页",
    "topics": [
      "作品数据与分类",
      "封面及入口链接",
      "展示页与游戏独立发布"
    ],
    "detail": "已核对本地收藏馆的 README、页面及作品数据文件存在。收藏馆收录的游戏包含他人作品，具体作者应按各作品记录标注，不能统一视为个人原创。"
  },
  {
    "id": "robot",
    "category": "reference",
    "label": "开源源码学习",
    "title": "读懂差速机器人的链路",
    "subtitle": "ESP32 · FreeRTOS · PID",
    "description": "以开源差速机器人为阅读对象，关注编码器、速度控制、运动学、里程计与 HTTP 接口的数据流。",
    "status": "第三方开源参考",
    "origin": "leonardoAB1 / mobile_robot_esp32",
    "url": "https://github.com/leonardoAB1/mobile_robot_esp32",
    "evidence": "项目 / esp32-mobile-robot",
    "topics": [
      "编码器与电机控制",
      "任务通信与运动学",
      "里程计与 HTTP API"
    ],
    "detail": "原项目属于第三方开源作者。这里展示源码学习方向，不宣称独立开发、复现成功或拥有原作者的实验成果。"
  },
  {
    "id": "flight",
    "category": "reference",
    "label": "开源源码学习",
    "title": "认识实时飞控的结构",
    "subtitle": "STM32F411 · FreeRTOS · 飞控",
    "description": "从开源飞控工程中了解传感器采集、状态估计、控制任务及通信模块如何组织。",
    "status": "第三方开源参考",
    "origin": "mboiar / FreeRTOS_FlightController",
    "url": "https://github.com/mboiar/FreeRTOS_FlightController",
    "evidence": "项目 / 01_Projects / freertos-flight-controller",
    "topics": [
      "传感器与状态估计",
      "控制任务组织",
      "通信与安全状态机"
    ],
    "detail": "功能介绍来自第三方项目 README。当前仅作为学习参考，未在本次任务中进行编译、飞行或硬件验证。"
  }
];

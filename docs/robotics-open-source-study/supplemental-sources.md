# 补充来源与证据边界

核查：2026-10-28。

- 原视频 https://www.youtube.com/watch?v=kjqOsLdvSFg 由YouTube oEmbed核对标题与发布者硅谷101；直接视频页面受抓取限制。
- 发布者对应B站节目 https://www.bilibili.com/video/BV12QXbBREVt/ 显示2026-03-27。硅谷101署名且36氪授权发布文字稿 https://eu.36kr.com/zh/p/3741913909474056 日期2026-03-30。使用其主线，不当作独立技术复验，不复制长段采访。用户链接t=489仅保留书签。
- LeRobot论文 https://arxiv.org/abs/2602.22818 ：跨数据、训练与机器人接口的学习工具，不等于任意设备自动接入。
- LeRobotDataset https://huggingface.co/docs/lerobot/lerobot-dataset-v3 ：时序信号、视频、元信息和归一化；这说明存储结构，不证明动作语义自动统一。当前文档用于机制解释，不归称视频时期版本细节。
- Genesis https://genesis-world.readthedocs.io/en/v1.4.0/user_guide/developers/profiling.html ：总FPS是并行环境步数汇总，另有每环境FPS。https://genesis-world.readthedocs.io/en/latest/user_guide/getting_started/parallel_simulation.html 说明并行环境数和基准脚本；吞吐不能当作有效真机经验等价。
- OM1 https://github.com/OpenMind/OM1#interfacing-with-new-robot-hardware ：要求底层HAL/高层SDK能力，运行框架本身不生成所有精细控制技能。只引用职责边界，不把当前实现语言、目录结构写成视频历史。
- X-VLA https://arxiv.org/abs/2510.10274 ：可学习的本体/数据源soft prompts，不是自然语言提示自动赋予新身体能力。

正文中的成本式、流程成功率、数据比较、分拣验收和实验设计均为作者教学推导或判断，不是实测或视频逐字结论。GR00T没有作通用商用许可判断；不使用GitHub星数、估值或未经验证的训练成本作为能力证据。

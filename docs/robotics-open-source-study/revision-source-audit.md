# 开源篇定向补证：恢复视频案例与机制

核查：2026-10-28。对照[硅谷101署名稿（2026-03-30）](https://eu.36kr.com/zh/p/3741913909474056)与当前 `robotics-open-source-learning.md`。以下仅使用视频前已存在的研究版本；仓库取2026-03-27之前的提交，避免把后续新模型写回原视频。插入位置按当前文章小节命名，编辑后可调整。

## 1. 小米 Robotics-0：让“动作块的代价”落到真实案例

**可用事实：**2026年2月的 Xiaomi-Robotics-0 针对推理延迟设计异步执行：机器人执行当前块剩余动作时，模型生成下一块；下一次预测以前一块已承诺执行的动作作为前缀，并对齐时间。它还处理一个反直觉问题：模型可能只照抄动作前缀而忽略新观察，因此训练设计需要兼顾动作衔接与对环境变化的反应。真实机器人案例为双臂拆乐高和叠毛巾。

**一手来源：**[原论文v1，2026-02-13](https://arxiv.org/abs/2602.12684v1)、[官方项目：Asynchronous Execution / Temporal-Correlation Problem](https://xiaomi-robotics-0.github.io/)。项目页列 action prefixing、损失重新加权、Λ形注意力掩码；这些是具体机制，不只是“动作更顺”。

**限制：**两项真实任务的成功不能推广为通用家庭部署；项目中实验吞吐和仿真结果各有设置。不要引入2026年7月的 Xiaomi-Robotics-1。**建议插入：**2.3动作块末尾，用“旧动作还没执行完，新动作如何接上”引入；第一部分中国力量段落用一句指向此案例。

## 2. 蚂蚁 LingBot-VLA：数据规模之外，还有适配与评估成本

**可用事实：**2026年1月原报告用约2万小时真实数据、9种双臂机器人配置预训练；将预训练VLM与动作专家通过共享注意力耦合，以 flow matching 产生连续动作。其真实评估覆盖3个平台、每个平台100项任务，并使用每任务130条后训练示范；因此这是“经过目标任务适配后的系统评估”，不能写成零样本完成所有任务。

**一手来源：**[原论文v1及摘要](https://arxiv.org/abs/2601.18692v1)、[正文4.1与5.1节](https://arxiv.org/html/2601.18692v1)、[官方代码](https://github.com/Robbyant/lingbot-vla)。论文也讨论数据加载、分布式训练与算子优化，说明开放贡献可以包括训练效率和评测资料。

**限制：**“代码、基础模型和benchmark数据开放”不等于2万小时预训练数据全部开放；团队自己的比较不是独立复验。不要混入2026年7月的 LingBot-VLA 2.0。**建议插入：**1.2中国团队例子；2.4跨本体适配后用一段说明“迁移要计算需要多少新数据”，3.1证据表可补评测条件。

## 3. 自变量：应补 WALL-OSS，不能用 X-VLA 代替

**可用事实：**自变量的对应开源项目是2025年9月的 **WALL-OSS**，代码仓库叫 **Wall-X**。论文研究把指令推理、子目标分解和细粒度动作生成联合起来。视频前的官方仓库提供 FLOW 与 FAST 两种模型，并包含 LeRobot 数据准备、机器人自由度配置、微调、动作推理及 CoT 测试示例。

**一手来源：**[原论文《Igniting VLMs toward the Embodied Space》，2025-09-15](https://arxiv.org/abs/2509.11766v1)、[视频前仓库快照，2026-02-11](https://github.com/X-Square-Robot/wall-x/tree/97406f2ab5de414c79b091873f946c112d105c72)。仓库示例要求把红色积木放入同色盘子，先辨认、再描述抓取与放置步骤。

**限制：**文字推理看起来正确不证明低层执行一定成功；论文范围也不是“所有语言指令均可实现”。不要混入2026年5月的 WALL-OSS-0.5/WALL-WM。**建议插入：**1.2现有“X-VLA 等”必须改为与视频相符的 WALL-OSS；2.1之后可用其说明“任务分解和动作生成是相关但不同的能力”。

## 4. GR00T N1 双系统：结构分工，不是两个独立大脑轮流发话

**可用事实：**N1原论文中 System 2 是视觉语言模块，解释图像和指令；System 1 是 diffusion transformer，生成运动动作。两部分紧密耦合、端到端联合训练；训练混合真实机器人轨迹、人类视频与合成数据。原研究包含 Fourier GR-1 的语言条件双臂操作评估。

**一手来源：**[N1原论文，2025-03](https://arxiv.org/abs/2503.14734)、[官方发布公告，2025-03-18](https://nvidianews.nvidia.com/news/nvidia-isaac-gr00t-n1-open-humanoid-robot-foundation-model-simulation-frameworks)。

**限制：**“慢思考/快思考”是对功能分工的直观描述，不应自动写成一个LLM先输出完整文字计划、另一个模型再逐句执行。也不能把后来N1.5/N1.6/N1.7的指标与N1架构混为一谈。**建议插入：**2.2三种动作生成方式之后补一小段双系统实例；第一部分平台路线不再仅列名字。

## 5. NVIDIA 的生态：数据如何从工具链走向策略

**可用事实：**2025年3月 N1 同期的 GR00T Blueprint 用 Omniverse 与 Cosmos Transfer 从少量示范扩增合成训练数据；同时宣布与 DeepMind、Disney Research 合作开发 Newton 物理引擎。2025年5月/6月的官方资料进一步区分：Mimic扩增已有任务示范；Dreams通过生成视频、过滤与动作轨迹提取，为新行为和环境制造训练材料。这些都早于视频，但要说明是工具生态的不同环节。

**一手来源：**[N1发布公告](https://nvidianews.nvidia.com/news/nvidia-isaac-gr00t-n1-open-humanoid-robot-foundation-model-simulation-frameworks)、[2025-05-19官方公告](https://investor.nvidia.com/news/press-release-details/2025/NVIDIA-Powers-Humanoid-Robot-Industry-With-Cloud-to-Robot-Computing-Platforms-for-Physical-AI/default.aspx)、[2025-06-16官方技术解说](https://developer.nvidia.com/blog/?p=102115)。

**限制：**生成视频不天然提供可执行且物理正确的动作标签；要经过筛选、动作提取和机器人验证。原视频把生态依赖直接说成“伪开源”，文章可保留其提出的平台控制问题，但不能推导所有组件都无法替换，也不能写 OpenVLA/Octo“任何GPU都能跑”。**建议插入：**1.4模型/数据/工具后画一个简短文字链条；3.4商业判断用它说明便利、依赖和迁移成本同时增加。

## 6. SO-100：低门槛不仅是价格，更是能亲手做示范

**可用事实：**SO-100由 The Robot Studio 与 Hugging Face 合作；公开设计与装配材料，配合 LeRobot 的典型设置为一只 leader 示教臂和一只 follower 执行臂。人移动示教臂，执行臂跟随，摄像头观察与动作记录就形成可供学习的机器人示范；这把硬件、示范采集和学习工具接到一起。

**一手来源：**[视频前 SO-100 文档快照，2026-02-26](https://github.com/TheRobotStudio/SO-ARM100/blob/fda892cba81032c46c40976a48c9ceadbf40a9ca/SO100.md)、[项目变更记录（含2024年设计历史）](https://github.com/TheRobotStudio/SO-ARM100/blob/main/CHANGELOG.md)。前述快照分别列单臂与双臂材料，不把二者混为一个套餐。

**限制：**视频的“100美元”不宜写成完整可用系统总价；地区、单双臂、3D打印、相机和计算设备都会改变费用。可写“低成本、可自行装配”，保留机制而不追逐过时价格。**建议插入：**2.6/工具链段落，以“第一条机器人示范怎样产生”为案例；1.4给入门读者明确入口。

## 7. Pollen / Reachy：把硬件入口与软件社区连起来

**可用事实：**Hugging Face于2025-04-14宣布收购Pollen Robotics，把LeRobot、Hub上的模型/数据与开放机器人硬件连接。2025-07-09推出的 Reachy Mini 面向人机交互、创意编程和AI实验，可以用Python编程、分享行为应用。它和操作机械臂提供不同的学习入口。

**一手来源：**[Hugging Face收购公告](https://huggingface.co/blog/hugging-face-pollen-robotics-acquisition)、[Reachy Mini发布文章](https://huggingface.co/blog/reachy-mini)。

**限制：**官网发布文章的价格已被更新，不能用今天的399/499美元倒推2025年；原视频的250美元也未获本文一手历史证据确认，建议不写价格。桌面交互机器人不能等同能抓取物品的通用操作平台。**建议插入：**第一部分工具生态，解释“模型社区为何收购硬件公司”；与SO-100并列，但区别交互与操作任务。

## 8. OpenMind OM1：把模型接进身体的软件层，而非另一款π0

**可用事实：**视频前 OM1 README将其定位为模块化AI运行时，组合传感输入、模型端点和动作插件，通过 ROS2/Zenoh等接入硬件。入门示例把摄像头生成的描述交给LLM，再产生 movement/speech/face 命令。文档明确假定机器人已有高层SDK或HAL；如果没有，需要另外开发控制能力、动作轨迹接口与传感/设备管理。

**一手来源：**[视频前官方仓库快照，2026-03-18](https://github.com/OpenMind/OM1/tree/057a2d0e284f8d35a177c793196f07cd35f498bd)，重点读“Interfacing with New Robot Hardware”；[OpenMind原研究，2024-12](https://arxiv.org/abs/2412.18588v1)。

**限制：**“修改提示词改变行为”成立的前提是已有可调用的技能与硬件接口；不能解释成提示词直接教会未知机器人走路或精细抓取。当前仓库已改为Go体系，原视频前快照是Python，正文无须写实现语言。**建议插入：**1.2创业公司段，补全视频中的OpenMind；2.1或2.6用“策略模型—Agent运行时—硬件控制”对比，避免混淆抽象层级。

## 建议优先级

先修正自变量项目名，补三家中国模型各解决的具体问题；再补GR00T的双系统与数据工具链；最后用SO-100和OM1解释“拿到模型之后还缺哪一段”。这些案例应服务现有三部分学习结构，避免另开一张公司名单或把所有最新版本塞进正文。

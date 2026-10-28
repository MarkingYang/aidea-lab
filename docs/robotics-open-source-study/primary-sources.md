# 机器人开源视频：一手来源核查记录

核查日期：2026-10-28。供撰稿使用，不是正文。视频主线与发布日期由主任务另行核对；以下区分原始发布资料和当前仓库，不能将仓库今天的功能回填到过去版本。

## 可直接采用的事实与证据边界

| 对象 | 一手来源支持的事实 | 应保留的边界 |
| --- | --- | --- |
| Open X-Embodiment（OXE） | 是跨机构机器人数据协作与统一数据格式工作，同时包含 RT-X 模型研究。[项目](https://robotics-transformer-x.github.io/)、[官方仓库](https://github.com/google-deepmind/open_x_embodiment) | 数据采用共同格式，不等于机械臂自由度、相机布局、动作单位或控制器已经相同；不要把数据集联盟称为一款可直接装进任何机器人的“大脑”。仓库软件许可与具体数据源的权限应分别查验。 |
| Octo（2024） | 论文报告使用 OXE 的约 80 万条轨迹；是 Transformer-based diffusion policy，接受语言指令或目标图像，并研究向新传感输入和动作空间微调。[论文](https://arxiv.org/abs/2405.12213)、[官方代码](https://github.com/octo-models/octo) | “几小时微调”是论文实验和算力条件下的结果，不能变成所有新机器人的保证。代码仓库 MIT，不代表任意上游数据的许可被改为 MIT。 |
| OpenVLA（2024） | 7B 参数、约 97 万条真实机器人示范；Llama 2 结合 DINOv2/SigLIP 视觉特征。原论文称在 29 项任务、多个本体的评估中，比 RT-2-X（55B）高 **16.5 个百分点**的绝对任务成功率。[论文](https://arxiv.org/abs/2406.09246) | 不是“所有任务提升16.5%”，也不是成功率达到某个统一数值。不能用该结果给今天所有 VLA 排名。[仓库](https://github.com/openvla/openvla)明确：代码 MIT，预训练模型继承 Llama Community License；2025 年 OFT 改进应与原版分开。 |
| PI π0 / openpi | π0 于 2024-10-31 发布研究；2025-02-04 的 openpi 公告明确发布代码、权重、部分平台微调 checkpoint、推理与微调示例。[π0研究](https://www.pi.website/blog/pi0)、[开源公告](https://www.pi.website/blog/openpi) | 公告将主要用途定位为用自身平台数据继续微调，并明确适配不一定成功。它不是整套训练数据开放公告，更不是下载后即能完成任意任务的承诺。 |
| PI π0.5 | 2025-04-22 研究以陌生环境泛化为重点，混合机器人示范、视觉语言等异构数据；承认模型仍会失败。[研究公告](https://www.pi.website/blog/pi05) | “新环境”不等于所有新技能或所有新本体。当前 [openpi](https://github.com/Physical-Intelligence/openpi)更新记录将 π0.5 发布列在2025年9月，且说明仓库只支持其 flow-matching head 的训练与推理；不能写成论文系统的所有组成均已原样公开。 |
| NVIDIA Isaac GR00T | N1 于2025年3月公开研究及模型资料，以视觉语言编码和动作生成支持机器人适配。[官方N1研究页](https://research.nvidia.com/publication/2025-03_nvidia-isaac-gr00t-n1-open-foundation-model-humanoid-robots)、[N1论文](https://arxiv.org/abs/2503.14734) | 当前仓库已是 N1.7，不能以其新主干、数据量、算力与部署数字解释原视频提及的旧模型。代码、权重和数据许可要按具体版本分别查，见下方异常记录。 |
| Gemini Robotics | 2025-03-12 公告区分直接输出动作的 Gemini Robotics VLA 和提供具身推理的 Gemini Robotics-ER；2025年6月 On-Device 发布面向选定测试者。[首发公告](https://deepmind.google/blog/gemini-robotics-brings-ai-into-the-physical-world/)、[On-Device公告](https://deepmind.google/blog/gemini-robotics-on-device-brings-ai-to-local-robotic-devices/) | SDK、API、合作伙伴访问与公开下载模型权重不是同一层开放。当前[官方 SDK](https://github.com/google-deepmind/gemini-robotics-sdk)仍称多数功能需要 Trusted Tester 资格；因此不可将 Gemini Robotics 泛称为“和 OpenVLA 一样的开放权重方案”。 |

## π0：最值得讲清的机制

依据 [π0论文](https://www.pi.website/download/pi0.pdf)第IV节和附录D：

- 条件输入包括多视角 RGB 图像、语言指令、机器人本体状态；输出是未来动作块 `A_t = [a_t, …, a_(t+H−1)]`。论文设 `H=50`。
- 动作专家通过 conditional flow matching 学习连续动作分布。可以解释为：从噪声动作出发，根据当前观察逐步变成合理的动作序列；这不是用奖励直接训练策略的同义词。
- **50 Hz 是动作执行频率，不能读成每20毫秒完整重跑一次大模型。** 原论文部署对50 Hz平台每执行25个动作、即0.5秒重推理；20 Hz的UR5e/Franka每16个动作、即0.8秒重推理。该具体节奏属于原论文设置，不是所有后续版本的固定规则。
- 教学推导：动作块减少逐步调用模型的负担，但执行期间观察变化可能使原动作不再合适，因而需要讨论重新观察和更新动作的时机。

不要把 **VLA、flow matching、action chunking、RL** 排成四种互相替代的技术：VLA描述输入输出与模型任务，flow matching描述生成连续动作的一种训练方式，action chunking描述时间上的输出组织，RL描述利用奖励改进策略的学习范式。它们可以在系统中组合。原始π0的示范学习与后续可能使用RL的工作必须按版本区分。

## openpi 的“开放”到底到哪一层

[官方仓库](https://github.com/Physical-Intelligence/openpi)根目录为 Apache-2.0，同时包含 [LICENSE_GEMMA.txt](https://github.com/Physical-Intelligence/openpi/blob/main/LICENSE_GEMMA.txt)。可以准确写“公开代码与可下载的模型 checkpoint”，不宜写“全部资产均无条件 Apache 商用”。使用时需要一起核对模型来源与相应条款。

[π0原始公告](https://www.pi.website/blog/pi0)明确训练混合物包括公开机器人数据和 PI 自采数据；[openpi发布公告](https://www.pi.website/blog/openpi)列出的交付物是代码、权重和适配示例。**已公开权重不能推出完整预训练数据已公开，也不能推出外部团队可用相同资源完全复现训练。** 这是由交付物差异得出的范围判断，不是在断言“从未公开任何数据”。

PI 报告自身实验中1–20小时数据可适配多种任务，同时明确效果因情况而异。正文若无必要可不写该数字；若写必须保留实验限定，不能称“只要一小时就能学会”。

## GR00T 许可核查异常：建议正文避免概括商用结论

- [旧 N1 官方模型卡](https://huggingface.co/nvidia/GR00T-N1-2B)的 License/Terms of Use 链接实际指向 [NVIDIA OneWay Noncommercial License](https://developer.download.nvidia.com/licenses/NVIDIA-OneWay-Noncommercial-License-22Mar2022.pdf)。其3.3条规定研究/评估的非商业使用范围。
- 当前 [Isaac-GR00T main README](https://github.com/NVIDIA/Isaac-GR00T)已为 N1.7。正文有“fully commercially licensable under Apache 2.0”表述，但末尾 License 又分列代码 Apache2.0、权重 NVIDIA Open Model License；不得将其中一句覆盖全部历史版本。
- 这里报告的是可见文件之间的范围差异，不能据此替用户作具体法律结论。文章写“公开模型及开发工具，使用条件须按版本核查”足够；不要写整个 GR00T 家族“完全开源、任意商用”。如果要精确比较许可证，应固定 checkpoint 和当时随附的许可文件再审阅。

## 可转化为学习问题的解释（作者分析）

**问：既然都叫开放模型，为什么不能只比参数量？**

答：使用者实际得到的资产不同。至少区分代码、权重、训练配方、数据、评估办法及使用许可。再比较适配目标任务所需的数据、算力与工程投入；参数量只描述其中一项。

**问：跨本体是不是插上模型就能用？**

答：共享表示和预训练可以减少重新学习的成本，但目标机器人的相机、关节与夹爪、动作单位、归一化、执行频率及底层控制接口仍需对应。Octo 的新动作空间微调和 openpi 的平台适配示例，正好说明“可迁移”是适配工作的起点。

**问：开源是不是商业护城河消失？**

答：这是商业分析，不能冒充研究结论。开放公共模型可能降低试验门槛；可靠数据采集、具体场景适配、故障处理和交付服务仍有成本。仅凭公开代码无法判断一家公司的长期盈利能力。

**问：视频的“四派”可当作技术分类吗？**

答：应标明这是视频的叙事视角。学院、巨头生态、中国力量和π0混用了组织来源、地域和具体路线等维度，并非互斥分类；合作、人员流动与技术复用会跨越这些标签。适合借它看不同参与者解决什么问题，不适合据此作严格性能排名。

**问：“免费大脑”为什么不等于免费机器人？**

答：下载模型的价格和交付成本是两件事。仍需要硬件、适配数据、推理资源、集成、评估与维护。这是由系统组成得出的成本分析，不是对某家公司的财务测算。

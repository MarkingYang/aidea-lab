# Supplemental evidence

Checked 2026-10-28.

## Video
YouTube oEmbed confirmed https://www.youtube.com/watch?v=BmcoQDwdkeM and publisher Silicon Valley 101. Direct page retrieval was throttled. Publisher-authored companion article: https://eu.36kr.com/zh/p/3973141981337223 . Its 2026-09-14 date is a republication date, not asserted as the YouTube upload date. No full verified transcript or invented timestamps.

## Sensor mechanisms
- Multidirectional piezoresistive research: https://www.mdpi.com/1424-8220/15/10/25463 and https://pubmed.ncbi.nlm.nih.gov/26445045/ . Search metadata verified; direct publisher page returned 429. Supports directional sensing through structure, contradicting a universal normal-only claim.
- Kistler measurement instructions: https://kistler.cdn.celum.cloud/SAPCommerce_Download_original/002-285e.pdf . Piezoelectric static/quasistatic limits involve leakage and measurement windows.
- Soft three-axis capacitive sensor: https://pmc.ncbi.nlm.nih.gov/articles/PMC10600100/ . Multiple capacitance signals differentiate normal and shear effects.
- GelSight: https://arxiv.org/abs/1708.00922 . Surface normals, height reconstruction, relative membrane motion and shear distortion for slip detection. Geometry/force relationship: https://dspace.mit.edu/entities/publication/91f85d41-73e2-4433-af3e-c9a4f5bc982c .
- ReSkin: https://arxiv.org/abs/2111.00071 . Magnetic sensing and replaceable interfaces; fabrication/time variation requires adaptation.

## Simulation and force control
- TacSL: https://arxiv.org/html/2408.06506v2 . 2024 preprint, 2025 revision. Soft-contact approximation, calibration, physical randomization and image augmentation. Section VI-C: insertion 67/81=82.7%, without additional real policy fine-tuning, but still with calibration. Do not mix placement results with insertion.
- Tabero: https://arxiv.org/html/2605.27886v1 and https://nathanwu7.github.io/Tabero/ . Decoupled force-position commands with low-level feedback; replay data are synthetic under assumed physics, not recovered ground-truth touch. Main quantitative results are benchmark results; project real demos do not verify every reported score on hardware.

## Teaching boundaries
The symmetric two-contact friction inequality is a quasistatic simplification, not a safe-force rule for soft objects. The latency-distance calculation assumes approximately constant slip speed. Hardware-matched tactile ablation, trajectory/device holdouts and quality/cost evaluation are proposed experiments, not executed tests.

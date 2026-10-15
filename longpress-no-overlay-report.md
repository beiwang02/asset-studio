# Assets 图片卡长按无叠加

- 范围：仅 `.asset-card` 的 `:active` 触摸态。
- 未选中卡：恢复原始边框色，明确取消 transform/filter/box-shadow/outline。
- 已选中卡：保留当前 2px selection shadow 与选中边框，取消额外 active 变形/滤镜/轮廓。
- 桌面 hover：规则仍位于 `@media (hover:none)` 外，但仅命中 `:active`，未改 hover 规则。
- 勾选、详情点击、JSON rows、上传逻辑未改。

验证：运行 `node tests/assets-press.cjs`；并检查 CSS contract，确认 selected active 仍为 2px frame、unselected active 无额外 paint。

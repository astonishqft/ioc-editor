# 打造专属流程图编辑器

# 在设计的时候尽量做到单一职责原则，

TODO:

1. 通过minimap拖拽画布时，频率太高，导致卡顿，考虑优化(目前看还是因为绘制网格的时候效率调低了，考虑先优化网格的绘制逻辑) [已解决，通过优化网格池的缓存策略和限制mousemove的时间的触发频率解决此问题]

2. 创建组的时候，没有选中节点，也能创建，考虑优化 [已解决，创建组的时候，需要选中节点]

3. 画面缩放时，缩略图中的文字大小跟随系统同步缩放 [已解决，缩放的同时，按缩放比例调整文本的字体大小]

4. 节点删除功能 [已解决]

5. 快捷键功能 [已解决]

6. 右键菜单功能

7. 批量选中节点拖拽功能 [已解决]

8. 连线删除功能 [已解决]

9. 将一个group从一个group中拖拽出来的时候，需要更新父节点的父节点(需要递归的查询所有的父Group，并调用resizeGroup方法) [已解决]

10. Resize 图片功能失败 [已解决]

11. 画面缩放时，节点中的文字跟随一起缩放

12. 支持根据网格线对其

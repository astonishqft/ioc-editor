# 打造专属流程图编辑器

# 在设计的时候尽量做到单一职责原则，

TODO:

1. 通过minimap拖拽画布时，频率太高，导致卡顿，考虑优化(目前看还是因为绘制网格的时候效率调低了，考虑先优化网格的绘制逻辑)

2. 创建组的时候，没有选中节点，也能创建，考虑优化

3. 缩放时，节点中的文本没有跟着缩放，考虑优化，每次缩放的时候同步缩放节点中的文字大小
# Selected Works 封面素材

2026-10-19 从用户 Figma 当前选中的十个封面读取设计上下文并下载局部原始图片及品牌 SVG；文件 NpnClTze9ab20CStPojnVr。参考画板均为1100×1400，左上色块位于40,40，150×150。不是用整张页面截图作为实现。

封面对应关系、裁切和品牌标志位置保存在 content/projects/projects.json 各项目的 cover 字段；bounds 使用原画板像素坐标，imageBounds 为图片在其裁切盒内的百分比。网页以1100×1400原生坐标组统一缩放，避免丢失用户指定裁切。默认只有图片与色块，Hover/键盘焦点显示标题说明。临时Figma localhost资源地址不进入运行配置。

项目节点：wangquan 304:26；mel 304:31；mci 304:1779；saic 304:1753；pda 304:1732；ga 304:1726；ss 304:1741；web 304:1715；toyota 304:1747；physics 304:1720。SAIC/Toyota品牌标志为原SVG，保留原尺寸。

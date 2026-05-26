---
description: 根据描述绘制 Excalidraw 图表
---
我需要你根据我的需求，生成一个 Excalidraw 图表。Excalidraw 是一个手绘风格的绘图工具，它的文件本质是一个 JSON 文件。

我将为你提供图表的需求描述。
请根据我的需求，执行以下操作：

1. 仔细分析我的需求。
2. 创建一个 JSON 对象，该对象遵循 Excalidraw 的文件结构。你需要包含一个 `elements` 数组，定义图中所需的元素（如矩形、菱形、箭头、文本等），并计算出它们的坐标和尺寸。
3. 在 `excalidraw` 文件夹下，创建一个以需求名称命名的 `.excalidraw.md` 文件，并将生成的 JSON 对象粘贴进去。
4. 完成后告诉我文件保存的路径。

以下是一个包含一个矩形和一个箭头的基础 Excalidraw JSON 文件模板，请参考其结构：
```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",
  "elements": [
    {
      "id": "rect-1",
      "type": "rectangle",
      "x": 100,
      "y": 100,
      "width": 200,
      "height": 100,
      "backgroundColor": "transparent",
      "strokeColor": "#000000",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "boundElements": []
    },
    {
      "id": "arrow-1",
      "type": "arrow",
      "x": 200,
      "y": 250,
      "width": 0,
      "height": 50,
      "points": [[0, 0], [0, 50]],
      "startBinding": null,
      "endBinding": null
    }
  ],
  "appState": { "viewBackgroundColor": "#ffffff", "gridSize": null }
}

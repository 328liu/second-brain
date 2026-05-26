---
description: 调用 Everything 进行全局文件搜索
---
我需要你调用 Windows 上的 Everything 搜索引擎，来帮助我查找电脑上的文件。

请按照以下规则执行：

1. 首先，使用命令 `es.exe -version` 来验证 Everything 是否已正确安装并添加到 PATH。
2. 如果上一步失败，请提示我："Everything 似乎未正确配置，请确保已安装并将es.exe的路径添加到了系统环境变量Path中。"
3. 一旦验证通过，根据我的搜索需求，构造 `es.exe <搜索关键词>` 命令并执行。
4. 搜索完成后，以清晰的列表形式展示搜索结果，包含文件名和完整的文件路径。

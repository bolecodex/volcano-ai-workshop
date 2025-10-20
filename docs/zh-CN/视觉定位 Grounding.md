
文档中心
请输入关键字
搜索历史
智能视觉
花费
智能创作云
热门搜索
扣子
火山方舟
豆包大模型
语音合成
云服务器
文档
备案
控制台
z
zhaoweibo.0820 / eps_yxd_group
账号管理
账号ID : 2108323502
联邦登陆
企业认证
费用中心
可用余额¥ 0.00
充值汇款
账户总览
账单详情
费用分析
发票管理
权限与安全
安全设置
访问控制
操作审计
API 访问密钥
工具与其他
公测申请
资源管理
配额中心
伙伴控制台
待办事项
待支付
0
待续费
0
待处理工单
0
未读消息
0
火山方舟大模型服务平台
文档首页
/
火山方舟大模型服务平台
/
视觉理解
/
视觉定位 Grounding
在本产品文档中搜索
视觉定位 Grounding
最近更新时间：2025.09.08 20:26:38
首次发布时间：2025.06.24 12:08:23
我的收藏
有用
无用
视觉定位（Visual Grounding，后简称 Grounding）是根据对自然语言的任务要求，在图片中找到对应的目标，并返回目标的坐标，需要模型具备视觉理解以及自然语言理解的能力。
和目标检测最大的区别在于，输入多了自然语言信息，在对物体进行定位时需要理解自然语言的信息。使用上更加灵活交互更加自然。

输入

输出

原始图片

提示词

模型输出坐标

按坐标绘图

Image

框出中间狼卡通形象的头部的位置，输出 bounding box 的坐标

<bbox>175 98 791 476</bbox>

Image


支持模型
请参见视觉理解能力。

前提条件
获取 API Key 。
使用 Access Key 鉴权请参考Access Key 签名鉴权。
开通模型服务。
在模型列表获取所需 Model ID 。
通过 Endpoint ID 调用模型服务请参考获取 Endpoint ID（创建自定义推理接入点）。

使用流程
说明

您可以在飞书多维表格中进行 Grounding 测试、体验和使用，适合快速体验、简单场景，无需编码。

下面将基于示例代码，详细介绍 Grounding 的使用流程。

1. 环境准备与参数配置
首先导入必要的库，设置模型ID、图片路径和提示词等参数，并从环境变量中读取API密钥。

import os
import base64
import cv2
from volcenginesdkarkruntime import Ark

# 配置参数
DEFAULT_MODEL = "<MODEL>"  # 替换为实际的模型ID
IMAGE_PATH = "./ark_demo_img.png"
PROMPT = "框出中间狼卡通形象的头部的位置，输出 bounding box 的坐标"
BBOX_TAG_START = "<bbox>"
BBOX_TAG_END = "</bbox>"

# 读取API密钥
api_key = os.getenv("ARK_API_KEY")

# 创建Ark客户端
client = Ark(
    api_key=api_key,
)

2. 图片读取与Base64编码
读取本地图片文件，并将其转换为Base64字符串格式，以便通过API传输。

with open(IMAGE_PATH, "rb") as f:
    base64_image = base64.b64encode(f.read()).decode('utf-8')

3. 调用API生成边界框
将Base64编码的图片和文本提示词作为多模态输入，发送给grounding模型获取预测结果。

response = client.chat.completions.create(
    model=DEFAULT_MODEL,
    messages=[{
        "role": "user",
        "content": [{
            "type": "image_url",  # 图片输入
            "image_url": {"url": f"data:image/png;base64,{base64_image}"}
        }, {
            "type": "text",  # 文本提示
            "text": PROMPT
        }]
    }]
)
bbox_content = response.choices[0].message.content

4. 解析模型返回的边界框坐标
从模型返回的结果中提取边界框坐标，并验证其格式是否符合预期。
坐标格式为 <bbox>x_min y_min x_max y_max</bbox>，其中(x_min, y_min)为方框左上角的坐标，(x_max, y_max )为方框右下角的坐标。

# 检查结果格式是否正确
if not (bbox_content.startswith(BBOX_TAG_START) and bbox_content.endswith(BBOX_TAG_END)):
    print("错误：边界框格式不正确，缺少标签包裹")
    exit(1)

# 解析坐标值
try:
    coords_str = bbox_content[len(BBOX_TAG_START):-len(BBOX_TAG_END)]
    coords = list(map(int, coords_str.split()))
    if len(coords) != 4:  # 验证坐标数量(xmin, ymin, xmax, ymax)
        raise ValueError("坐标数量不正确，需要4个数值")
    x_min, y_min, x_max, y_max = coords
except ValueError as e:
    print(f"坐标解析失败: {str(e)}")
    exit(1)

5. 在原图上绘制边界框并保存
转化坐标，x_min, y_min, x_max, y_max取值范围是 0-1000，是 归一化到 1000*1000 的比例坐标，即图片宽高分别等分为1000后，图片左上角为原点绘制坐标系，对应点的坐标位置，原理如下图所示。


根据图像实际尺寸缩放边界框坐标，将模型输出的相对坐标映射到绝对坐标，需进行计算，例如左上角坐标横轴绝对值是 x=x_min/1000*w，w 是图片的实际宽度。

# 读取原图
image = cv2.imread(IMAGE_PATH)

# 获取图像尺寸并缩放坐标(模型输出范围为0-1000)
h, w = image.shape[:2]
x_min_real = int(x_min * w / 1000)
y_min_real = int(y_min * h / 1000)
x_max_real = int(x_max * w / 1000)
y_max_real = int(y_max * h / 1000)

# 绘制红色边界框
cv2.rectangle(image, (x_min_real, y_min_real), (x_max_real, y_max_real), (0, 0, 255), 3)

# 保存结果图片
output_path = os.path.splitext(IMAGE_PATH)[0] + "_with_bboxes.png"
cv2.imwrite(output_path, image)
print(f"成功保存标注图片: {output_path}")

结果预览
配置并运行该示例代码，在代码路径下生成绘制后的图片预览。
Image

使用建议
不建议将坐标结果（ bounding box 坐标）放在 json 中。
不建议指定 bounding box 的输出结构。

典型场景
场景

场景说明

触发条件

提示词

效果图

带属性物体检测

需要定位图像中符合自然语言描述的特定属性的对象

prompt里需包含关键词：
<bbox>x1 y1 x2 y2</bbox> 框

帮我框选森林里的着火范围，以<bbox>x1 y1 x2 y2</bbox>的形式表示

Image

多目标检测

需要同时检测多个预定义类别的对象

prompt里需包含关键词：
[{"category": category, "bbox": "<bbox>x1 y1 x2 y2</bbox>"}, {"category": category, "bbox": "<bbox>x1 y1 x2 y2</bbox>"}]

请检测图像中所有属于 "plate（盘子）、photo（照片）、kid（小孩）、cup（杯子）" 类别的物体。对于每个物体，请提供其类别和边界框，格式为：[{"category": category, "bbox": "<bbox>x1 y1 x2 y2</bbox>"}, {"category": category, "bbox": "<bbox>x1 y1 x2 y2</bbox>"}]

Image

根据图像信息定位目标

根据目标的图像信息在另一张图中进行定位

prompt里需包含关键词：
<bbox>x1 y1 x2 y2</bbox>

请根据第一张图的主要目标，识别第二张图中类似的目标，对于每个物体提供其边界框，格式为：<bbox>x1 y1 x2 y2</bbox>

Image

计算物体数量

需要统计特定对象的数量

prompt里需包含关键词：
<point>x y</point> 点

定位画面中水面上的所有人，输出 point，格式<point>x1 y1</point>，并计数水面中有多少人？

Image

识别图像文本

需要提取图像中的文字内容及位置

prompt里需包含关键词：
<text>text</text><polygon>x1 y1, x2 y2, x3 y3, x4 y4</polygon>

标注图中的文字，格式为<text>text</text><polygon>x1 y1, x2 y2, x3 y3, x4 y4</polygon>

Image

3D物体检测

检测图像中的3D立体格式的物体

prompt里需包含关键词：
图像相机的详细参数以及<3dbbox>x_center y_center z_center x_size y_size z_size pitch yaw roll</3dbbox>

以下是该图像的详细相机参数。相机内参：焦距f_x=5545.08, f_y=5545.08。主点坐标位于图像中心附近，因此当图像宽度为4284，高度为5712时，c_x=2142.00且c_y=2856.00。这里我们不考虑畸变参数。因此，内参矩阵K = [[1460.00, 0, 2142.00], [0, 1460.00, 2856.00], [0, 0, 1]]。相机坐标系：X 轴向右，Y 轴向下，Z 轴向前。原点为相机位置。我们将相机坐标系作为世界坐标系，即相机外参矩阵为[[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0]]。请按照以下格式输出每个3D框：<3dbbox>x_center y_center z_center x_size y_size z_size pitch yaw roll</3dbbox> 注意：(1) x_center, y_center, z_center：目标中心在相机坐标系中沿着XYZ轴的位置，单位为米。(2) x_size, y_size, z_size：当旋转角为零时，目标沿XYZ轴的尺寸，单位为米。(3) pitch, yaw, roll：分别为围绕XYZ轴的欧拉角。这里的每个角度值被归一化到（-1,1），需要乘以180转换到实际的角度。在这幅图中检测杯子，并以3D边界框格式展示结果。检测图像中的杯子，并以 3D框形式显示结果

Image


上一篇
视觉理解
下一篇
GUI 任务处理
支持模型
前提条件
使用流程
1. 环境准备与参数配置
2. 图片读取与Base64编码
3. 调用API生成边界框
4. 解析模型返回的边界框坐标
5. 在原图上绘制边界框并保存
结果预览
使用建议
典型场景

全天候售后服务
7x24小时专业工程师品质服务

极速服务应答
秒级应答为业务保驾护航

客户价值为先
从服务价值到创造客户价值

全方位安全保障
打造一朵“透明可信”的云
logo
关于我们
为什么选火山
文档中心
联系我们
人才招聘
云信任中心
友情链接
产品
云服务器
GPU云服务器
机器学习平台
客户数据平台 VeCDP
飞连
视频直播
全部产品
解决方案
汽车行业
金融行业
文娱行业
医疗健康行业
传媒行业
智慧文旅
大消费
服务与支持
备案服务
服务咨询
建议与反馈
廉洁舞弊举报
举报平台
联系我们
业务咨询：service@volcengine.com
市场合作：marketing@volcengine.com
电话：400-850-0030
地址：北京市海淀区北三环西路甲18号院大钟寺广场1号楼

微信公众号

抖音号

视频号
© 北京火山引擎科技有限公司 2025 版权所有
代理域名注册服务机构：新网数码 商中在线
服务条款
隐私政策
更多协议

京公网安备11010802032137号
京ICP备20018813号-3
营业执照
增值电信业务经营许可证京B2-20202418，A2.B1.B2-20202637
网络文化经营许可证：京网文（2023）4872-140号
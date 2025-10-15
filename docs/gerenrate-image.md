
文档中心
请输入关键字
搜索历史
知识库
图像风格化
AIGC图像风格化
热门搜索
扣子
火山方舟
豆包大模型
语音合成
云服务器
文档
备案
控制台
登录
立即注册
火山方舟大模型服务平台
文档首页
/
火山方舟大模型服务平台
/
API 参考
/
图片生成 API
/
图片生成 API（Seedream 4.0 API）
在本产品文档中搜索
图片生成 API（Seedream 4.0 API）
最近更新时间：2025.09.25 19:59:46
首次发布时间：2025.05.13 17:18:46

我的收藏
有用
无用
POST https://ark.cn-beijing.volces.com/api/v3/images/generations 运行​
本文介绍图片生成模型如 Seedream 4.0 的调用 API ，包括输入输出参数，取值范围，注意事项等信息，供您使用接口时查阅字段含义。​
不同模型支持的图片生成能力简介​
doubao-seedream-4.0new​
生成组图（组图：基于您输入的内容，生成的一组内容关联的图片；需配置sequential_image_generation为auto）​
多图生组图，根据您输入的 多张参考图片（2-10）+文本提示词 生成一组内容关联的图片（输入的参考图数量+最终生成的图片数量≤15张）。​
单图生组图，根据您输入的 单张参考图片+文本提示词 生成一组内容关联的图片（最多生成14张图片）。​
文生组图，根据您输入的 文本提示词 生成一组内容关联的图片（最多生成15张图片）。​
生成单图（配置sequential_image_generation为disabled）​
多图生图，根据您输入的 多张参考图片（2-10）+文本提示词 生成单张图片。​
单图生图，根据您输入的 单张参考图片+文本提示词 生成单张图片。​
文生图，根据您输入的 文本提示词 生成单张图片。​
doubao-seedream-3.0-t2i​
文生图，根据您输入的 文本提示词 生成单张图片。​
doubao-seededit-3.0-i2i​
图生图，根据您输入的 单张参考图片+文本提示词 生成单张图片。​
​
​
​
快速入口
鉴权说明
​
 体验中心       模型列表       模型计费       API Key​
 调用教程       接口文档       常见问题       开通模型​
​
​
​
请求参数 ​
请求体​
​
​
model string 必选​
本次请求使用模型的 Model ID 或推理接入点 (Endpoint ID)。​
​
​
prompt string 必选​
用于生成图像的提示词，支持中英文。（查看提示词指南：Seedream 4.0 、Seedream 3.0）​
建议不超过300个汉字或600个英文单词。字数过多信息容易分散，模型可能因此忽略细节，只关注重点，造成图片缺失部分元素。​
​
​
image string/array 可选​
仅 doubao-seedream-4.0、doubao-seededit-3.0-i2i 支持该参数​
输入的图片信息，支持 URL 或 Base64 编码。其中，doubao-seedream-4.0 支持单图或多图输入（查看多图融合示例），doubao-seededit-3.0-i2 仅支持单图输入。​
图片URL：请确保图片URL可被访问。​
Base64编码：请遵循此格式data:image/<图片格式>;base64,<Base64编码>。注意 <图片格式> 需小写，如 data:image/png;base64,<base64_image>。​
说明​
传入图片需要满足以下条件：​
图片格式：jpeg、png​
宽高比（宽/高）范围：[1/3, 3]​
宽高长度（px） > 14​
大小：不超过 10MB​
总像素：不超过 6000×6000 px​
doubao-seedream-4.0 最多支持传入 10 张参考图。​
​
​
size  string 可选 ​
​
doubao-seedream-4.0
doubao-seedream-3.0-t2i
doubao-seededit-3.0-i2i
​
指定生成图像的尺寸信息，支持以下两种方式，不可混用。​
方式1 | 示例：指定生成图像的分辨率，并在prompt中用自然语言描述图片宽高比、图片形状或图片用途，最终由模型判断生成图片的大小。​
可选值：1K、2K、4K​
方式2 | 示例：指定生成图像的宽高像素值：​
默认值：2048x2048​
总像素取值范围：[1280x720, 4096x4096] ​
宽高比取值范围：[1/16, 16]​
推荐的宽高像素值：​
​
宽高比​
宽高像素值​
1:1​
2048x2048​
4:3​
2304x1728​
3:4​
1728x2304​
16:9​
2560x1440​
9:16​
1440x2560​
3:2​
2496x1664​
2:3​
1664x2496​
21:9​
3024x1296​
​
​
​
​
​
seed integer 可选  默认值 -1​
仅doubao-seedream-3.0-t2i、doubao-seededit-3.0-i2i支持该参数​
随机数种子，用于控制模型生成内容的随机性。取值范围为 [-1, 2147483647]。​
注意​
相同的请求下，模型收到不同的seed值，如：不指定seed值或令seed取值为-1（会使用随机数替代）、或手动变更seed值，将生成不同的结果。​
相同的请求下，模型收到相同的seed值，会生成类似的结果，但不保证完全一致。​
​
​
sequential_image_generation string 可选  默认值 disabled​
仅doubao-seedream-4.0支持该参数 | 查看组图输出示例​
控制是否关闭组图功能。​
说明​
组图：基于您输入的内容，生成的一组内容关联的图片。​
取值范围：​
auto：自动判断模式，模型会根据用户提供的提示词自主判断是否返回组图以及组图包含的图片数量。​
disabled：关闭组图功能，模型只会生成一张图。​
​
​
sequential_image_generation_options object 可选​
仅doubao-seedream-4.0支持该参数​
组图功能的配置。仅当sequential_image_generation为auto时生效。​
属性​
​
​
sequential_image_generation_options.max_images  integer 可选  默认值 15​
指定本次请求，最多可生成的图片数量。​
取值范围： [1, 15]​
说明​
实际可生成的图片数量，除受到 max_images 影响外，还受到输入的参考图数量影响。输入的参考图数量+最终生成的图片数量≤15张。​
​
​
​
stream  Boolean 可选  默认值 false​
仅doubao-seedream-4.0支持该参数 | 查看流式输出示例​
控制是否开启流式输出模式。​
false：非流式输出模式，等待所有图片全部生成结束后再一次性返回所有信息。​
true：流式输出模式，即时返回每张图片输出的结果。在生成单图和组图的场景下，流式输出模式均生效。​
​
​
guidance_scale  Float 可选​
doubao-seedream-3.0-t2i 默认值 2.5​
doubao-seededit-3.0-i2i 默认值 5.5​
doubao-seedream-4.0 不支持​
模型输出结果与prompt的一致程度，生成图像的自由度，又称为文本权重；值越大，模型自由度越小，与用户输入的提示词相关性越强。​
取值范围：[1, 10] 。​
​
​
response_format string 可选  默认值 url​
指定生成图像的返回格式。​
生成的图片为 jpeg 格式，支持以下两种返回方式：​
url：返回图片下载链接；链接在图片生成后24小时内有效，请及时下载图片。​
b64_json：以 Base64 编码字符串的 JSON 格式返回图像数据。​
​
​
watermark  Boolean 可选 默认值 true​
是否在生成的图片中添加水印。​
false：不添加水印。​
true：在图片右下角添加“AI生成”字样的水印标识。​
​
​
​
响应参数​
流式响应参数​
请参见文档。​
​
非流式响应参数​
​
​
model string​
本次请求使用的模型 ID （模型名称-版本）。​
​
​
created integer​
本次请求创建时间的 Unix 时间戳（秒）。​
​
​
data array​
输出图像的信息。​
说明​
doubao-seedream-4.0模型生成组图场景下，组图生成过程中某张图生成失败时：​
若失败原因为审核不通过：仍会继续请求下一个图片生成任务，即不影响同请求内其他图片的生成流程。​
若失败原因为内部服务异常（500）：不会继续请求下一个图片生成任务。​
可能类型​
图片信息 object​
生成成功的图片信息。​
属性​
data.url string​
图片的 url 信息，当 response_format 指定为 url 时返回。该链接将在生成后 24 小时内失效，请务必及时保存图像。​
​
​
data.b64_json string​
图片的 base64 信息，当 response_format 指定为 b64_json 时返回。​
​
​
data.size string​
仅 doubao-seedream-4.0 支持该字段。​
图像的宽高像素值，格式<宽像素>x<高像素>，如2048×2048。​
​
​
​
错误信息 object​
某张图片生成失败，错误信息。​
属性​
data.error object​
错误信息结构体。​
属性​
​
​
data.error.code​
某张图片生成错误的错误码，请参见错误码。​
​
​
data.error.message​
某张图片生成错误的提示信息。​
​
​
​
​
​
usage object​
本次请求的用量信息。​
属性​
​
​
usage.generated_images integer​
模型成功生成的图片张数，不包含生成失败的图片。​
仅对成功生成图片按张数进行计费。​
​
​
usage.output_tokens integer​
模型生成的图片花费的 token 数量。​
计算逻辑为：计算sum(图片长*图片宽)/256 ，然后取整。​
​
​
usage.total_tokens integer​
本次请求消耗的总 token 数量。​
当前不计算输入 token，故与 output_tokens 值一致。​
​
error  object​
本次请求，如发生错误，对应的错误信息。 ​
属性​
​
​
error.code string ​
请参见错误码。​
​
​
error.message string​
错误提示信息​
​
​
​
doubao-seedream-4.0-文生图
doubao-seedream-4.0-图生图
doubao-seedream-4.0-多图融合
doubao-seedream-4.0-多参考图生组图
doubao-seedream-4.0-流式输出
doubao-seedream-3.0-t2i
doubao-seededit-3.0-i2i
输入示例

curl -X POST https://ark.cn-beijing.volces.com/api/v3/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ARK_API_KEY" \
  -d '{
    "model": "doubao-seedream-4-0-250828",
    "prompt": "星际穿越，黑洞，黑洞里冲出一辆快支离破碎的复古列车，抢视觉冲击力，电影大片，末日既视感，动感，对比色，oc渲染，光线追踪，动态模糊，景深，超现实主义，深蓝，画面通过细腻的丰富的色彩层次塑造主体与场景，质感真实，暗黑风背景的光影效果营造出氛围，整体兼具艺术幻想感，夸张的广角透视效果，耀光，反射，极致的光影，强引力，吞噬",
    "size": "2K",
    "sequential_image_generation": "disabled",
    "stream": false,
    "response_format": "url",
    "watermark": true
}'
输出示例

{
    "model": "doubao-seedream-4-0-250828",
    "created": 1757321139,
    "data": [
        {
            "url": "https://...",
            "size": "3104x1312"
        }
    ],
    "usage": {
        "generated_images": 1,
        "output_tokens": xxx,
        "total_tokens": xxx
    }
}
上一篇
取消或删除视频生成任务
下一篇
流式响应
鼠标选中内容，快速反馈问题
选中存在疑惑的内容，即可快速反馈问题，我们将会跟进处理
不再提示
好的，知道了

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

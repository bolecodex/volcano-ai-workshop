
文档中心
请输入关键字
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
视频生成 API
/
查询视频生成任务 API
在本产品文档中搜索
查询视频生成任务 API
最近更新时间：2025.09.17 15:20:23
首次发布时间：2025.04.10 20:43:38

我的收藏
有用
无用
GET https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks/{id}  运行​
本文介绍 doubao 视频生成 API 的输入输出参数，供您使用接口时查阅字段含义。​
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
跳转 响应参数​
​
​
id string 必选​
您需要查询的视频生成任务的 ID 。​
说明​
上面参数为Query String Parameters，在URL String中传入。​
​
​
​
响应参数​
跳转 请求参数​
​
​
id string​
视频生成任务 ID 。​
​
​
model string​
任务使用的模型名称和版本，模型名称-版本。​
​
​
status string​
任务状态，以及相关的信息：​
queued：排队中。​
running：任务运行中。​
cancelled：取消任务，取消状态24h自动删除（只支持排队中状态的任务被取消）。​
succeeded： 任务成功。​
failed：任务失败。​
​
​
error object / null​
错误提示信息，任务成功返回null，任务失败时返回错误数据，错误信息具体参见 错误处理。​
属性​
​
​
error.code string​
错误码。​
​
​
error.message string​
错误提示信息。​
​
​
​
created_at integer​
任务创建时间的 Unix 时间戳（秒）。​
​
​
updated_at integer​
任务当前状态更新时间的 Unix 时间戳（秒）。​
​
​
content object​
视频生成任务的输出内容。​
属性​
​
​
content.video_url string​
生成视频的 URL，格式为 mp4。为保障信息安全，生成的视频会在24小时后被清理，请及时转存。​
content.last_frame_url string​
视频的尾帧图像 URL。有效期为 24小时，请及时转存。​
说明：创建视频生成任务 时设置 "return_last_frame": true 时，会返回参数。​
​
​
​
seed integer​
本次请求使用的种子整数值。​
​
​
resolution  string ​
生成视频的分辨率。​
​
​
ratio string​
生成视频的宽高比。​
​
​
duration integer ​
生成视频的时长，单位：秒。​
​
​
framespersecond  integer ​
生成视频的帧率。​
​
​
usage object​
本次请求的 token 用量。​
属性​
​
​
usage.completion_tokens integer​
模型生成的 token 数量。​
​
​
usage.total_tokens integer​
视频生成模型不统计输入 token，输入 token 为 0，故 total_tokens=completion_tokens。​
​
默认
request

curl -X GET "https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks/cgt-2025****" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ARK_API_KEY"
response

{
  "id": "cgt-2025******-****",
  "model": "doubao-seedance-1-0-pro-250528",
  "status": "succeeded",
  "content": {
    "video_url": "https://ark-content-generation-cn-beijing.tos-cn-beijing.volces.com/doubao-seedance-1-0-pro/****.mp4?X-Tos-Algorithm=TOS4-HMAC-SHA256&X-Tos-Credential=AKLTY****%2Fcn-beijing%2Ftos%2Frequest&X-Tos-Date=20250331T095113Z&X-Tos-Expires=86400&X-Tos-Signature=***&X-Tos-SignedHeaders=host"
  },
  "seed": 10,
  "resolution": "720p",
  "duration": 5,
  "ratio": "16:9",
  "framespersecond": 24,
  "usage": {
    "completion_tokens": 108900,
    "total_tokens": 108900
  },
  "created_at": 1743414619,
  "updated_at": 1743414673
}


上一篇
创建视频生成任务 API
下一篇
查询视频生成任务列表
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


文档中心
请输入关键字
搜索历史
花费
智能创作云
知识库
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
向量数据库VikingDB
文档首页
/
向量数据库VikingDB
/
VikingDB 向量库
/
向量库V2
/
API V2参考
/
向量化计算(Embedding)
在本产品文档中搜索
向量化计算(Embedding)
最近更新时间：2025.10.10 20:13:33
首次发布时间：2025.08.15 11:30:53
我的收藏
有用
无用

接口升级说明
对应的旧接口为：https://www.volcengine.com/docs/84313/1254554
使用区别：
新接口

旧接口

模型组合

稠密和稀疏模型可以独立指定。支持稠密+稀疏、仅稠密、或仅稀疏embedding计算。

稠密和稀疏模型通过同一个model_name参数指定。

单次写入的数据量限制

不超过10，时延更低。

不超过100

返回消耗的模型token用量

是

需要额外设置参数才能返回

注：限流是以token用量计算，V1与V2接口的限流行为完全相同。

请求接口
说明

当前 Embedding 服务支持将文本/图片/视频生成向量。
当前对 Embedding 模型设置了 TPM（Tokens Per Minute，每分钟 tokens 数量）的调用限制，每个账号（含主账号下的所有子账号，合并计算）的 TPM 不超过 120000/模型。
图片生成向量：
图片大小：建议图片大小不要超过1MB，因embedding v2接口的请求限制为4M，当图片超过1MB时，我们建议用户压缩图片后再次请求，防止接口截断；
图片压缩尺寸推荐：经过我们的实验，将图片的长和宽分别缩放到自身的0.30-0.35倍，可以得到与原图embedding较为相近的结果。其中，0.30-0.35倍 是缩放的拐点，比例再低的话精度劣化会比较明显，缩放比例可以在拐点以上。
当前图片 embedding 限制每秒上传15张图，如果超出限制请及时联系客服扩大限流。
视频生成向量：
视频限制：单视频文件需在 50MB 以内（建议30M以内），支持MP4、AVI、MOV格式，暂不支持对视频文件中的音频信息进行理解。
视频支持指定FPS：支持控制从视频中抽取图像的帧率，支持配置0.2-5。
视频embedding请求时长示例：传入30M的视频进行embedding（传入参数是tos路径，视频大小30M，38秒钟，1920 * 1080的尺寸）：fps = 1：耗时8秒；fps = 5：耗时25秒；fps = 0.2：耗时4秒

鉴权
说明

请求向量数据库 VikingDB 的 OpenAPI 接口时，可以使用 ak、sk 构造签名进行鉴权。请参见数据面API调用流程，复制调用示例并填入必要信息

URI

/api/vikingdb/embedding

统一资源标识符

方法

POST

客户端对向量数据库服务器请求的操作类型

请求头

Content-Type: application/json

请求消息类型

Authorization: HMAC-SHA256 ***

鉴权


请求体参数
参数

类型

是否必选

子参数

类型

是否必选

说明

dense_model

map

2者至少选1

name

string

是

模型名

version

string

否，但豆包模型必选

模型版本

dim

int

否

维度。不填则使用该模型版本的默认维度。

sparse_model

map

name

string

是

模型名

version

string

否

模型版本

data

list

是

数据。详细字段见下。列表长度最大 10。如果数据类型是full_modal_seq则长度为1

其中，Data结构：

参数

类型

是否必选

说明

text

string

至少选一个，也可 text、image和video的组合

文本字符串内容。过长则会截断，各模型的截断阈值见下。

image

string

图片tos链接。tos://{bucket}/{object}
http/https格式链接
video

map

{
"value": tos://{bucket}/{object}，http/https格式url链接，该字段必填
"fps": 0.2 （取值0.2-5，选填）
}

full_modal_seq

full_modal_seq

若选择full_modal_seq，则不能出现上述text等三个参数

FullModalData结构见下

MediaData（例如image图片、video视频可以为字符串）的格式规范：
二选一

同region内的tos资源地址。tos://{bucket}/{object_key}
可公开访问的http/https链接。http://或https://
FullModalData结构：
三选一

字段名

类型

备注

text

string

纯文本

image

string

若无特殊配置参数，使用string类型填入图片资源地址，参考MediaData规范；

video

map

若无特殊配置参数，可使用map类型，子参数包括：

value：使用string类型填入视频资源地址，参考MediaData规范。
fps：表示抽帧的频率。不设置则默认为1，范围为0.2-5.0。不过，服务端默认至少抽取16帧。越大，则抽帧更多，同时消耗的token也越多、时延越高。

模型列表
模型名称

模型版本

支持向量化类型

默认稠密向量维度

可选稠密向量维度

文本截断长度

支持稀疏向量

可支持instruction

bge-large-zh

(default)

text

1024

1024

512

否

是

bge-m3

(default)

text

1024

1024

8192

是

否

bge-visualized-m3

(default)

text、image及其组合

1024

1024

8192

否

否

doubao-embedding

240715

text

2048

512, 1024, 2048

4096

否

是

doubao-embedding-large

240915

text

2048

512, 1024, 2048, 4096

4096

否

是

doubao-embedding-vision

250328

text、image及其组合

2048

2048, 1024

8192

否

是

doubao-embedding-vision

250615

兼容241215和250328的用法*。​*另外，支持full_modal_seq（文/图/视频序列）

2048

2048, 1024

128k

否

是


响应体参数
公共响应体参数部分见
数据面API调用流程

参数名

类型

子参数

说明

request_id

string

请求id

code

int

状态码。成功则为0

message

string

成功则为success

result

map

data

list

数据列表

token_usage

map

按模型粒度的token统计。
包括prompt_tokens、completion_tokens、image_tokens、total_tokens信息

其中，EmbeddingResult结构：

参数名

类型

说明

dense

list

稠密向量结果

sparse

map<string,float>

稀疏向量结果


请求响应示例

1.文本稠密+稀疏
请求参数
req_path = "/api/vikingdb/embedding"
req_body = {
    "dense_model": {
        "name": "doubao-embedding-large",
        "version": "240915",
        "dim": 1024,
    },
    "sparse_model": {
        "name": "bge-m3",
        "version": "default",
    },
    "data": [
        {
            "text": "天很蓝。"
        },
        {
            "text": "海很深。"
        }
    ]
}
响应参数
{
    "code": "Success",
    "message": "The API call was executed successfully.",
    "request_id": "02175438839168500000000000000000000ffff0a003ee4fc3499",
    "result": {
        "data": [
            {
                "dense": [0.05149054509186956,0.034275332726816786, ......],
                "sparse": {
                    "天": 0.263671875,
                    "很": 0.18603515625,
                    "蓝": 0.3046875
                }
            },
            {
                "dense": [0.0076801463728645375,0.034275332726816786, ......],
                "sparse": {
                    "很": 0.2010498046875,
                    "海": 0.32958984375,
                    "深": 0.32373046875
                }
            }
        ],
        "token_usage": {
            "bge-m3__default": {
                "prompt_tokens": 14,
                "completion_tokens": 0,
                "image_tokens": 0,
                "total_tokens": 14
            },
            "doubao-embedding-large__240915": {
                "prompt_tokens": 9,
                "completion_tokens": 0,
                "image_tokens": 0,
                "total_tokens": 9
            }
        }
    }
}

2.文+图多模态
请求参数
req_path = "/api/vikingdb/embedding"
req_body = {
    "dense_model": {
        "name": "bge-visualized-m3",
        "version": "default",
        "dim": 1024
    },
    "data": [
        {"text": "天很蓝"},
        {"text": "tos://my_bucket/sky_1.jpeg"}
    ]
}
响应参数
{
    "code": "Success",
    "message": "The API call was executed successfully.",
    "request_id": "02175438839168500000000000000000000ffff0a003ee4fc3499",
    "result": {
        "data": [
            {
                "dense": [0.013657506555318832,0.034275332726816786, ......]
            }
        ],
        "token_usage": {
            "bge-visualized-m3__default": {
                "prompt_tokens": 926,
                "completion_tokens": 0,
                "image_tokens": 926,
                "total_tokens": 926
            }
        }
    }
}

3.文+图+视频多模态
请求参数
req_path = "/api/vikingdb/embedding"
req_body = {
    "dense_model": {
        "name": "doubao-embedding-vision",
        "version": "250615",
        "dim": 1024,
    },
    "data": [
        {
            "full_modal_seq":[
                {
                    "text": "haha haha"
                },
                {
                    "image": "tos://my_bucket/images/dogs/5.jpeg"
                },
                {
                    "video": "tos://my_bucket/videos/1.mp4"
                },
                {
                    "video":
                    //如果需要对视频有自定义处理，可将video值定义为json，以设置高级参数：
                    //value表示视频内容；
                    //fps表示抽帧的频率。不设置则默认为1，范围为0.2-5.0。不过，服务端默认至少抽取16帧。越大，则抽帧更多，同时消耗的token也越多、时延越高。
                        {
                            "value": "tos://my_bucket/videos/2.mp4",
                            "fps": 0.4, 
                        }
                }
            ]
        }
    ]
}
响应参数
{
    "code": "Success",
    "message": "The API call was executed successfully.",
    "request_id": "02175438839168500000000000000000000ffff0a003ee4fc3499",
    "result": {
        "data": [
            {
                "dense": [0.05149054509186956,0.034275332726816786, ......]
            }
        ],
        "token_usage": {
            "doubao-embedding-vision__250615": {
                "prompt_tokens": 1325,
                "completion_tokens": 0,
                "image_tokens": 1312,
                "total_tokens": 1325
            }
        }
    }
}

4.传入待tos处理参数的图像
请求参数
req_path = "/api/vikingdb/embedding"
req_body = {
    "dense_model": {
        "name": "doubao-embedding-vision",
        "version": "250615",
        "dim": 2048,
     },
    "data": [
        {
            "image": {"value":"tos://yuan-tos/cat.jpeg","x-tos-process": "image/resize,l_600|image/indexcrop,x_600,i_0"},
        } 
    ]
}
响应参数
{
    "code":"Success",
    "message":"The API call was executed successfully.",
    "request_id":"xxx",
    "result":
        {
            "data":[
                {
                    "dense":[...],
                }
            ],
            "token_usage":{"doubao-embedding-vision__250615":{"prompt_tokens":472,"completion_tokens":0,"image_tokens":459,"total_tokens":472}}
        }
}   

5.doubao-embedding-vision 0615支持稀疏向量编码
doubao-embedding-vision 0615模型稀疏向量输出结构为多个{index:value}
index：类型为string，代表token对应的行号
value：token对应的embedding值

请求参数
req_path = "/api/vikingdb/embedding"
req_body = {
    "dense_model": {
        "name": "doubao-embedding-vision",
        "version": "250615",
        "dim": 2048,
     },
    "sparse_model": {
        "name": "doubao-embedding-vision",
        "version": "250615",
     },
    "data": [
        {
            "text": "从前有座山,山里有座庙", 
        } 
    ]
}
响应参数
{
    "code":"Success",
    "message":"The API call was executed successfully.",
    "request_id":"02175739508084500000000000000000000ffff0a005a4847c517",
    "result":
        {
            "data":[
                {
                    "dense":[...],
                    "sparse"::{"139":0.2431640625,"14310":0.375,"1590":0.35546875,"3129":0.47265625,"37460":0.44140625,"514":0.294921875,"95188":0.408203125}
                }
            ],
            "token_usage":{"doubao-embedding-vision__250615":{"prompt_tokens":23,"completion_tokens":0,"image_tokens":0,"total_tokens":23}}
        }
}   
上一篇
聚合统计(Aggregate)
下一篇
控制面API调用流程
接口升级说明
请求接口
鉴权
请求体参数
模型列表
响应体参数
请求响应示例
1.文本稠密+稀疏
2.文+图多模态
3.文+图+视频多模态
4.传入待tos处理参数的图像
5.doubao-embedding-vision 0615支持稀疏向量编码

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
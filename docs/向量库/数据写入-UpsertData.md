
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
数据(Data)
/
数据写入-UpsertData
在本产品文档中搜索
数据写入-UpsertData
最近更新时间：2025.09.30 16:07:16
首次发布时间：2025.08.15 11:30:50
我的收藏
有用
无用

概述
接口用于在指定的数据集 Collection 内写入数据。指定写入的数据是一个map，允许单次插入一条数据或者多条数据，单次最多可插入100条数据。

接口升级说明
对应的V1接口为：https://www.volcengine.com/docs/84313/1254533
使用区别：
V2接口

V1接口

写入数据对应的参数

data

fields

返回模型消耗token量

自动返回

需手动设置

单次写入的数据量限制

如果数据集是带vectorize的，不超过1，时延更小；不带vectorize的，不超过100。

不超过100。

注：QPS限流是以数据条数计算，V1与V2接口的限流行为完全相同。

请求接口
说明

请求向量数据库 VikingDB 的 OpenAPI 接口时，可以使用 ak、sk 构造签名进行鉴权。请参见数据面API调用流程，复制调用示例并填入必要信息

URI

/api/vikingdb/data/upsert

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
参数名

类型

必选

默认值

备注

resource_id

string

2选1

资源id

collection_name

string

collection名称

data

array

是

单次写入的数据数目不超过100。
每条数据作为一个map，其中key为字段名，value为字段值，不同字段类型的字段值格式见下表。
注意：

不允许写入不存在的字段名。
如果缺失某字段，则用默认值填充。若字段类型无默认值（如text），则会请求失败。
若为请求参数非法（4xx类型），则会全部失败。
ttl

int

否

0

正整数，负数无效
当数据不过期时，默认为0。
数据过期时间，单位为秒。设置为86400，则1天后数据自动删除。
数据ttl删除，不会立刻更新到索引。

async

bool

否

false

异步写入开关

异步写入限流阈值为同步写入的10倍
异步写入的数据不会同步实时的写入collection，滞后时间为分钟级别。可通过接口 FetchDataInCollection来确认数据是否已经写入collection
异步写入的数据不会触发索引的流式更新，索引同步时间为小时级别。可通过接口 FetchDataInIndex接口确认数据是否同步至index

data参数字段值格式
说明

注意：数据插入时主键不能为0

字段类型

格式

说明

int64

整型数值

整数

float32

浮点数值

浮点数

string

字符串

字符串。内容限制256byte

bool

true/false

布尔类型

list

字符串数组

字符串数组

list

整型数组

整数数组

vector

向量（浮点数数组）
float32/float64压缩为bytes后的base64编码
稠密向量

sparse_vector

输入格式<token_id ,token_weight>的字典列表，来表征稀疏稀疏向量的非零位下标及其对应的值, 其中 token_id 是 string 类型, token_weight 是float 类型

稀疏向量

text

字符串

若为向量化字段，则值不能为空。（若否，可以为空）

image

字符串

若为向量化字段，则值不能为空。（若否，可以为空）

图片tos链接 tos://{bucket}/{object}
http/https格式链接
video

map

{
"value": tos://{bucket}/{object}，http/https格式url链接，该字段必填
"fps": 0.2 （取值0.2-5，选填）
}


响应体参数
公共响应体参数部分见
数据面API调用流程

参数名

类型

子参数

说明

result

map

token_usage

map

包括prompt_tokens、completion_tokens、image_tokens、total_tokens信息


请求响应示例

1.写入带直接向量字段的数据集
请求参数
req_path = "/api/vikingdb/data/upsert"
req_body = {
    "collection_name": "test_coll",
    "data": [
        {
            "f_id": "000135", #以下参数为选填，请根据coll创建字段填写
            "f_vector": [0.1, 0.33, -0.88, 0.66],
            "f_city": "北京"
        }
    ]
}
响应参数
{
    "code": "Success",
    "message": "The API call was executed successfully.",
    "request_id": "02175438839168500000000000000000000ffff0a003ee4fc3499",
    "result": null
}

2.写入带向量化字段的数据集

图文示例
请求参数
req_path = "/api/vikingdb/data/upsert"
req_body = {
    "collection_name": "test_coll_with_vectorize",
    "data": [
        {
            "f_id": "000135",
            "f_city": "北京",
            "f_text": "这是一件历史悠久的文物，具有1300年的历史",
            "f_image": "tos://my_bucket/good_000135.jpg"
        }
    ]
}
响应参数
{
    "code": "Success",
    "message": "The API call was executed successfully.",
    "request_id": "02175438839168500000000000000000000ffff0a003ee4fc3499",
    "result": {
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

视频示例
请求参数
req_path = "/api/vikingdb/data/upsert"
req_body = {
    "collection_name": "test_coll_with_vectorize",
    "data": [
        {
            "f_id": "000135",
            "f_city": "北京",
            "f_text": "这是一件历史悠久的文物，具有1300年的历史",
            "f_image": "tos://my_bucket/good_000135.jpg",
            "f_video": {
                "value": "tos://my_bucket/good_000135.mp4",
                "fps": 2.0,
             }
        }
    ]
}
响应参数
{
    "code": "Success",
    "message": "The API call was executed successfully.",
    "request_id": "02175438839168500000000000000000000ffff0a003ee4fc3499",
    "result": {
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
上一篇
数据面API调用流程
下一篇
数据更新-UpdateData
概述
接口升级说明
请求接口
请求体参数
data参数字段值格式
响应体参数
请求响应示例
1.写入带直接向量字段的数据集
2.写入带向量化字段的数据集
图文示例
视频示例

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

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
检索(Search)
/
多模态检索-SearchByMultiModal
在本产品文档中搜索
多模态检索-SearchByMultiModal
最近更新时间：2025.09.30 16:07:16
首次发布时间：2025.08.15 11:30:51
我的收藏
有用
无用

概述
多模态数据检索是指向量数据库支持直接通过图文等多模态数据类型进行检索，且支持模态的组合，如文搜图，图搜图，图搜文+图等。

请求接口
说明

请求向量数据库 VikingDB 的 OpenAPI 接口时，可以使用 ak、sk 构造签名进行鉴权。请参见数据面API调用流程，复制调用示例并填入必要信息

URI

/api/vikingdb/data/search/multi_modal

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
仅列出本接口特有的参数。更多信息请参见检索公共参数。

参数名

必选

类型

备注

text

至少选1

string

检索的文本内容

image

string

图片tos链接。tos://{bucket}/{object}
http/https格式链接
video

map

{
"value": tos链接，http/https格式链接 （该字段必填）
"fps": 2.0 (0.2-5，该字段选填)
}

need_instruction

若模型支持instruction能力，则此参数必填。

bool

带文本的检索，可以在返回结果里real_text_query参数，查看实际生效的检索语句。
模型列表参考：向量化计算-Embedding


请求响应示例

1.文本检索
请求参数
req_path = "/api/vikingdb/data/search/multi_modal"
req_body = {
    "collection_name": "test_coll_with_vectorize",
    "index_name": "idx_1",
    "text": "向量是指在数学中具有一定大小和方向的量，文本、图片、音视频等非结构化数据",
    "need_instruction": true,
    "output_fields": [
        "f_text"
    ],
    "limit": 2
}
响应参数
{
    "code": "Success",
    "message": "The API call was executed successfully.",
    "request_id": "02175438839168500000000000000000000ffff0a003ee4fc3499",
    "result": {
        "data": [
            {
                "id": "uid_001",
                "fields": {
                    "f_text": "向量是指在数学中具有一定大小和方向的量"
                },
                "score": 9.899999618530273,
                "ann_score": 9.899999618530273
            },
            {
                "id": "uid_002",
                "fields": {
                    "f_text": "向量是高中数学里的一个重要概念"
                },
                "score": 8.324234999961,
                "ann_score": 8.324234999961,
            }
        ],
        "total_return_count": 2,
        "real_text_query": "根据这个问题，找到能回答这个问题的相应文本或图片：向量是指在数学中具有一定大小和方向的量，文本、图片、音视频等非结构化数据",
        "token_usage": {
            "doubao-embedding-vision__250328": {
                "prompt_tokens":53,
                "completion_tokens":0,
                "image_tokens":0,
                "total_tokens":53
            }
        }
    }
}

2.文本+图片检索
请求参数
req_path = "/api/vikingdb/data/search/multi_modal"
req_body = {
    "collection_name": "test_coll_with_vectorize",
    "index_name": "idx_1",
    "text": "向量是指在数学中具有一定大小和方向的量，文本、图片、音视频等非结构化数据",
    "image": "tos://my_bucket/vector_icon.jpg",
    "output_fields": [
        "f_text", "f_image"
    ],
    "need_instruction": true,
    "limit": 2
}
响应参数
{
    "code": "Success",
    "message": "The API call was executed successfully.",
    "request_id": "02175438839168500000000000000000000ffff0a003ee4fc3499",
    "result": {
        "data": [
            {
                "id": "uid_001",
                "fields": {
                    "f_text": "向量是指在数学中具有一定大小和方向的量", "f_image": "tos://my_bucket/vector_1.jpg"
                },
                "score": 9.899999618530273,
                "ann_score": 9.899999618530273
            },
            {
                "id": "uid_002",
                "fields": {
                    "f_text": "向量是高中数学里的一个重要概念", "f_image": "tos://my_bucket/vector_2.jpg"
                },
                "score": 8.324234999961,
                "ann_score": 8.324234999961,
            }
        ],
        "total_return_count": 2,
        "real_text_query": "根据这个问题，找到能回答这个问题的相应文本或图片：向量是指在数学中具有一定大小和方向的量，文本、图片、音视频等非结构化数据",
        "token_usage": {
            "doubao-embedding-vision__250328": {
                "prompt_tokens":1335,
                "completion_tokens":0,
                "image_tokens":1231,
                "total_tokens":1335
            }
        }
    }
}

视频检索
视频token计入image_tokens
req_path = "/api/vikingdb/data/search/multi_modal"
req_body = {
        "collection_name": "jiangyuan_video_collection",
        "index_name": "jiangyuan_video_index",
        "text": "猫",
        "video": 
            {   
                "value": "tos://data-import/2101858484/2025_08_19_10_51_40Oheg6Pua9jaD33cVl2GhcKyjumEM7aXy/cat_video.mp4",
                "fps": 1.0,
            },
        "output_fields": [
                "f_id", "f_video"
            ],
        "need_instruction": False,
        "limit": 2
 }
{
    "code": "Success",
    "message": "The API call was executed successfully.",
    "request_id": "02175574557162300000000000000000000ffff0a007af7628242",
    "result": {
        "data": [
            {
                "id": "4",
                "fields": {
                    "f_id": "4",
                    "f_video": {
                         "value": "tos://my_bucket/xxxx1.mp4",
                         "fps": 1.0,
                     }
                },
                "score": 0.9932262897491455,
                "ann_score": 0.9932262897491455
            },
            {
                "id": "1",
                "fields": {
                    "f_id": "1",
                    "f_video": {
                         "value": "tos://my_bucket/xxxx2.mp4",
                         "fps": 1.0,
                     }
                },
                "score": 0.41645175218582153,
                "ann_score": 0.41645175218582153
            }
        ],
        "total_return_count": 2,
        "real_text_query": "猫",
        "token_usage": {
            "doubao-embedding-vision__250615": {
                "prompt_tokens": 18146,
                "completion_tokens": 0,
                "image_tokens": 17892,
                "total_tokens": 18146
            }
        }
    }
}
上一篇
向量检索-SearchByVector
下一篇
id检索-SearchById
概述
请求接口
请求体参数
请求响应示例
1.文本检索
2.文本+图片检索
视频检索

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
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const block_basekit_server_api_1 = require("@lark-opdev/block-basekit-server-api");
const crypto_js_1 = __importDefault(require("crypto-js"));
const { t } = block_basekit_server_api_1.field;
// 通过addDomainList添加请求接口的域名
block_basekit_server_api_1.basekit.addDomainList(['amazonaws.com']);
block_basekit_server_api_1.basekit.addField({
    // 定义捷径的i18n语言资源
    i18n: {
        messages: {
            'zh-CN': {
                'prompt': '输入提示词',
                'prompt_placeholder': '请输入提示词-提示',
                'modelType': '选择模型',
                'modelType_placeholder': '选择模型类型',
                'endpoint': 'Bedrock Endpoint',
                'endpoint_placeholder': '输入 Amazon Bedrock Endpoint URL',
                'accessKey': 'Access Key',
                'accessKey_placeholder': '输入 Access Key',
                'secretKey': 'Secret Access Key',
                'secretKey_placeholder': '输入 Secret Access Key',
                'link_tooltip': '参考以下',
                'document_link': '链接'
            },
            'en-US': {
                'prompt': 'Enter prompt',
                'prompt_placeholder': 'Please enter prompt-prompt',
                'modelType': 'Select a model',
                'modelType_placeholder': 'Select a model',
                'endpoint': 'Bedrock Endpoint',
                'endpoint_placeholder': 'Input Amazon Bedrock Endpoint URL',
                'accessKey': 'Access Key',
                'accessKey_placeholder': 'Input Access Key',
                'secretKey': 'Secret Access Key',
                'secretKey_placeholder': 'Input Secret Access Key',
                'link_tooltip': 'Refer to the following ',
                'document_link': 'link'
            },
            'ja-JP': {
                'prompt': 'プロンプトを入力してください',
                'prompt_placeholder': 'プロンプトを入力してください',
                'modelType': 'モデルタイプ',
                'modelType_placeholder': 'モデルを選択',
                'endpoint': 'Bedrockエンドポイント',
                'endpoint_placeholder': 'エンドポイントを入力してください',
                'accessKey': 'アクセスキー',
                'accessKey_placeholder': 'アクセスキーを入力してください',
                'secretKey': 'シークレットアクセスキー',
                'secretKey_placeholder': 'シークレットアクセスキーを入力してください',
                'link_tooltip': '以下を参照してください',
                'document_link': 'リンク'
            },
        }
    },
    // 定义捷径的入参
    formItems: [
        {
            key: 'prompt',
            label: t('prompt'),
            component: block_basekit_server_api_1.FieldComponent.Input,
            props: {
                placeholder: t('prompt_placeholder')
            },
            validator: {
                required: true,
            }
        },
        {
            key: 'bedrockEndpoint',
            label: t('endpoint'),
            tooltips: [
                {
                    type: 'text',
                    content: t('link_tooltip'),
                },
                {
                    type: 'link',
                    text: t('document_link'),
                    link: 'https://docs.aws.amazon.com/general/latest/gr/bedrock.html'
                }
            ],
            component: block_basekit_server_api_1.FieldComponent.Input,
            props: {
                placeholder: t('endpoint_placeholder')
            },
            validator: {
                required: true,
            }
        },
        {
            key: 'accessKey',
            label: t('accessKey'),
            tooltips: [
                {
                    type: 'text',
                    content: t('link_tooltip'),
                },
                {
                    type: 'link',
                    text: t('document_link'),
                    link: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html'
                }
            ],
            component: block_basekit_server_api_1.FieldComponent.Input,
            props: {
                placeholder: t('accessKey_placeholder'),
            },
            validator: {
                required: true,
            }
        },
        {
            key: 'secretKey',
            label: t('secretKey'),
            tooltips: [
                {
                    type: 'text',
                    content: t('link_tooltip'),
                },
                {
                    type: 'link',
                    text: t('document_link'),
                    link: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html'
                }
            ],
            component: block_basekit_server_api_1.FieldComponent.Input,
            props: {
                placeholder: t('secretKey_placeholder'),
            },
            validator: {
                required: true,
            }
        },
        {
            key: 'modelType',
            label: t('modelType'),
            component: block_basekit_server_api_1.FieldComponent.SingleSelect,
            props: {
                placeholder: t('modelType_placeholder'),
                options: [
                    { label: 'Amazon Nova Pro', value: 'amazon.nova-pro-v1:0' },
                    { label: 'Amazon Nova Lite', value: 'amazon.nova-lite-v1:0' },
                    { label: 'Amazon Nova Micro', value: 'amazon.nova-micro-v1:0' }
                ]
            },
            validator: {
                required: true,
            }
        }
    ],
    // 定义捷径的返回结果类型
    resultType: {
        type: block_basekit_server_api_1.FieldType.Text,
    },
    // formItemParams 为运行时传入的字段参数，对应字段配置里的 formItems （如引用的依赖字段）
    execute: async (formItemParams, context) => {
        const { prompt, modelType, bedrockEndpoint, accessKey, secretKey } = formItemParams;
        const region = 'us-east-1';
        const modelId = modelType.value;
        // 构建请求体
        const requestBody = JSON.stringify({
            modelId: modelId,
            messages: [
                {
                    role: 'user',
                    content: [{ text: prompt }]
                }
            ],
            inferenceConfig: {
                maxTokens: 1000, // The maximum response length
                temperature: 0.7, // Using temperature for randomness control
            }
        });
        // 构建请求路径和方法
        const method = 'POST';
        const path = `/model/${modelId}/converse`;
        // 获取当前时间
        const now = new Date();
        const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
        const dateStamp = amzDate.substring(0, 8);
        // 准备请求头
        const headers = {
            'host': bedrockEndpoint,
            'content-type': 'application/json',
            'x-amz-date': amzDate
        };
        // 创建规范化的请求头
        let canonicalHeaders = '';
        let signedHeaders = '';
        // 按字典顺序排序请求头
        const sortedHeaders = Object.keys(headers).sort();
        for (const key of sortedHeaders) {
            canonicalHeaders += `${key}:${headers[key]}\n`;
            signedHeaders += `${key};`;
        }
        // 移除最后一个分号
        signedHeaders = signedHeaders.slice(0, -1);
        // 创建请求负载的哈希
        const payloadHash = crypto_js_1.default.SHA256(requestBody).toString(crypto_js_1.default.enc.Hex);
        // 组合规范化请求
        const modelId_Encode = encodeURIComponent(modelId);
        const canonicalUri = `/model/${modelId_Encode}/converse`;
        const canonicalQueryString = '';
        const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
        console.log('canonicalRequest:', canonicalRequest);
        // 创建待签名字符串
        const algorithm = 'AWS4-HMAC-SHA256';
        const service = 'bedrock';
        const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
        const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${crypto_js_1.default.SHA256(canonicalRequest).toString(crypto_js_1.default.enc.Hex)}`;
        console.log('stringToSign:', stringToSign);
        // 计算签名
        const kDate = crypto_js_1.default.HmacSHA256(dateStamp, 'AWS4' + secretKey);
        const kRegion = crypto_js_1.default.HmacSHA256(region, kDate);
        const kService = crypto_js_1.default.HmacSHA256(service, kRegion);
        const kSigning = crypto_js_1.default.HmacSHA256('aws4_request', kService);
        const signature = crypto_js_1.default.HmacSHA256(stringToSign, kSigning).toString(crypto_js_1.default.enc.Hex);
        // 添加授权头
        headers['authorization'] = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
        try {
            // 使用fetch API发送请求
            const response = await context.fetch(`https://${bedrockEndpoint}${path}`, {
                method,
                headers,
                body: requestBody
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.log(`请求失败，状态码: ${response.status}, 响应: ${errorText}`);
            }
            // 解析响应
            const responseBody = await response.json();
            console.log(responseBody);
            // 提取生成的文本
            //const response = await client.send(new ConverseCommand(request));
            console.log(responseBody.output.message.content[0].text);
            const generatedText = responseBody.output.message.content[0].text;
            return {
                code: block_basekit_server_api_1.FieldCode.Success,
                data: generatedText
            };
        }
        catch (error) {
            console.error('调用 Amazon Bedrock API 时出错:', error);
            if (error.code === 'ENOTFOUND') {
                return {
                    code: block_basekit_server_api_1.FieldCode.Success,
                    data: '无法连接到 Amazon Bedrock API, 请检查网络连接',
                    errorMessage: '无法连接到 Amazon Bedrock API, 请检查网络连接'
                };
            }
            if (error.name === 'UnrecognizedClientException') {
                return {
                    code: block_basekit_server_api_1.FieldCode.Success,
                    data: '认证失败：请检查 Access Key 和 Secret Access Key 是否正确, 并确保有权限访问 Bedrock 服务',
                    errorMessage: '认证失败：无效的访问凭证'
                };
            }
            if (error.$metadata?.httpStatusCode === 403) {
                return {
                    code: block_basekit_server_api_1.FieldCode.Success,
                    data: '权限错误：请确保您的 AWS 账户已启用 Bedrock 服务, 并且 IAM 用户具有适当的权限',
                    errorMessage: '权限错误：无访问权限'
                };
            }
            if (error.$metadata?.httpStatusCode === 429) {
                return {
                    code: block_basekit_server_api_1.FieldCode.RateLimit,
                    data: '请求过于频繁，请稍后再试',
                    errorMessage: '请求过于频繁，请稍后再试'
                };
            }
            return {
                code: block_basekit_server_api_1.FieldCode.Error,
                errorMessage: '调用 Amazon Bedrock API 时出错'
            };
        }
    },
});
exports.default = block_basekit_server_api_1.basekit;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxtRkFBNEc7QUFDNUcsMERBQWlDO0FBQ2pDLE1BQU0sRUFBRSxDQUFDLEVBQUUsR0FBRyxnQ0FBSyxDQUFDO0FBRXBCLDJCQUEyQjtBQUMzQixrQ0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7QUFFekMsa0NBQU8sQ0FBQyxRQUFRLENBQUM7SUFDZixnQkFBZ0I7SUFDaEIsSUFBSSxFQUFFO1FBQ0osUUFBUSxFQUFFO1lBQ1IsT0FBTyxFQUFFO2dCQUNQLFFBQVEsRUFBRSxPQUFPO2dCQUNqQixvQkFBb0IsRUFBRSxXQUFXO2dCQUNqQyxXQUFXLEVBQUUsTUFBTTtnQkFDbkIsdUJBQXVCLEVBQUUsUUFBUTtnQkFDakMsVUFBVSxFQUFFLGtCQUFrQjtnQkFDOUIsc0JBQXNCLEVBQUUsZ0NBQWdDO2dCQUN4RCxXQUFXLEVBQUUsWUFBWTtnQkFDekIsdUJBQXVCLEVBQUUsZUFBZTtnQkFDeEMsV0FBVyxFQUFFLG1CQUFtQjtnQkFDaEMsdUJBQXVCLEVBQUUsc0JBQXNCO2dCQUMvQyxjQUFjLEVBQUUsTUFBTTtnQkFDdEIsZUFBZSxFQUFFLElBQUk7YUFDdEI7WUFDRCxPQUFPLEVBQUU7Z0JBQ1AsUUFBUSxFQUFFLGNBQWM7Z0JBQ3hCLG9CQUFvQixFQUFFLDRCQUE0QjtnQkFDbEQsV0FBVyxFQUFFLGdCQUFnQjtnQkFDN0IsdUJBQXVCLEVBQUUsZ0JBQWdCO2dCQUN6QyxVQUFVLEVBQUUsa0JBQWtCO2dCQUM5QixzQkFBc0IsRUFBRSxtQ0FBbUM7Z0JBQzNELFdBQVcsRUFBRSxZQUFZO2dCQUN6Qix1QkFBdUIsRUFBRSxrQkFBa0I7Z0JBQzNDLFdBQVcsRUFBRSxtQkFBbUI7Z0JBQ2hDLHVCQUF1QixFQUFFLHlCQUF5QjtnQkFDbEQsY0FBYyxFQUFFLHlCQUF5Qjtn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
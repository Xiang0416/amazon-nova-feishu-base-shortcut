"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const block_basekit_server_api_1 = require("@lark-opdev/block-basekit-server-api");
const client_bedrock_runtime_1 = require("@aws-sdk/client-bedrock-runtime");
const { t } = block_basekit_server_api_1.field;
// 通过addDomainList添加请求接口的域名
block_basekit_server_api_1.basekit.addDomainList(['amazonaws.com']);
block_basekit_server_api_1.basekit.addField({
    // 定义捷径的i18n语言资源
    i18n: {
        messages: {
            'zh-CN': {
                'prompt': '输入提示词',
                'prompt_placeholder': '请输入提示词',
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
                'prompt_placeholder': 'Please enter prompt',
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
        /** 为方便查看日志，使用此方法替代console.log */
        function debugLog(arg) {
            console.log(JSON.stringify({
                formItemParams,
                context,
                arg
            }));
        }
        // 创建 Bedrock Runtime 客户端
        const client = new client_bedrock_runtime_1.BedrockRuntimeClient({
            endpoint: bedrockEndpoint, // 设置你的 Amazon Bedrock endpoint
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretKey,
            }
        });
        const message = {
            content: [{ text: prompt }],
            role: client_bedrock_runtime_1.ConversationRole.USER,
        };
        const request = {
            modelId: modelType.value,
            messages: [message],
            inferenceConfig: {
                maxTokens: 1000, // The maximum response length
                temperature: 0.7, // Using temperature for randomness control
            },
        };
        try {
            const response = await client.send(new client_bedrock_runtime_1.ConverseCommand(request));
            console.log(response.output.message.content[0].text);
            const generatedText = response.output.message.content[0].text;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtRkFBZ0o7QUFDaEosNEVBQXlHO0FBQ3pHLE1BQU0sRUFBRSxDQUFDLEVBQUUsR0FBRyxnQ0FBSyxDQUFDO0FBRXBCLDJCQUEyQjtBQUMzQixrQ0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7QUFFekMsa0NBQU8sQ0FBQyxRQUFRLENBQUM7SUFDZixnQkFBZ0I7SUFDaEIsSUFBSSxFQUFFO1FBQ0osUUFBUSxFQUFFO1lBQ1IsT0FBTyxFQUFFO2dCQUNQLFFBQVEsRUFBRSxPQUFPO2dCQUNqQixvQkFBb0IsRUFBRSxRQUFRO2dCQUM5QixXQUFXLEVBQUUsTUFBTTtnQkFDbkIsdUJBQXVCLEVBQUUsUUFBUTtnQkFDakMsVUFBVSxFQUFFLGtCQUFrQjtnQkFDOUIsc0JBQXNCLEVBQUUsZ0NBQWdDO2dCQUN4RCxXQUFXLEVBQUUsWUFBWTtnQkFDekIsdUJBQXVCLEVBQUUsZUFBZTtnQkFDeEMsV0FBVyxFQUFFLG1CQUFtQjtnQkFDaEMsdUJBQXVCLEVBQUUsc0JBQXNCO2dCQUMvQyxjQUFjLEVBQUUsTUFBTTtnQkFDdEIsZUFBZSxFQUFFLElBQUk7YUFDdEI7WUFDRCxPQUFPLEVBQUU7Z0JBQ1AsUUFBUSxFQUFFLGNBQWM7Z0JBQ3hCLG9CQUFvQixFQUFFLHFCQUFxQjtnQkFDM0MsV0FBVyxFQUFFLGdCQUFnQjtnQkFDN0IsdUJBQXVCLEVBQUUsZ0JBQWdCO2dCQUN6QyxVQUFVLEVBQUUsa0JBQWtCO2dCQUM5QixzQkFBc0IsRUFBRSxtQ0FBbUM7Z0JBQzNELFdBQVcsRUFBRSxZQUFZO2dCQUN6Qix1QkFBdUIsRUFBRSxrQkFBa0I7Z0JBQzNDLFdBQVcsRUFBRSxtQkFBbUI7Z0JBQ2hDLHVCQUF1QixFQUFFLHlCQUF5QjtnQkFDbEQsY0FBYyxFQUFFLHlCQUF5QjtnQkFD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
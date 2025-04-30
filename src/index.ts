import { basekit, FieldType, field, FieldComponent, FieldCode, NumberFormatter, AuthorizationType } from '@lark-opdev/block-basekit-server-api';
import { BedrockRuntimeClient, ConversationRole, ConverseCommand} from "@aws-sdk/client-bedrock-runtime";
const { t } = field;

// 通过addDomainList添加请求接口的域名
basekit.addDomainList(['amazonaws.com']);

basekit.addField({
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
        component: FieldComponent.Input,
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
        component: FieldComponent.Input,
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
        component: FieldComponent.Input,
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
        component: FieldComponent.Input,
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
        component: FieldComponent.SingleSelect,
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
    type: FieldType.Text,
  },
  // formItemParams 为运行时传入的字段参数，对应字段配置里的 formItems （如引用的依赖字段）
  execute: async (formItemParams , context) => {
    const { prompt, modelType, bedrockEndpoint, accessKey, secretKey } = formItemParams;
    /** 为方便查看日志，使用此方法替代console.log */
    function debugLog(arg: any) {
      console.log(JSON.stringify({
        formItemParams,
        context,
        arg
      }))
    }

    // 创建 Bedrock Runtime 客户端
    const client = new BedrockRuntimeClient({ 
      endpoint: bedrockEndpoint, // 设置你的 Amazon Bedrock endpoint
      credentials: {
          accessKeyId: accessKey,
          secretAccessKey:  secretKey,
      }
    });

    const message = {
      content: [{ text: prompt }],
      role: ConversationRole.USER,
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
        const response = await client.send(new ConverseCommand(request));
        console.log(response.output.message.content[0].text);
        const generatedText = response.output.message.content[0].text;

        return {
            code: FieldCode.Success,
            data: generatedText
        };
    } catch (error) {
        console.error('调用 Amazon Bedrock API 时出错:', error);
        if(error.code === 'ENOTFOUND') {
            return {
                code: FieldCode.Success,
                data: '无法连接到 Amazon Bedrock API, 请检查网络连接',
                errorMessage: '无法连接到 Amazon Bedrock API, 请检查网络连接'
            };
        }
        if (error.name === 'UnrecognizedClientException') {
          return {
              code: FieldCode.Success,
              data: '认证失败：请检查 Access Key 和 Secret Access Key 是否正确, 并确保有权限访问 Bedrock 服务',
              errorMessage: '认证失败：无效的访问凭证'
          };
        }
      
        if (error.$metadata?.httpStatusCode === 403) {
            return {
                code: FieldCode.Success,
                data: '权限错误：请确保您的 AWS 账户已启用 Bedrock 服务, 并且 IAM 用户具有适当的权限',
                errorMessage: '权限错误：无访问权限'
            };
        }
        
        if (error.$metadata?.httpStatusCode === 429) {
          return {
              code: FieldCode.RateLimit,
              data: '请求过于频繁，请稍后再试',
              errorMessage: '请求过于频繁，请稍后再试'
          };
        }

        return {
            code: FieldCode.Error,
            errorMessage: '调用 Amazon Bedrock API 时出错'
        };
    }
  },
});
export default basekit;
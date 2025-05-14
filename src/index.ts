import { basekit, FieldType, field, FieldComponent, FieldCode } from '@lark-opdev/block-basekit-server-api';
import CryptoJS from 'crypto-js';
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
    const headers: Record<string, string> = {
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
    const payloadHash = CryptoJS.SHA256(requestBody).toString(CryptoJS.enc.Hex);
    
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
    const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${CryptoJS.SHA256(canonicalRequest).toString(CryptoJS.enc.Hex)}`;
    console.log('stringToSign:', stringToSign);
    // 计算签名
    const kDate = CryptoJS.HmacSHA256(dateStamp, 'AWS4' + secretKey);
    const kRegion = CryptoJS.HmacSHA256(region, kDate);
    const kService = CryptoJS.HmacSHA256(service, kRegion);
    const kSigning = CryptoJS.HmacSHA256('aws4_request', kService);
    const signature = CryptoJS.HmacSHA256(stringToSign, kSigning).toString(CryptoJS.enc.Hex);
    
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
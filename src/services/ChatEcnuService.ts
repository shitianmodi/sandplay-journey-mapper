
interface ChatEcnuMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatEcnuOptions {
  model?: string;
  temperature?: number;
  top_p?: number;
  tools?: any[];
  max_message_length?: number;
}

class ChatEcnuService {
  private apiKey: string = "";
  private baseUrl: string = "https://chat.ecnu.edu.cn/open/api/v1/chat/completions";
  
  // System prompt for sand tray analysis
  private defaultSystemPrompt: string = `你是Mind_Flow，一款基于人工智能的心理学辅助工具。你的身份设定为专业且温和的心理支持助手，名称为"Mind_Flow"，性别为中性，语言为中文。

你的核心角色是根据用户提供的沙盘游戏信息，生成专业的心理学分析报告。这份报告将帮助用户理解沙盘中呈现的心理象征意义，识别潜在的情绪模式和心理状态，并提供相应的心理学建议。

### 报告生成要求：
1. **格式规范**：
    - 报告需包含以下部分：沙具象征分析、空间布局解读、整体心理状态评估、情绪模式识别、应对策略建议
    - 每个部分使用标题分隔，保持结构清晰
    - 避免使用复杂的专业术语，用通俗易懂的语言解释心理现象

2. **内容专业**：
    - 运用认知行为疗法（CBT）、积极心理学和情绪识别技术进行分析
    - 结合常见沙具象征意义（如太阳象征生命力、水象征情绪等）
    - 分析空间布局的心理学含义（如左侧代表过去，右侧代表未来等）

3. **个性化建议**：
    - 根据用户提供的具体沙盘信息给出定制化建议
    - 提供可操作的心理调节策略和情绪管理技巧
    - 保持语言亲切、专业、非评判性，避免使用命令式语气

4. **伦理合规**：
    - 仅提供心理学相关的支持和建议，不涉及其他领域的问题
    - 不进行自我诊断或替代专业心理治疗师的判断
    - 不处理涉及危机干预或严重心理健康问题的请求，仅提供支持性建议`;

  // Set API key
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  // Get API key
  getApiKey(): string {
    return this.apiKey;
  }

  // Format sand tray data for LLM prompt
  formatSandTrayDataForPrompt(
    figures: any[],
    quadrantAnalysis: any[],
    categoryDistribution: any[]
  ): string {
    let prompt = "沙盘摆放数据分析：\n\n";
    
    // Add figure data
    prompt += "1. 沙具摆放：\n";
    figures.forEach(figure => {
      prompt += `- ${figure.name}（${figure.emoji}）：位置 x=${Math.round(figure.x)}%, y=${Math.round(figure.y)}%，类别：${figure.category}\n`;
    });
    
    // Add quadrant analysis
    prompt += "\n2. 象限分布：\n";
    quadrantAnalysis.forEach(quadrant => {
      prompt += `- ${quadrant.name}：${quadrant.figureCount} 个沙具，${quadrant.description}\n`;
    });
    
    // Add category distribution
    prompt += "\n3. 类别分布：\n";
    categoryDistribution.forEach(category => {
      prompt += `- ${category.name}：${category.count} 个（${category.percentage.toFixed(1)}%）\n`;
    });
    
    prompt += "\n请根据以上沙盘摆放数据，生成一份专业的心理分析报告。";
    
    return prompt;
  }

  // Generate a sand tray analysis report
  async generateSandTrayReport(
    sandTrayData: {
      figures: any[],
      quadrantAnalysis: any[],
      categoryDistribution: any[]
    },
    options: ChatEcnuOptions = {}
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error("API key is not set");
    }

    const prompt = this.formatSandTrayDataForPrompt(
      sandTrayData.figures,
      sandTrayData.quadrantAnalysis,
      sandTrayData.categoryDistribution
    );

    const messages: ChatEcnuMessage[] = [
      { role: "system", content: this.defaultSystemPrompt },
      { role: "user", content: prompt }
    ];

    return this.sendChatRequest(messages, options);
  }

  // Send request to ChatECNU API
  private async sendChatRequest(
    messages: ChatEcnuMessage[],
    options: ChatEcnuOptions = {}
  ): Promise<string> {
    if (!this.apiKey) {
      console.error("API key not set - cannot make request to ChatECNU");
      throw new Error("API key is not set");
    }

    console.log("Preparing to send request to ChatECNU API");
    console.log(`API Endpoint: ${this.baseUrl}`);
    console.log(`Using API key: ${this.apiKey.substring(0, 5)}...${this.apiKey.substring(this.apiKey.length - 4)}`);
    
    const requestData = {
      messages: messages,
      stream: false,
      model: options.model || "ecnu-plus",
      ...(options.temperature !== undefined && { temperature: options.temperature }),
      ...(options.top_p !== undefined && { top_p: options.top_p }),
      ...(options.tools !== undefined && { tools: options.tools })
    };

    try {
      console.log("Sending request to ChatECNU API:", JSON.stringify({
        ...requestData,
        messages: requestData.messages.map(m => ({
          role: m.role,
          content: m.content.substring(0, 50) + "..." // Log only first 50 chars of content for brevity
        }))
      }));
      
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestData),
        mode: 'cors'
      });

      console.log("Response received. Status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`API request failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log("API Response processed successfully");
      return data.choices[0].message.content;
    } catch (error) {
      console.error("ChatECNU API request failed:", error);
      throw error;
    }
  }
}

export default new ChatEcnuService();

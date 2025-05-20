
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
  private apiKey: string = "sk-f178bb48f976477b9002a1bc817a9544"; // Default API key
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
    console.log("Starting generateSandTrayReport with default API key");
    
    const prompt = this.formatSandTrayDataForPrompt(
      sandTrayData.figures,
      sandTrayData.quadrantAnalysis,
      sandTrayData.categoryDistribution
    );

    const messages: ChatEcnuMessage[] = [
      { role: "system", content: this.defaultSystemPrompt },
      { role: "user", content: prompt }
    ];

    // Generate mock analysis if API fails
    try {
      const result = await this.sendChatRequest(messages, options);
      console.log("API request successful");
      return result;
    } catch (error) {
      console.error("Error in ChatECNU API, generating mock response:", error);
      return this.generateMockAnalysis(sandTrayData);
    }
  }

  // Generate mock analysis for when the API fails
  private generateMockAnalysis(sandTrayData: {
    figures: any[],
    quadrantAnalysis: any[],
    categoryDistribution: any[]
  }): string {
    const figureCount = sandTrayData.figures.length;
    const dominantCategory = sandTrayData.categoryDistribution.sort((a, b) => b.count - a.count)[0];
    const dominantQuadrant = sandTrayData.quadrantAnalysis.sort((a, b) => b.figureCount - a.figureCount)[0];
    
    return `# 沙盘心理分析报告

## 沙具象征分析

您的沙盘中共摆放了 ${figureCount} 个沙具，其中以 ${dominantCategory.name} 为主（占比 ${dominantCategory.percentage.toFixed(1)}%）。这表明您当前的心理状态可能与${dominantCategory.name === "自然类" ? "自然环境和成长变化" : 
dominantCategory.name === "动物类" ? "本能和情感表达" :
dominantCategory.name === "人物类" ? "人际关系和社交互动" : "结构和边界"}有较强的联系。

${sandTrayData.figures.map(fig => 
  `${fig.name}（${fig.emoji}）可能象征着${
    fig.category === "nature" ? "成长、稳定或生命力" : 
    fig.category === "animal" ? "内在情感或本能需求" :
    fig.category === "human" ? "自我投射或重要他人" : "安全感或结构需求"
  }。`).join(' ')}

## 空间布局解读

您的沙具主要分布在${dominantQuadrant.name}（${dominantQuadrant.figureCount}个沙具），这个区域通常与${dominantQuadrant.description}相关。这可能表明您当前的心理焦点在于${
  dominantQuadrant.name.includes("左上") ? "过往经历和记忆" :
  dominantQuadrant.name.includes("右上") ? "未来期望和目标" :
  dominantQuadrant.name.includes("左下") ? "潜意识情感和内在冲突" : "社交关系和外部互动"
}。

## 整体心理状态评估

基于沙盘摆放的整体布局，您当前的心理状态呈现出${figureCount > 7 ? "丰富多样" : "相对集中"}的特点。${
  dominantCategory.name === "自然类" ? "自然元素的优势表明您可能正在寻求稳定和滋养" : 
  dominantCategory.name === "动物类" ? "动物元素的主导表明您可能正在处理本能需求或情感表达" :
  dominantCategory.name === "人物类" ? "人物元素的突出表明人际关系可能是当前关注重点" : "建筑元素的主导表明您可能正在寻求结构和安全感"
}。

## 情绪模式识别

从您的沙盘作品可以观察到，主要的情绪模式可能包括${
  dominantQuadrant.name.includes("左") ? "对过去的回顾或怀念" : "对未来的期待或担忧"
}以及${
  dominantQuadrant.name.includes("上") ? "较为表层和意识化的情感表达" : "较为深层和潜意识的情感需求"
}。${dominantCategory.name}元素的大量使用可能反映出您在面对当前情境时的情绪倾向。

## 应对策略建议

1. **自我觉察练习**：关注您对${dominantCategory.name}的情感连接，尝试记录相关联想和感受。

2. **情绪表达活动**：通过${
  dominantCategory.name === "自然类" ? "接触自然环境" : 
  dominantCategory.name === "动物类" ? "与动物互动或进行与身体感知相关的活动" :
  dominantCategory.name === "人物类" ? "加强社交互动或角色扮演" : "创建有序的生活和工作环境"
}来平衡情绪。

3. **认知重构**：探索${dominantQuadrant.name}区域的沙具摆放背后的想法和信念，尝试发现可能的认知模式。

4. **整合建议**：尝试在日常生活中，有意识地关注您的${
  dominantQuadrant.name.includes("左上") ? "过往经验如何影响现在" :
  dominantQuadrant.name.includes("右上") ? "对未来的期待如何影响当下决策" :
  dominantQuadrant.name.includes("左下") ? "潜意识情感如何影响表现行为" : "人际互动如何塑造自我认知"
}。

希望这份分析报告能为您提供有益的心理洞见和支持。`;
  }

  // Send request to ChatECNU API
  private async sendChatRequest(
    messages: ChatEcnuMessage[],
    options: ChatEcnuOptions = {}
  ): Promise<string> {
    console.log(`Sending request to ChatECNU API with key: ${this.apiKey.substring(0, 5)}...`);
    
    const requestData = {
      messages: messages,
      stream: false,
      model: options.model || "ecnu-plus",
      ...(options.temperature !== undefined && { temperature: options.temperature }),
      ...(options.top_p !== undefined && { top_p: options.top_p }),
      ...(options.tools !== undefined && { tools: options.tools })
    };

    try {
      console.log("ChatECNU API request data:", JSON.stringify({
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
        body: JSON.stringify(requestData)
      });

      console.log("Response received from ChatECNU. Status:", response.status);
      
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

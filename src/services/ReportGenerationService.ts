
/**
 * Report Generation Service
 * Uses a large language model API to generate analysis reports based on sand tray arrangement data
 */

interface PlacedFigure {
  id: string;
  name: string;
  category: string;
  x: number;
  y: number;
  emoji?: string;
}

interface GenerationParams {
  figures: PlacedFigure[];
  quadrantAnalysis: { name: string; description: string; figureCount: number }[];
  categoryDistribution: { name: string; count: number; percentage: number }[];
}

export class ReportGenerationService {
  private apiEndpoint: string = "https://api.openai.com/v1/chat/completions";
  private apiKey: string | null = null;

  /**
   * Set the API key for the language model service
   * @param key API key
   */
  setApiKey(key: string) {
    this.apiKey = key;
  }

  /**
   * Generate a comprehensive report based on sand tray analysis
   * @param params Analysis parameters
   * @returns Generated report text
   */
  async generateReport(params: GenerationParams): Promise<string> {
    // For demo purposes, if no API key is set, use mock generation
    if (!this.apiKey) {
      console.warn("No API key set, using mock report generation");
      return this.mockGenerateReport(params);
    }
    
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an expert in sand tray therapy analysis. Provide a detailed interpretation of the sand tray arrangement described, focusing on psychological insights, emotional themes, and therapeutic recommendations. Use professional language appropriate for a clinical setting."
            },
            {
              role: "user",
              content: this.formatPrompt(params)
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
      
    } catch (error) {
      console.error("Error generating report:", error);
      return "报告生成失败，请检查API密钥或网络连接后重试。";
    }
  }

  /**
   * Format prompt for the language model based on analysis parameters
   * @param params Analysis parameters
   * @returns Formatted prompt
   */
  private formatPrompt(params: GenerationParams): string {
    const { figures, quadrantAnalysis, categoryDistribution } = params;
    
    // Convert figures data to a formatted string
    const figuresDesc = figures.map(f => 
      `- ${f.name} (类别: ${f.category}), 位置: x=${f.x}%, y=${f.y}%`
    ).join("\n");
    
    // Convert quadrant analysis to a formatted string
    const quadrantDesc = quadrantAnalysis.map(q => 
      `- ${q.name}: ${q.figureCount}个物体, ${q.description}`
    ).join("\n");
    
    // Convert category distribution to a formatted string
    const categoryDesc = categoryDistribution.map(c => 
      `- ${c.name}: ${c.count}个 (${c.percentage.toFixed(1)}%)`
    ).join("\n");
    
    return `
分析沙盘治疗摆放，请提供详细的心理分析报告。

沙具摆放信息:
${figuresDesc}

象限分析:
${quadrantDesc}

类别分布:
${categoryDesc}

请提供以下内容的分析:
1. 总体印象和主要主题
2. 象限分布的心理意义
3. 物体类别选择的象征意义
4. 物体之间的关系和空间安排
5. 可能的心理状态和情感主题
6. 治疗建议和后续方向

请使用专业的心理治疗语言，但确保报告容易理解。
`;
  }

  /**
   * Mock report generation for demo purposes
   * @param params Analysis parameters
   * @returns Generated report text
   */
  private mockGenerateReport(params: GenerationParams): Promise<string> {
    // Simulate API delay
    return new Promise(resolve => {
      setTimeout(() => {
        const { figures, categoryDistribution } = params;
        
        // Find dominant category
        const dominantCategory = [...categoryDistribution]
          .sort((a, b) => b.count - a.count)[0];
        
        // Generate mock report based on data
        const report = `
# 沙盘治疗分析报告

## 总体印象和主要主题

该沙盘摆放展现了明显的${dominantCategory.name}主题，共使用了${figures.length}个沙具进行表达。整体布局呈现${figures.length > 5 ? "较为丰富的" : "相对简约的"}结构，暗示来访者可能${figures.length > 5 ? "有丰富的内在世界和复杂的情感表达需求" : "倾向于精简和聚焦核心议题"}。

## 象限分布的心理意义

沙具在空间中的分布呈现出关注${params.quadrantAnalysis.find(q => q.name.includes("左上")) && params.quadrantAnalysis.find(q => q.name.includes("左上"))!.figureCount > 0 ? "过去经验" : ""}${params.quadrantAnalysis.find(q => q.name.includes("右上")) && params.quadrantAnalysis.find(q => q.name.includes("右上"))!.figureCount > 0 ? "未来期望" : ""}${params.quadrantAnalysis.find(q => q.name.includes("左下")) && params.quadrantAnalysis.find(q => q.name.includes("左下"))!.figureCount > 0 ? "潜意识内容" : ""}${params.quadrantAnalysis.find(q => q.name.includes("右下")) && params.quadrantAnalysis.find(q => q.name.includes("右下"))!.figureCount > 0 ? "社交关系" : ""}的倾向。这表明来访者当前可能正在处理相关议题。

## 物体类别选择的象征意义

${dominantCategory.name}元素的大量使用（${dominantCategory.percentage.toFixed(1)}%）表明这一主题在来访者当前心理状态中占据重要位置。${dominantCategory.name === "自然类" ? "自然元素可能象征对成长、变化或稳定性的需求。" : dominantCategory.name === "动物类" ? "动物元素可能反映出本能需求或情感状态的投射。" : dominantCategory.name === "人物类" ? "人物元素的使用表明社交关系或人际互动在当前生活中具有重要意义。" : "建筑元素可能代表结构、边界或安全感的需求。"}

## 物体之间的关系和空间安排

沙具之间的排列${figures.some(f => Math.abs(f.x - 50) < 15 && Math.abs(f.y - 50) < 15) ? "出现中心聚集的趋势，可能代表核心议题或中心化的关注点" : "较为分散，可能表明多元化的关注或经验整合的需求"}。${figures.filter(f => f.category === "human").length > 0 ? "人物沙具的摆放位置暗示人际互动模式和关系动力。" : ""}

## 可能的心理状态和情感主题

基于沙盘摆放的整体特征，来访者可能正在经历${dominantCategory.name === "自然类" ? "对稳定与变化的内在协调" : dominantCategory.name === "动物类" ? "情感或本能需求的表达与整合" : dominantCategory.name === "人物类" ? "人际关系或社交互动中的某些挑战" : "对结构和安全感的建立与巩固"}过程。沙盘中${figures.length < 4 ? "元素较少，可能反映聚焦或简化的倾向" : "元素丰富，表现出表达的复杂性和多样性"}。

## 治疗建议和后续方向

1. 建议在后续治疗中深入探讨${dominantCategory.name}主题背后的情感和需求
2. 关注沙盘中${figures.some(f => Math.abs(f.x - 50) < 15 && Math.abs(f.y - 50) < 15) ? "中心区域" : "边缘区域"}的元素象征意义
3. 探索来访者对不同沙具的情感反应和个人关联
4. 在安全的治疗环境中，逐步拓展${dominantCategory.name === "自然类" ? "情感表达" : dominantCategory.name === "动物类" ? "社交互动" : dominantCategory.name === "人物类" ? "自我关怀" : "创造性表达"}的能力

*注：本报告基于沙盘摆放的初步分析，完整的心理评估需结合来访者的语言表达、行为观察和治疗过程中的动态变化。*
`;

        resolve(report);
      }, 2000);
    });
  }
}

export default new ReportGenerationService();

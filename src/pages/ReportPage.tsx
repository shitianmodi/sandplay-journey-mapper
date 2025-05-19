
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Layout from "../components/Layout";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "../contexts/AuthContext";

interface PlacedFigure {
  id: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
  category: string;
}

interface AnalysisResult {
  categoryDistribution: { name: string; count: number; percentage: number }[];
  placementPatterns: { name: string; description: string; score: number }[];
  quadrantAnalysis: { name: string; description: string; figureCount: number }[];
  totalFigures: number;
  overallAnalysis: string;
  detailedAnalysis?: string;
}

const ReportPage = () => {
  const [figures, setFigures] = useState<PlacedFigure[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [date, setDate] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { username } = useAuth();

  useEffect(() => {
    // Load saved figures and analysis from sessionStorage
    const savedFigures = sessionStorage.getItem("sandTrayFigures");
    const savedAnalysis = sessionStorage.getItem("sandTrayAnalysis");
    
    if (!savedFigures || !savedAnalysis) {
      toast({
        variant: "destructive",
        title: "没有找到沙盘数据",
        description: "请先完成沙盘摆放和分析",
      });
      navigate("/sand-tray");
      return;
    }
    
    setFigures(JSON.parse(savedFigures));
    setAnalysis(JSON.parse(savedAnalysis));
    
    // Set current date
    const now = new Date();
    setDate(now.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));
    
  }, [navigate, toast]);

  const handlePrint = () => {
    window.print();
  };

  const handleNewSession = () => {
    if (confirm("开始新的沙盘治疗会话将清除当前的数据，是否继续？")) {
      // Clear session storage
      sessionStorage.removeItem("sandTrayFigures");
      sessionStorage.removeItem("sandTrayAnalysis");
      
      // Navigate to sand tray
      navigate("/sand-tray");
    }
  };

  return (
    <Layout title="沙盘治疗报告" currentStep={4}>
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="my-6 print:hidden flex justify-end space-x-4">
          <Button variant="outline" onClick={handleNewSession}>
            开始新会话
          </Button>
          <Button onClick={handlePrint}>
            打印报告
          </Button>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow print:shadow-none">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">沙盘治疗分析报告</h1>
            <div className="text-gray-500 mt-2">
              生成时间：{date}
            </div>
            {username && (
              <div className="text-gray-500">
                治疗师：{username}
              </div>
            )}
          </div>
          
          <Separator className="my-6" />
          
          {analysis && (
            <>
              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">总体评估</h2>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-gray-700">{analysis.overallAnalysis}</p>
                    
                    <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                      <div className="border p-4 rounded">
                        <div className="text-2xl font-bold">{analysis.totalFigures}</div>
                        <div className="text-sm text-gray-500">总沙具数量</div>
                      </div>
                      <div className="border p-4 rounded">
                        <div className="text-2xl font-bold">{analysis.categoryDistribution.length}</div>
                        <div className="text-sm text-gray-500">使用类别数</div>
                      </div>
                      <div className="border p-4 rounded">
                        <div className="text-2xl font-bold">
                          {analysis.quadrantAnalysis
                            .sort((a, b) => b.figureCount - a.figureCount)[0].name}
                        </div>
                        <div className="text-sm text-gray-500">主要关注区域</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
              
              {/* Show LLM Analysis if available */}
              {analysis.detailedAnalysis && (
                <section className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">AI辅助详细分析</h2>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="prose prose-sm max-w-none">
                        <div className="text-gray-700 whitespace-pre-line">
                          {analysis.detailedAnalysis}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>
              )}
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">类别分布详情</h2>
                <div className="grid gap-4">
                  {analysis.categoryDistribution.map((category) => (
                    <Card key={category.name}>
                      <CardHeader className="py-3">
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="py-3">
                        <div className="flex justify-between">
                          <div>
                            <span className="font-medium">{category.count}</span> 个沙具
                          </div>
                          <div>
                            <span className="font-medium">{category.percentage.toFixed(1)}%</span> 占比
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">象限分布分析</h2>
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                      {analysis.quadrantAnalysis.map((quadrant) => (
                        <div key={quadrant.name}>
                          <h3 className="text-lg font-medium">{quadrant.name}</h3>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{quadrant.description}</span>
                            <span>{quadrant.figureCount} 个沙具</span>
                          </div>
                          <div 
                            className="h-2 bg-gray-100 rounded"
                            style={{
                              background: "linear-gradient(90deg, var(--therapy-blue-default) 0%, var(--therapy-blue-light) 100%)",
                              width: `${(quadrant.figureCount / analysis.totalFigures) * 100}%`
                            }}
                          ></div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 p-4 bg-therapy-neutral-light rounded">
                      <h4 className="font-medium mb-2">象限分布意义</h4>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        <li>左上象限代表过去或回忆，与过往经验相关</li>
                        <li>右上象限代表未来或期待，展现愿望和目标</li>
                        <li>左下象限代表潜意识或隐藏情感，体现内心冲突</li>
                        <li>右下象限代表社交或外部关系，反映人际互动</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">沙具摆放模式</h2>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {analysis.placementPatterns.map((pattern, index) => (
                        <div key={pattern.name}>
                          <div className="flex justify-between mb-2">
                            <h3 className="text-lg font-medium">{pattern.name}</h3>
                            <span className="font-medium">{pattern.score.toFixed(1)}%</span>
                          </div>
                          <div 
                            className="h-2 bg-gray-100 rounded mb-2"
                            style={{
                              background: "linear-gradient(90deg, var(--sand-dark) 0%, var(--sand-light) 100%)",
                              width: `${pattern.score}%`
                            }}
                          ></div>
                          <p className="text-gray-600">{pattern.description}</p>
                          {index < analysis.placementPatterns.length - 1 && (
                            <Separator className="my-4" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>
              
              <section className="mb-6">
                <h2 className="text-2xl font-bold mb-4">治疗建议</h2>
                <Card>
                  <CardContent className="pt-6">
                    {analysis.detailedAnalysis ? (
                      <div className="prose prose-sm max-w-none">
                        <h3 className="text-lg font-medium mb-2">AI辅助治疗建议</h3>
                        <div className="text-gray-700">
                          {/* Extract the therapeutic recommendations from AI analysis */}
                          {analysis.detailedAnalysis.includes("治疗建议") ? 
                            analysis.detailedAnalysis.split("治疗建议").pop() : 
                            "请参考上方AI分析报告中的治疗建议部分。"}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="mb-4">
                          基于沙盘摆放分析，建议在后续治疗中关注以下方面：
                        </p>
                        <ul className="list-disc list-inside space-y-3">
                          <li>
                            {analysis.quadrantAnalysis.sort((a, b) => b.figureCount - a.figureCount)[0].name}
                            区域沙具密集，可进一步探索与
                            {analysis.quadrantAnalysis.sort((a, b) => b.figureCount - a.figureCount)[0].description}
                            相关的内容。
                          </li>
                          <li>
                            {analysis.categoryDistribution.sort((a, b) => b.count - a.count)[0].name}
                            类沙具使用频繁，表明来访者在相关情境中可能有特别的情感投入。
                          </li>
                          {analysis.placementPatterns[0].score > 70 && (
                            <li>
                              沙具摆放较为集中，可能表示内心聚焦于特定问题，建议在安全的治疗环境中逐步探索。
                            </li>
                          )}
                          {analysis.placementPatterns[0].score < 30 && (
                            <li>
                              沙具摆放较为分散，可能表示存在多种情绪或关注点，建议协助来访者逐一整合这些体验。
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>
              
              <div className="mt-10 text-center text-gray-500 text-sm print:mt-20">
                <p>本报告由沙盘治疗分析系统自动生成，仅供专业治疗师参考</p>
                {analysis.detailedAnalysis && (
                  <p className="mt-1">报告包含AI辅助分析内容，请专业人士进行解读</p>
                )}
                <p className="mt-1">© 2025 沙盘治疗分析系统 - 所有权利保留</p>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ReportPage;

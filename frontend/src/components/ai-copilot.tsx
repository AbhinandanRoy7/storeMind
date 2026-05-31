import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Bot, Send, Sparkles, TrendingDown, MapPin, Users, Clock } from "lucide-react";
import { useState } from "react";

const suggestedPrompts = [
  "Why is conversion down today?",
  "Which zone is underperforming?",
  "Show top customer journeys",
  "What anomalies occurred today?",
  "Summarize store performance",
];

const sampleResponse = {
  question: "Why is conversion down today?",
  analysis: [
    {
      title: "Data Retrieved",
      items: [
        "Conversion Rate: 24.8% (vs 28% yesterday)",
        "Queue Length: Peak of 18 at 6 PM",
        "Avg Wait Time: 12 minutes during peak",
        "Abandonment Rate: 18% (vs 8% yesterday)",
      ],
    },
    {
      title: "Root Cause Analysis",
      items: [
        "Primary: Extended queue times at billing counter (5-7 PM)",
        "Secondary: Staff shortage during peak hours",
        "Contributing: Single billing counter operational",
      ],
    },
  ],
  recommendation:
    "Open secondary billing counter during peak hours (5-7 PM). Deploy additional staff 30 minutes before expected surge. Implement express lane for customers with ≤3 items.",
  impact: "Expected conversion recovery: +3.2% | Revenue impact: +₹1.8L daily",
};

export function AICopilot() {
  const [showResponse, setShowResponse] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="p-6 shadow-sm lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Copilot</h3>
              <p className="text-sm text-muted-foreground">Ask anything about your store</p>
            </div>
          </div>
          <Badge variant="outline" className="border-purple-200 text-purple-700">
            <Sparkles className="h-3 w-3 mr-1" />
            Powered by Gemini
          </Badge>
        </div>

        {/* Chat Interface */}
        <div className="mb-4 max-h-[500px] space-y-4 overflow-y-auto rounded-lg border bg-gradient-to-br from-gray-50 to-gray-100 p-4">
          {!showResponse ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-indigo-100">
                  <Bot className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">AI Copilot Ready</p>
                <p className="text-xs text-muted-foreground">Ask a question or select a prompt below</p>
              </div>
            </div>
          ) : (
            <>
              {/* User Question */}
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 p-3 text-white shadow-sm">
                  <p className="text-sm">{sampleResponse.question}</p>
                </div>
              </div>

              {/* AI Response */}
              <div className="flex gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-600">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 space-y-3">
                  {sampleResponse.analysis.map((section, index) => (
                    <div key={index} className="rounded-lg border bg-white p-4 shadow-sm">
                      <p className="mb-2 text-xs font-semibold text-gray-900">{section.title}</p>
                      <ul className="space-y-1">
                        {section.items.map((item, i) => (
                          <li key={i} className="flex gap-2 text-sm text-gray-600">
                            <span className="text-purple-500">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  <div className="rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <p className="text-xs font-semibold text-purple-900">AI Recommendation</p>
                    </div>
                    <p className="mb-3 text-sm text-gray-700">{sampleResponse.recommendation}</p>
                    <div className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 p-3 text-white">
                      <p className="text-xs font-medium mb-1">Expected Impact</p>
                      <p className="text-sm font-semibold">{sampleResponse.impact}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs">
                      👍 Helpful
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      👎 Not Helpful
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs ml-auto">
                      Export Analysis
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Ask AI Copilot anything..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && message.trim()) {
                setShowResponse(true);
                setMessage("");
              }
            }}
            className="flex-1"
          />
          <Button
            size="icon"
            className="bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            onClick={() => {
              if (message.trim()) {
                setShowResponse(true);
                setMessage("");
              }
            }}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      <Card className="p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Suggested Prompts</h3>
          <p className="text-xs text-muted-foreground">Quick insights</p>
        </div>

        <div className="space-y-2 mb-6">
          {suggestedPrompts.map((prompt, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start text-left text-xs hover:bg-purple-50 hover:border-purple-300"
              onClick={() => setShowResponse(true)}
            >
              <Sparkles className="mr-2 h-3 w-3 text-purple-600" />
              {prompt}
            </Button>
          ))}
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border bg-gradient-to-br from-purple-50 to-indigo-50 p-3">
            <div className="mb-2 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-purple-600" />
              <p className="text-xs font-medium text-purple-900">Trending Issue</p>
            </div>
            <p className="text-sm text-gray-700">Conversion drop due to queue spikes</p>
          </div>

          <div className="rounded-lg border bg-white p-3">
            <div className="mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-600" />
              <p className="text-xs font-medium text-gray-900">Zone Alert</p>
            </div>
            <p className="text-sm text-gray-700">Maybelline underperforming</p>
          </div>

          <div className="rounded-lg border bg-white p-3">
            <div className="mb-2 flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              <p className="text-xs font-medium text-gray-900">Staff Insight</p>
            </div>
            <p className="text-sm text-gray-700">Rahul Verma top performer (97%)</p>
          </div>

          <div className="rounded-lg border bg-white p-3">
            <div className="mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-medium text-gray-900">Peak Hour</p>
            </div>
            <p className="text-sm text-gray-700">5-7 PM needs more staff</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

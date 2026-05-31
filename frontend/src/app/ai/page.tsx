"use client";

import { useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AICopilotPage() {
  const [query, setQuery] = useState("");
  const [responses, setResponses] = useState<{q: string; a: string}[]>([]);

  const handleSearch = async () => {
    if (!query) return;
    try {
      const res = await axios.post((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/api/v1/ai/chat", { query });
      setResponses([{ q: query, a: res.data.response }, ...responses]);
      setQuery("");
    } catch (e) {
      console.error(e);
      setResponses([{ q: query, a: "Error fetching response." }, ...responses]);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">AI Copilot</h2>
      <Card>
        <CardHeader>
          <CardTitle>Ask StoreMind AI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E.g., Why is conversion down today?"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch}>Ask</Button>
          </div>
          
          <div className="space-y-4 mt-6">
            {responses.map((r, i) => (
              <div key={i} className="p-4 bg-muted rounded-md space-y-2">
                <p className="font-semibold text-sm">Q: {r.q}</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{r.a}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HeatmapPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Store Heatmaps</h2>
      <Card>
        <CardHeader>
          <CardTitle>Zone Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Visual heatmap overlaid on store layout goes here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

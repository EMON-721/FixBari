import { Card, CardContent, CardHeader, CardTitle } from "@local-services/ui";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
          Settings
        </h1>
        <p className="text-slate-500 mt-1">
          Configure your account preferences
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">Your settings will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

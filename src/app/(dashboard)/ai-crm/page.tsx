import { KnowledgeBaseManager } from "@/components/ai/knowledge-base-manager";

export default function AICrmPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">AI CRM</h1>
        <p className="mt-1 text-sm text-slate-400">Configure the knowledge base used by reply suggestions, summaries, intent detection and lead scoring.</p>
      </div>
      <KnowledgeBaseManager />
    </div>
  );
}

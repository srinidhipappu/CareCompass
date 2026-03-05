import { Sparkles } from 'lucide-react';

interface AIExplanationProps {
  children: React.ReactNode;
}

export function AIExplanation({ children }: AIExplanationProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] rounded-xl flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">AI Analysis</h4>
          <div className="text-gray-700 leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}

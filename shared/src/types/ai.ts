export type FrameworkType = 'html' | 'css' | 'javascript' | 'react' | 'nextjs';

export interface FrameworkCodeSnippet {
  framework: FrameworkType;
  label: string;
  language: string;
  code: string;
  filename?: string;
}

export interface AIExplanation {
  issueId: string;
  ruleId: string;
  title: string;
  whatHappened: string;
  whyItMatters: string;
  howToFix: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  priorityRationale: string;
  estimatedEffort: '5 mins' | '15 mins' | '30 mins' | '1 hour';
  codeSnippets: FrameworkCodeSnippet[];
}

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateInsight(
  transactions: { type: string; amount: number; description: string; date: string; category: string }[],
  scope: string,
  scopeValue: string
): Promise<string> {
  const prompt = `You are a personal finance assistant.
Analyze these USD transactions for ${scope} (${scopeValue}) and provide:
1. Top 3 spending categories and amounts
2. Income vs expense summary with net balance
3. Any unusual spikes or patterns worth noting
4. 2–3 specific, actionable suggestions to improve savings

Be concise and friendly. Format your response with clear headings using markdown.

Transactions:
${JSON.stringify(transactions, null, 2)}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

import { ContainerInput, PackageInput, OptimizationSummary, PackedContainer } from '../types/packing';

export class AIService {
  /**
   * Generates human-readable AI analysis for the packing solution.
   */
  static async generateInsight(
    container: ContainerInput,
    packages: PackageInput[],
    summary: OptimizationSummary,
    containers: PackedContainer[]
  ): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim().length > 0) {
      const modelsToTry = ['gemini-flash-latest', 'gemini-2.0-flash-lite', 'gemini-2.0-flash'];

      const prompt = `You are PackAI's expert logistics optimization AI. Analyze this 3D container packing result and provide a concise 3-4 sentence professional explanation.

Container: ${container.name || 'Standard Container'} (${container.length}x${container.width}x${container.height} cm)
Packages Input: ${JSON.stringify(packages)}
Summary: ${summary.containersRequired} container(s) required, ${summary.averageUtilization}% avg utilization, ${summary.emptySpacePercentage}% empty space. Total packages packed: ${summary.packedPackages}/${summary.totalPackages}.

Explain:
1. Why the arrangement is efficient and how box rotations helped.
2. What primarily caused any remaining unused space.
3. A brief practical suggestion for space optimization.`;

      for (const model of modelsToTry) {
        try {
          console.log(`🤖 [Gemini AI] Sending request to Google Gemini API (model: ${model})...`);

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
              }),
            }
          );

          if (response.ok) {
            const data: any = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              console.log(`✨ [Gemini AI] Successfully received live response from Google Gemini (${model})!`);
              return `[Google Gemini AI Analysis]\n\n${text.trim()}`;
            }
          } else {
            const errorDetails = await response.text();
            console.warn(`⚠️ [Gemini AI] API call returned ${response.status} for ${model}:`, errorDetails);
          }
        } catch (err: any) {
          console.warn(`⚠️ [Gemini AI] Request failed for model ${model}:`, err.message);
        }
      }
    } else {
      console.log('ℹ️ [AI Service] No GEMINI_API_KEY found, using deterministic heuristic engine.');
    }

    // Deterministic Fallback AI Insight Generator
    return this.generateFallbackInsight(container, packages, summary, containers);
  }

  private static generateFallbackInsight(
    container: ContainerInput,
    packages: PackageInput[],
    summary: OptimizationSummary,
    containers: PackedContainer[]
  ): string {
    const mainPkg = packages[0]?.name || 'the primary box';
    const pkgNames = packages.map((p) => p.name).join(', ');

    let orientationNote = `Rotating ${mainPkg} allowed more units to align per layer along the container dimensions (${container.length}×${container.width} cm).`;

    let utilizationNote = `The arrangement achieved ${summary.averageUtilization}% volume utilization across ${summary.containersRequired} container(s).`;

    let gapNote = summary.emptySpacePercentage > 15
      ? `The remaining ${summary.emptySpacePercentage}% empty space is due to dimension mismatches between package sizes (${pkgNames}) and container bounds.`
      : `Unused space was minimized to just ${summary.emptySpacePercentage}%, leaving minimal gap between layer top and container height ceiling.`;

    let suggestion = packages.length > 1
      ? `Potential improvement: Standardizing package dimensions to multiples of container width (${container.width} cm) will eliminate corner gaps.`
      : `Potential improvement: Adjusting batch quantities to fit exact layer multiples will further improve space efficiency.`;

    return `[Heuristic AI Analysis]\n\n${utilizationNote} ${orientationNote} ${gapNote} ${suggestion}`;
  }
}

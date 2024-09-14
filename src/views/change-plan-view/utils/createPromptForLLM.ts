/**
 * Creates the prompt to send to the LLM for code updates.
 *
 * @param filePath The path to the file.
 * @param fileContent The content of the file.
 * @returns The prompt string.
 */
export function createPromptForLLM(
  filePath: string,
  fileContent: string
): string {
  return `
  Here's the code for the file: ${filePath}

  \`\`\`
  ${fileContent}
  \`\`\`

  Please suggest any necessary updates or modifications to the code based on the plan above and previous conversation:
  `;
}

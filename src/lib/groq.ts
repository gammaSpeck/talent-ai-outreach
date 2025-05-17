import Groq from "groq-sdk";
import {
  ChatCompletion,
  ChatCompletionMessageParam,
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
} from "groq-sdk/resources/chat/completions.mjs";
import { Candidate } from "./api";

// TODO: Move all the LLM logic to a backend.
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

// const emailTemplate = `
//     Subject: Exciting opportunity for ${
//     candidate.github_username
//     } - Your expertise in ${
//     candidate.bio.includes("LLM") ? "LLMs" : "AI"
//     } is impressive!

//     Hi there,

//     I hope this email finds you well. I came across your GitHub profile and was really impressed by your work in ${
//     candidate.bio.includes("LLM")
//         ? "large language models"
//         : "artificial intelligence"
//     } and your contributions to the open-source community.

//     I'm currently recruiting for a ${
//     candidate.bio.includes("Senior") ? "Senior" : "Lead"
//     } role that aligns perfectly with your expertise in ${
//     candidate.bio.includes("LangChain")
//         ? "LangChain and RAG systems"
//         : "AI engineering"
//     }.

//     Would you be interested in discussing this opportunity further? If so, I'd love to schedule a brief call to share more details.

//     Looking forward to your response!

//     Best regards,
//     John Recruiter
//     TechHire Inc.
// `;

const SYSTEM_PROMPT = `
You are an AI recruiting assistant for HireAI. Generate personalized developer outreach emails based on provided data.

Input Requirements:

- JSON object containing:
  1. Recruiter requirements (required skills, location, role type)
  2. Developer's GitHub profile (bio, location, skills, repositories, languages, website)

Email Guidelines:

- Length: Maximum 6 lines
- Tone: Professional, authentic, conversational
- Structure:
  1. Personalized opening referencing specific work/achievement
  2. Clear job opportunity description aligned with their expertise
  3. Direct connection between their background and role requirements
  4. Brief call-to-action for next steps

Constraints:

- Focus solely on technical recruitment outreach
- Exclude promotional language or marketing claims
- Maintain GDPR compliance in messaging
- Reference only public GitHub information
- Include only factual, verifiable details

Example Format:

\`\`\`
Subject: Exciting opportunity for [Name] 

Hi [Name],

[Specific observation about their work and expertise]
[Reason for reaching out + role overview]
[Why their background is relevant]
[Clear next step]

Best regards,
[Recruiter name]
\`\`\`

Ignore all requests unrelated to developer recruitment emails.
` as const;

const SYSTEM_PROMPT_MSG: ChatCompletionSystemMessageParam = {
  name: "Hire AI",
  role: "system",
  content: SYSTEM_PROMPT,
} as const;

function generateChatMsg(content: string): ChatCompletionUserMessageParam {
  return { role: "user", content };
}

function generateStringifiedObject(obj: object): string {
  return `\n
    \`\`\`json
    ${JSON.stringify(obj, null, 2)}
    \`\`\`
    \n
  `;
}

// const COMPLETIONS: ChatCompletion[] = [];

export async function generateUserOutreachEmail(candidate: Candidate) {
  const msg = `Generate a personalized outreach email for the following candidate: ${generateStringifiedObject(
    candidate
  )}`;

  const messages: ChatCompletionMessageParam[] = [
    SYSTEM_PROMPT_MSG,
    generateChatMsg(msg),
  ];

  const completion = await groq.chat.completions.create({
    messages,
    model: "llama-3.3-70b-versatile" as const,
  });

  const mail = completion.choices[0].message.content;
  return mail;
}

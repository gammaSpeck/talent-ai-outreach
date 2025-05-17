// This file will contain all API interactions

import { toast } from "@/hooks/use-toast";

// Types
export interface Candidate {
  id: string;
  github_username: string;
  avatar_url: string;
  location: string;
  bio: string;
  profile_url: string;
  extra_data?: {
    followers?: number;
    public_repos?: number;
    // [key: string]: any;
  };
  created_at: string;
}

export interface SearchListing {
  id: string;
  entered_query: string;
  parsed_query: {
    jobRole?: string;
    skills?: string[];
    location?: string;
    employmentType?: string;
    [key: string]: unknown;
  };
  candidates?: Candidate[];
  created_at: string;
}

export interface OutreachMessage {
  id: string;
  candidate_id: string;
  recruiter_id: string;
  message: string;
  created_at: string;
  sent?: boolean;
}

// Mock data for development
const mockSearches: SearchListing[] = [
  {
    id: "search-1",
    entered_query:
      "Find senior Gen-AI engineers with LangChain + RAG experience in Europe, open to contract work",
    parsed_query: {
      jobRole: "Senior Gen-AI Engineer",
      skills: ["LangChain", "RAG"],
      location: "Europe",
      employmentType: "Contract",
    },
    created_at: new Date().toISOString(),
    candidates: [],
  },
];

const mockCandidates: Candidate[] = [
  {
    id: "candidate-1",
    github_username: "aidev123",
    avatar_url: "https://avatars.githubusercontent.com/u/12345678",
    location: "Berlin, Germany",
    bio: "Senior AI engineer specializing in LLMs and RAG systems",
    profile_url: "https://github.com/aidev123",
    extra_data: {
      followers: 152,
      public_repos: 28,
      languages: ["Python", "TypeScript", "Rust"],
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "candidate-2",
    github_username: "languagechain",
    avatar_url: "https://avatars.githubusercontent.com/u/23456789",
    location: "Amsterdam, Netherlands",
    bio: "Building LangChain extensions and RAG systems for enterprise",
    profile_url: "https://github.com/languagechain",
    extra_data: {
      followers: 89,
      public_repos: 14,
      languages: ["Python", "JavaScript", "Go"],
    },
    created_at: new Date().toISOString(),
  },
];

// API Functions
export const createSearch = async (query: string): Promise<SearchListing> => {
  // This would call the Groq API to parse the query and then hit GitHub API
  // For now we'll just mock the response

  console.log("Creating search with query:", query);

  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newSearch = {
      id: `search-${Date.now()}`,
      entered_query: query,
      parsed_query: {
        jobRole: query.includes("senior") ? "Senior" : "Mid-level",
        skills: ["AI", "LLM"],
        location: query.includes("Europe") ? "Europe" : "Remote",
        employmentType: query.includes("contract") ? "Contract" : "Full-time",
      },
      created_at: new Date().toISOString(),
      candidates: mockCandidates,
    };

    mockSearches.unshift(newSearch);
    return newSearch;
  } catch (error) {
    console.error("Error creating search:", error);
    throw new Error("Failed to create search. Please try again.");
  }
};

export const getSearches = async (): Promise<SearchListing[]> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockSearches;
};

export const getSearch = async (
  id: string
): Promise<SearchListing | undefined> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockSearches.find((search) => search.id === id);
};

export const generateOutreachEmail = async (
  candidate: Candidate
): Promise<string> => {
  // This would call the Groq API to generate an email
  // For now we'll just mock the response

  await new Promise((resolve) => setTimeout(resolve, 1500));

  const emailTemplate = `
Subject: Exciting opportunity for ${
    candidate.github_username
  } - Your expertise in ${
    candidate.bio.includes("LLM") ? "LLMs" : "AI"
  } is impressive!

Hi there,

I hope this email finds you well. I came across your GitHub profile and was really impressed by your work in ${
    candidate.bio.includes("LLM")
      ? "large language models"
      : "artificial intelligence"
  } and your contributions to the open-source community.

I'm currently recruiting for a ${
    candidate.bio.includes("Senior") ? "Senior" : "Lead"
  } role that aligns perfectly with your expertise in ${
    candidate.bio.includes("LangChain")
      ? "LangChain and RAG systems"
      : "AI engineering"
  }.

Would you be interested in discussing this opportunity further? If so, I'd love to schedule a brief call to share more details.

Looking forward to your response!

Best regards,
John Recruiter
TechHire Inc.
`;

  return emailTemplate;
};

export const sendOutreachEmail = async (
  candidate: Candidate,
  emailContent: string
): Promise<boolean> => {
  // This would call the Resend API to send the email
  // For now we'll just mock the response

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Email Sent Successfully",
      description: `Your email to ${candidate.github_username} has been queued for delivery.`,
    });

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(
      "Failed to send email. Please connect Resend API to enable this feature."
    );
  }
};

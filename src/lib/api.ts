// This file will contain all API interactions

import { toast } from "@/hooks/use-toast";
import { octokit } from "./octokit";
import { generateUserOutreachEmail } from "./groq";

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

// Helper functions
const extractSkills = (query: string): string[] => {
  // Common tech skills to look for
  const commonSkills = [
    // AI/ML
    "LangChain",
    "RAG",
    "LLM",
    "GPT",
    "AI",
    "Machine Learning",
    "NLP",
    "TensorFlow",
    "PyTorch",
    "Hugging Face",
    "Transformers",
    "OpenAI",
    "Embeddings",
    "Vector Database",
    "Pinecone",
    "Weaviate",
    "Chroma",
    "Milvus",
    "GenAI",
    "Generative AI",
    "Deep Learning",
    "Neural Networks",
    "Computer Vision",
    "MLOps",
    "LlamaIndex",
    "LLama",
    "Mistral",
    "Claude",

    // Languages
    "Python",
    "TypeScript",
    "JavaScript",
    "Java",
    "Go",
    "Golang",
    "Rust",
    "C++",
    "C#",
    "PHP",
    "Ruby",
    "Swift",
    "Kotlin",
    "Scala",

    // Frontend
    "React",
    "Angular",
    "Vue",
    "Next.js",
    "Svelte",
    "HTML",
    "CSS",
    "Tailwind",
    "Bootstrap",
    "SCSS",
    "Redux",
    "MobX",
    "Webpack",
    "Vite",

    // Backend
    "Nodejs",
    "Express",
    "Django",
    "Flask",
    "FastAPI",
    "Spring Boot",
    "Laravel",
    "Nestjs",
    "GraphQL",
    "REST",
    "API",
    "gRPC",

    // Database
    "SQL",
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "Redis",
    "Elasticsearch",
    "Firebase",
    "DynamoDB",
    "Cassandra",
    "Oracle",
    "NoSQL",

    // DevOps/Cloud
    "AWS",
    "Azure",
    "GCP",
    "Docker",
    "Kubernetes",
    "CI/CD",
    "Jenkins",
    "GitHub Actions",
    "Terraform",
    "Ansible",
    "Prometheus",
    "Grafana",
  ];

  // Look for skills in the query
  const foundSkills = commonSkills.filter((skill) => {
    // Create a regex pattern that matches the skill as a whole word
    // \b represents word boundary, which matches positions where a word character is followed by a non-word character or vice versa
    const skillRegex = new RegExp(`\\b${escapeRegExp(skill)}`, "i");
    return skillRegex.test(query);
  });

  // If no skills found, return some default skills
  return foundSkills.length > 0 ? foundSkills : [];
};

const searchGitHubUsers = async (
  parsedQuery: SearchListing["parsed_query"]
): Promise<Candidate[]> => {
  try {
    console.debug("Parsed query:", parsedQuery);

    // Build GitHub search query
    let searchQuery = "";

    // Add location filter if specified
    if (parsedQuery.location && parsedQuery.location !== "Remote") {
      searchQuery += `location:${parsedQuery.location} `;
    }

    // Add skills to search query (helps find users who mention these in their profile)
    // Skills are not used in the search query to avoid overly restrictive searches
    // if (parsedQuery.skills && parsedQuery.skills.length > 0) {
    //   // Take top 3 skills to avoid overly restrictive searches
    //   const topSkills = parsedQuery.skills.slice(0, 3);
    //   searchQuery += topSkills.join("+") + " ";
    // }

    // Add job role for more targeted results
    if (parsedQuery.jobRole) {
      // Remove spaces for better search results
      const roleKeyword = parsedQuery.jobRole.replace(/\s+/g, "");
      searchQuery += roleKeyword + " ";
    }

    // Add designation/seniority for better targeting
    if (parsedQuery.designation) {
      searchQuery += parsedQuery.designation + " ";
    }

    // Ensure we have a valid search query
    if (searchQuery.trim() === "") {
      searchQuery = "developer"; // Default fallback
    }

    // Search for users
    const result = await octokit.search.users({
      q: searchQuery,
      sort: "followers", // Sort by followers for more relevant results
      per_page: 10,
    });

    // Map the GitHub users to our Candidate interface
    const candidates = await Promise.all(
      result.data.items.map(async (user) => {
        // Get additional user details
        const userDetails = await octokit.users.getByUsername({
          username: user.login,
        });

        // Create a candidate object
        return {
          id: `github-${user.id}`,
          github_username: user.login,
          avatar_url: user.avatar_url,
          location: userDetails.data.location || "Location not specified",
          bio: userDetails.data.bio || "No bio available",
          profile_url: user.html_url,
          extra_data: {
            followers: userDetails.data.followers,
            public_repos: userDetails.data.public_repos,
            languages: await fetchUserLanguages(user.login),
          },
          created_at: new Date().toISOString(),
        };
      })
    );

    return candidates;
  } catch (error) {
    console.error("Error searching GitHub users:", error);
    // Fallback to mock data if GitHub API fails
    return [];
  }
};

const fetchUserLanguages = async (username: string): Promise<string[]> => {
  try {
    // Get user's repositories
    const { data: repos } = await octokit.repos.listForUser({
      username,
      sort: "updated",
      per_page: 5, // Limit to 5 repos for performance
    });

    // Get languages for each repo
    const languageSets = await Promise.all(
      repos.map(async (repo) => {
        try {
          const { data: languages } = await octokit.repos.listLanguages({
            owner: username,
            repo: repo.name,
          });
          return Object.keys(languages);
        } catch (e) {
          return [];
        }
      })
    );

    // Flatten and deduplicate languages
    const allLanguages = Array.from(new Set(languageSets.flat()));

    return allLanguages;
  } catch (error) {
    console.error(`Error fetching languages for ${username}:`, error);
    return ["JavaScript", "Python"]; // Default fallback
  }
};

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
    languages?: string[];
  };
  created_at: string;
}

export interface SearchListing {
  id: string;
  entered_query: string;
  parsed_query: {
    jobRole?: string; // software engineer, fullstack developer, etc.
    designation?: string; // senior, junior, lead
    skills?: string[]; // langchain, javascript, python, etc.
    location?: string; // Bangalore, Mumbai, Delhi, etc.
    employmentType?: string; // Full-time, Contract, Part-time
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
const mockSearches: SearchListing[] = [];

const mockCandidates: Candidate[] = [];

/**
 * Parse a natural language query into structured search parameters
 */
const parseSearchQuery = (query: string): SearchListing["parsed_query"] => {
  const lowerQuery = query.toLowerCase();

  // Parse job role
  const jobRoles: string[] = []; // Default
  if (lowerQuery.includes("software")) jobRoles.push("Software");
  if (lowerQuery.includes("developer")) jobRoles.push("developer");
  if (lowerQuery.includes("fullstack")) jobRoles.push("Fullstack");
  if (lowerQuery.includes("frontend")) jobRoles.push("Frontend");
  if (lowerQuery.includes("backend")) jobRoles.push("Backend");
  if (lowerQuery.includes("devops")) jobRoles.push("DevOps");
  if (lowerQuery.includes("engineer")) jobRoles.push("Engineer");

  // Parse designation/seniority
  let designation = ""; // Default
  if (lowerQuery.includes("senior")) designation = "Senior";
  else if (lowerQuery.includes("lead")) designation = "Lead";
  else if (lowerQuery.includes("principal")) designation = "Principal";
  else if (lowerQuery.includes("junior")) designation = "Junior";

  // Parse location - Indian cities
  let location = ""; // Default
  if (lowerQuery.includes("bangalore")) location = "Bangalore";
  else if (lowerQuery.includes("bengaluru")) location = "Bangalore";
  else if (lowerQuery.includes("mumbai")) location = "Mumbai";
  else if (lowerQuery.includes("delhi")) location = "Delhi";
  else if (lowerQuery.includes("pune")) location = "Pune";
  else if (lowerQuery.includes("chennai")) location = "Chennai";
  else if (lowerQuery.includes("hyderabad")) location = "Hyderabad";
  else if (lowerQuery.includes("india")) location = "India";

  // Parse employment type
  let employmentType = "Full-time"; // Default
  if (lowerQuery.includes("contract")) employmentType = "Contract";
  else if (lowerQuery.includes("remote")) employmentType = "Remote";
  else if (lowerQuery.includes("part time") || lowerQuery.includes("part-time"))
    employmentType = "Part-time";
  else if (lowerQuery.includes("freelance")) employmentType = "Freelance";

  // Extract skills
  const skills = extractSkills(query);

  return {
    jobRole: jobRoles.join("+"),
    designation,
    skills,
    location,
    employmentType,
  };
};

// API Functions
export const createSearch = async (query: string): Promise<SearchListing> => {
  // Parse the query into components using simple pattern matching
  // In a real application, this would use a more sophisticated NLP/LLM approach

  try {
    // Parse the query using our structured parser
    const parsedQuery = parseSearchQuery(query);

    // Use GitHub API to find real candidates with matching skills
    let candidates: Candidate[] = [];
    try {
      candidates = await searchGitHubUsers(parsedQuery);
    } catch (searchError) {
      console.error("Error searching for candidates:", searchError);
      // Fallback to mock data
    }

    const newSearch = {
      id: `search-${Date.now()}`,
      entered_query: query,
      parsed_query: parsedQuery,
      created_at: new Date().toISOString(),
      candidates: candidates,
    };

    // Save to mock database
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

  const emailTemplate = generateUserOutreachEmail(candidate);

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

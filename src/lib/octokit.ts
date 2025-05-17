import { Octokit } from "@octokit/rest";

// Initialize the client with an optional auth token
// In a real app, you would use a server-side authentication approach
export const octokit = new Octokit({
  auth: import.meta.env.VITE_GITHUB_API_TOKEN, // Personal access token for authenticated requests
});

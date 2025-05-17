
# HireAI - Find Top Tech Talent with AI

HireAI is a recruiter-facing tool that allows authenticated recruiters to input natural-language job descriptions and receive candidate matches using the GitHub API. The tool supports storing listings, displaying results, and sending personalized outreach emails.

## Features

- **Authentication**: Secure login and registration for recruiters
- **Natural Language Search**: Enter plain English queries to find candidates
- **GitHub Integration**: Find matching developers using GitHub's API
- **AI-Powered Outreach**: Generate personalized outreach emails using GroqCloud LLM
- **Email Sending**: Send emails directly to candidates via Resend API
- **Dashboard**: View all search listings and candidate results

## Tech Stack

- **Frontend**: Vite + React + Tailwind CSS (Single Page App)
- **Backend & DB**: Supabase (Postgres, Auth, RLS enabled)
- **AI Provider**: GroqCloud (via OpenAI-compatible API, using Mixtral or Gemma-7B)
- **Candidate Source**: GitHub Search API
- **Email Sending**: Resend API

## Getting Started

### Prerequisites

- Node.js and npm installed
- A Supabase account and project
- GroqCloud API account
- GitHub Personal Access Token
- Resend API account

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/hire-ai.git
   cd hire-ai
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file based on the `.env.example` file and add your API keys:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GITHUB_API_TOKEN=your_github_personal_access_token
   VITE_GROQ_API_KEY=your_groq_api_key
   VITE_RESEND_API_KEY=your_resend_api_key
   VITE_SENDER_EMAIL=your_verified_sender_email@example.com
   ```

4. Set up your Supabase database using the provided `schema.sql` file:
   - Go to your Supabase project
   - Navigate to the SQL Editor
   - Paste the contents of `schema.sql` and run the script

5. Start the development server
   ```bash
   npm run dev
   ```

## Usage

1. **Register/Login** to access the dashboard
2. **Create a New Search** by entering a natural language job description
3. **View Candidates** that match your search criteria
4. **Generate Outreach Emails** personalized for each candidate
5. **Send Emails** directly to candidates

### Example Search Query

> "Find senior Gen-AI engineers with LangChain + RAG experience in Europe, open to contract work"

## Database Schema

The application uses the following tables in Supabase:

- `recruiters`: Extends auth.users with additional recruiter metadata
- `search_listings`: Stores recruiter queries and parsed filters
- `candidates`: Stores GitHub candidate data linked to search listings
- `outreach_messages`: Stores outreach emails sent to candidates

## Security

The application implements Row-Level Security (RLS) in Supabase to ensure:

- Recruiters can only view their own search listings
- Recruiters can only view candidates from their own searches
- Recruiters can only view and manage their own outreach messages

## Future Enhancements

- Candidate response tracking
- Enhanced filtering and sorting options
- Email template management
- Integration with ATS systems
- Candidate recommendation engine

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# HireAI MVP — GitHub-Powered Candidate Sourcing

## 🎯 Objective

Build a lightweight MVP that allows recruiters to:

- Input a natural language job description (e.g., _"Find senior Gen-AI engineers with LangChain + RAG experience in Europe, open to contract work"_)
- Parse that into structured search filters
- Query the GitHub Search Users API using these filters
- Display top candidate matches
- Optionally generate and edit personalized outreach messages

## 🚀 Tech Stack

- **Backend**: Node.js / Python / (your preference)
- **Frontend**: Lightweight web UI (e.g., HTML + JS or React)
- **Data Source**: [GitHub Search Users API](https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28#search-users)
- **LLM (Optional)**: For parsing recruiter query and generating outreach (e.g., OpenAI, or any local model)
- **Deployment**: Local or free-tier cloud (e.g., Vercel, Render, Replit)

## 🔍 GitHub API Usage

- **Endpoint**: `GET https://api.github.com/search/users?q=QUERY`
- **Query Construction**:

  ```
  location:Europe+senior+Gen-AI+LangChain+RAG
  ```

- **Limitations**:

  - Location is free-text and non-standardized
  - Skills/keywords must be inferred from bios/usernames
  - Rate-limited to 10 unauthenticated requests/minute (consider using a PAT)

## 🧠 MVP Flow

1. **Input**: Recruiter types a plain-English job requirement
2. **LLM Processing** (optional for MVP):

   - Parse input into structured fields:

     - `jobRole`: "senior Gen-AI engineers"
     - `skills`: "LangChain", "RAG"
     - `location`: "Europe"
     - `employmentType`: "contract"

3. **GitHub Query**:

   - Construct query string for GitHub Users API
   - Fetch and rank top 50 matching profiles

4. **Display Results**:

   - Show avatars, usernames, bios, location
   - Allow filtering by skill or location

5. **Outreach**:

   - Auto-generate personalized email message
   - Allow recruiter to edit and send (mock send or integrate with email API)

## 📦 Nice-to-Have (Post-MVP)

- Save search listings and responses to DB
- Resume parsing from uploaded resumes
- More advanced candidate scoring
- Integrate with email services (e.g., Gmail, Mailgun)
- Support multiple platforms beyond GitHub

## ⏱ Time Budget

Target build time: **4 hours**

- GitHub API integration: 1 hour
- Basic UI & input parsing: 1 hour
- Candidate display: 1 hour
- Outreach generation + polish: 1 hour

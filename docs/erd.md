### ✅ Entity Relationships

```mermaid
erDiagram

    %% Auth & Identity
    RECRUITER {
        uuid id PK
        string name
        string email
        string company
        timestamp created_at
    }

    %% Query entered by recruiter
    SEARCH_LISTING {
        uuid id PK
        uuid recruiter_id FK
        text entered_query
        json parsed_query
        timestamp created_at
    }

    %% Candidate from GitHub API
    CANDIDATE {
        uuid id PK
        uuid search_listing_id FK
        string github_username
        string avatar_url
        string location
        string bio
        string profile_url
        json extra_data
        timestamp created_at
    }

    %% Outreach message per candidate
    OUTREACH_MESSAGE {
        uuid id PK
        uuid candidate_id FK
        uuid recruiter_id FK
        text message
        timestamp created_at
    }

    %% Relationships
    RECRUITER ||--o{ SEARCH_LISTING : has
    SEARCH_LISTING ||--o{ CANDIDATE : yields
    CANDIDATE ||--o{ OUTREACH_MESSAGE : generates
    RECRUITER ||--o{ OUTREACH_MESSAGE : sends
```

---

### 🛡️ Row-Level Security (RLS)

- **Recruiters can only access:**

  - Their own `SEARCH_LISTING` entries (`recruiter_id = auth.uid()`)
  - `CANDIDATE` entries linked to their listings
  - `OUTREACH_MESSAGE` entries linked to them

---

### 📝 Notes

- `parsed_query` in `SEARCH_LISTING` can store structured filters (skills, location, etc.)
- `extra_data` in `CANDIDATE` can store raw JSON from the GitHub API (followers, repos, etc.)
- You can choose to store or generate outreach messages on the fly (but it’s good to cache/save if possible for tracking or re-sending)

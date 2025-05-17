## Github Search Users

Docs: https://docs.github.com/en/rest/using-the-rest-api/getting-started-with-the-rest-api?apiVersion=2022-11-28

```bash
curl -L \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_PAT" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "https://api.github.com/search/users?q=location:india+gen+ai+engineer&type=users"
```

---

Docs: https://docs.github.com/en/rest/users/users?apiVersion=2022-11-28#get-a-user

curl -L \
 -H "Accept: application/vnd.github+json" \
 -H "Authorization: Bearer $GITHUB_PAT" \
 -H "X-GitHub-Api-Version: 2022-11-28" \
 https://api.github.com/users/gammaSpeck

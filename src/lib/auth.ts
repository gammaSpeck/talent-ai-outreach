
// This is a placeholder until Supabase integration is complete
// It will be replaced with actual Supabase authentication

// Mock user for development
const mockUser = {
  id: "mock-user-id",
  name: "John Recruiter",
  email: "john@example.com",
  company: "TechHire Inc.",
};

export const getUser = () => {
  return mockUser;
};

export const login = (email: string, password: string) => {
  console.log("Login attempted with:", email, password);
  return Promise.resolve(mockUser);
};

export const register = (email: string, password: string, name: string, company: string) => {
  console.log("Registration attempted with:", email, password, name, company);
  return Promise.resolve({ ...mockUser, name, email, company });
};

export const logout = () => {
  console.log("Logout attempted");
  return Promise.resolve();
};

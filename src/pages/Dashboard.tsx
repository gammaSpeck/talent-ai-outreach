
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getUser } from "@/lib/auth";
import { getSearches, createSearch, SearchListing } from "@/lib/api";
import SearchListingCard from "@/components/SearchListingCard";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [searches, setSearches] = useState<SearchListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchSearches = async () => {
      try {
        const data = await getSearches();
        setSearches(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load search listings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSearches();
  }, [navigate, toast, user]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }
    
    setIsSearching(true);
    
    try {
      const newSearch = await createSearch(searchQuery);
      setSearches([newSearch, ...searches]);
      setSearchQuery("");
      navigate(`/search/${newSearch.id}`);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Error",
        description: "Failed to create search",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">HireAI</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user.name}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                toast({
                  title: "Logging out...",
                  description: "Please connect Supabase to enable authentication."
                });
              }}
            >
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Find Top Tech Talent</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Use natural language to describe the role you're looking to fill,
            and we'll find the perfect candidates from GitHub's developer community.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold mb-4">Create a New Search</h3>
          <p className="text-sm text-gray-600 mb-4">
            Example: "Find senior Gen-AI engineers with LangChain + RAG experience in Europe, open to contract work"
          </p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Describe the role you're looking to fill..."
              className="flex-1"
              disabled={isSearching}
            />
            <Button type="submit" disabled={isSearching}>
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Recent Searches</h3>
          
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading searches...</p>
            </div>
          ) : searches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searches.map((search) => (
                <SearchListingCard key={search.id} search={search} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>You haven't created any searches yet.</p>
              <p>Use the search bar above to find candidates.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

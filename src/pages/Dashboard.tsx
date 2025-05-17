import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createSearch, getSearches, SearchListing } from "@/lib/api";
import SearchListingCard from "@/components/SearchListingCard";
import { useAuthContext } from "@/context/AuthContext";
import Header from "@/components/Header";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, loading } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [searches, setSearches] = useState<SearchListing[]>([]);
  const [loadingSearches, setLoadingSearches] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [pendingSearchQuery, setPendingSearchQuery] = useState<string | null>(
    null
  );

  const fetchSearches = useCallback(async () => {
    try {
      const data = await getSearches();
      setSearches(data);
    } catch (error) {
      console.error("Error fetching searches:", error);
      toast({
        title: "Error",
        description: "Failed to load search listings",
        variant: "destructive",
      });
    } finally {
      setLoadingSearches(false);
    }
  }, [toast]);

  // Load searches when component mounts if user is authenticated
  useEffect(() => {
    if (!loading && user) {
      fetchSearches();
    } else if (!loading && !user) {
      setLoadingSearches(false);
    }
  }, [loading, user, fetchSearches]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search query:", searchQuery);

    if (!searchQuery.trim())
      return toast({
        title: "Error",
        description: "Please enter a search query",
        variant: "destructive",
      });

    // Check if user is authenticated
    if (!user) {
      // setPendingSearchQuery(searchQuery); // TODO: Implement later
      return toast({
        title: "Info",
        description: "Please login to perform a search",
        variant: "default",
      });
    }

    await executeSearch(searchQuery);
  };

  const executeSearch = async (query: string) => {
    setIsSearching(true);

    try {
      const newSearch = await createSearch(query);

      console.log("New search created:", newSearch);
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
      setPendingSearchQuery(null);
    }
  };

  const handleAuthSuccess = () => {
    if (pendingSearchQuery) executeSearch(pendingSearchQuery);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAuthSuccess={handleAuthSuccess} />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Find Top Tech Talent</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Use natural language to describe the role you're looking to fill,
            and we'll find the perfect candidates from GitHub's developer
            community.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold mb-4">Create a New Search</h3>
          <p className="text-sm text-gray-600 mb-4">
            Example: "Senior Gen-AI engineers with Bangalore + RAG experience in
            Bangalore, open to contract work"
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

          {loading || loadingSearches ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading searches...</p>
            </div>
          ) : !user ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Please log in to view your searches.
              </p>
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

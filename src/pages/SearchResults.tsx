import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  getSearch,
  Candidate,
  generateOutreachEmail,
  sendOutreachEmail,
  SearchListing,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/context/AuthContext";
import Header from "@/components/Header";
import AuthModal from "@/components/AuthModal";

const SearchResults = () => {
  const { id } = useParams<{ id: string }>();
  const [search, setSearch] = useState<SearchListing | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [emailContent, setEmailContent] = useState<string>("");
  const [isGeneratingEmail, setIsGeneratingEmail] = useState<boolean>(false);
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, loading: authLoading } = useAuthContext();

  useEffect(() => {
    // Wait for auth to load before checking
    if (authLoading) return;

    // If not authenticated, show auth modal
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // User is authenticated, fetch search
    const fetchSearch = async () => {
      try {
        if (!id) return;
        const data = await getSearch(id);
        if (data) {
          setSearch(data);
        } else {
          toast({
            title: "Error",
            description: "Search not found",
            variant: "destructive",
          });
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching search:", error);
        toast({
          title: "Error",
          description: "Failed to load search results",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSearch();
  }, [id, navigate, toast, user, authLoading]);

  const handleGenerateEmail = async (candidate: Candidate) => {
    if (!candidate.email) return;
    setSelectedCandidate(candidate);
    setIsGeneratingEmail(true);

    try {
      const email = await generateOutreachEmail(candidate);
      setEmailContent(email);
    } catch (error) {
      console.error("Error generating email:", error);
      toast({
        title: "Error",
        description: "Failed to generate email. Please connect Groq API.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedCandidate) return;

    setIsSendingEmail(true);

    try {
      await sendOutreachEmail(
        selectedCandidate,
        emailContent,
        user?.email || ""
      );
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: "Failed to send email. Please connect Resend API.",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleAuthSuccess = () => {
    // Refresh the page after successful auth
    setLoading(true);
    window.location.reload();
  };

  if (authLoading || (loading && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Loading search results...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-4">
              Please log in to view search results
            </p>
            <Button onClick={() => setShowAuthModal(true)}>
              Login / Register
            </Button>
          </div>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => navigate("/")}
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  if (!search && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Search not found</p>
          <Button onClick={() => navigate("/")}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showBackButton={true} onAuthSuccess={handleAuthSuccess} />

      <main className="container mx-auto px-4 py-6">
        {search && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Search Results</h2>
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-500">
                    Original Query:
                  </span>
                  <p className="text-gray-700">{search.entered_query}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Parsed as:
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {search.parsed_query.jobRole && (
                      <Badge variant="outline">
                        {search.parsed_query.jobRole}
                      </Badge>
                    )}
                    {search.parsed_query.skills?.map(
                      (skill: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      )
                    )}
                    {search.parsed_query.location && (
                      <Badge variant="outline">
                        {search.parsed_query.location}
                      </Badge>
                    )}
                    {search.parsed_query.employmentType && (
                      <Badge variant="outline">
                        {search.parsed_query.employmentType}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-4">
              Matching Candidates ({search.candidates?.length || 0})
            </h3>

            {search.candidates?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {search.candidates.map((candidate: Candidate) => (
                  <Card key={candidate.id} className="overflow-hidden">
                    <CardHeader className="pb-0">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={candidate.avatar_url}
                            alt={candidate.github_username}
                          />
                          <AvatarFallback>
                            {candidate.github_username
                              .substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {candidate.github_username}
                          </CardTitle>
                          <p className="text-sm text-gray-500">
                            {candidate.location}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-sm line-clamp-3 mb-3">
                        {candidate.bio || "No bio available"}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {candidate.extra_data?.languages?.map(
                          (lang: string, index: number) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {lang}
                            </Badge>
                          )
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                        <div>
                          <span className="font-medium">
                            {candidate.extra_data?.followers || 0}
                          </span>{" "}
                          followers
                        </div>
                        <div>
                          <span className="font-medium">
                            {candidate.extra_data?.public_repos || 0}
                          </span>{" "}
                          repos
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-0">
                      <a
                        href={candidate.profile_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        View GitHub Profile
                      </a>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => handleGenerateEmail(candidate)}
                          >
                            Outreach
                          </Button>
                        </DialogTrigger>

                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Outreach Email</DialogTitle>
                            <DialogDescription>
                              Contact {candidate.github_username} with a
                              personalized message
                            </DialogDescription>
                          </DialogHeader>
                          {isGeneratingEmail ? (
                            <div className="py-8 text-center">
                              <p className="text-gray-500">
                                Generating personalized email...
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <textarea
                                value={emailContent}
                                onChange={(e) =>
                                  setEmailContent(e.target.value)
                                }
                                className="w-full min-h-[300px] border border-gray-300 rounded-md p-4 font-mono text-sm"
                              />
                            </div>
                          )}
                          <DialogFooter>
                            <Button
                              onClick={handleSendEmail}
                              disabled={
                                isGeneratingEmail ||
                                isSendingEmail ||
                                !emailContent
                              }
                            >
                              {isSendingEmail ? "Sending..." : "Send Email"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500 mb-4">
                  No candidates found for this search.
                </p>
                <Button onClick={() => navigate("/")}>Create New Search</Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default SearchResults;

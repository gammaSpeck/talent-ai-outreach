
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SearchListing } from "@/lib/api";

interface SearchListingCardProps {
  search: SearchListing;
}

const SearchListingCard = ({ search }: SearchListingCardProps) => {
  const navigate = useNavigate();
  
  // Format date to be more readable
  const formattedDate = new Date(search.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {search.parsed_query.jobRole || "Job Search"}
        </CardTitle>
        <p className="text-sm text-gray-500">{formattedDate}</p>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-3 line-clamp-2">{search.entered_query}</p>
        <div className="flex flex-wrap gap-1">
          {search.parsed_query.skills?.map((skill, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {search.parsed_query.location && (
            <Badge variant="outline" className="text-xs">
              {search.parsed_query.location}
            </Badge>
          )}
          {search.parsed_query.employmentType && (
            <Badge variant="outline" className="text-xs">
              {search.parsed_query.employmentType}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => navigate(`/search/${search.id}`)}
        >
          View {search.candidates?.length || 0} Candidates
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SearchListingCard;

import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/context/AuthContext";
import UserMenu from "@/components/UserMenu";
import AuthModal from "@/components/AuthModal";

interface HeaderProps {
  showBackButton?: boolean;
  onAuthSuccess?: () => void;
}

const Header = ({ showBackButton = false, onAuthSuccess }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuthContext();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAuthSuccess = () => {
    if (onAuthSuccess) onAuthSuccess();
  };

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <NavLink to="/" className="flex items-center">
          <h1 className="text-2xl font-bold text-primary">HireAI</h1>
        </NavLink>
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              Back to Dashboard
            </Button>
          )}

          {user ? (
            <>
              {profile && (
                <span className="text-sm text-gray-600 hidden sm:inline">
                  Welcome, {profile.name}
                </span>
              )}
              <UserMenu />
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAuthModal(true)}
            >
              Login / Register
            </Button>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </header>
  );
};

export default Header;

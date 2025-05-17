
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// This component serves as an entry point redirecting to the Dashboard
const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate("/");
  }, [navigate]);

  return null;
};

export default Index;

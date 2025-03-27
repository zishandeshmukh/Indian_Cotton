import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [username, setUsername] = useState<string | null>(null);
  
  // Auth status query
  const { 
    data: authData,
    isLoading,
    refetch: refetchAuth
  } = useQuery({
    queryKey: ['/api/auth/status'],
    retry: 1,
  });
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: { username: string, password: string }) =>
      apiRequest('POST', '/api/auth/login', credentials),
    onSuccess: async (res) => {
      const data = await res.json();
      setUsername(data.username);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/status'] });
      
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    }
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/auth/logout'),
    onSuccess: () => {
      setUsername(null);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/status'] });
      
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  });
  
  // Set username from auth data
  useEffect(() => {
    if (authData?.isAuthenticated && authData?.username) {
      setUsername(authData.username);
    }
  }, [authData]);
  
  // Login function
  const login = async (username: string, password: string) => {
    try {
      await loginMutation.mutateAsync({ username, password });
      return true;
    } catch (error) {
      return false;
    }
  };
  
  // Logout function
  const logout = () => {
    logoutMutation.mutate();
  };
  
  const value = {
    isAuthenticated: !!authData?.isAuthenticated,
    isLoading,
    username,
    login,
    logout
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

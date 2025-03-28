import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: UserRegisterData) => Promise<boolean>;
  logout: () => void;
}

interface UserRegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [username, setUsername] = useState<string | null>(null);
  
  // Auth status query
  interface AuthStatusResponse {
    isAuthenticated: boolean;
    isAdmin: boolean;
    username: string | null;
  }
  
  const { 
    data: authData,
    isLoading,
    refetch: refetchAuth
  } = useQuery<AuthStatusResponse>({
    queryKey: ['/api/auth/status'],
    retry: 1,
    initialData: { isAuthenticated: false, isAdmin: false, username: null }
  });
  
  // Login mutation
  interface LoginResponse {
    username: string;
    isAdmin: boolean;
  }
  
  const loginMutation = useMutation<Response, Error, { username: string, password: string }>({
    mutationFn: (credentials) => apiRequest('POST', '/api/auth/login', credentials),
    onSuccess: async (res) => {
      const data = await res.json() as LoginResponse;
      setUsername(data.username);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/status'] });
      
      toast({
        title: "Success",
        description: data.isAdmin ? "Logged in as Admin" : "Logged in successfully",
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
  
  // Register mutation
  const registerMutation = useMutation<Response, Error, UserRegisterData>({
    mutationFn: (userData) => apiRequest('POST', '/api/users/register', userData),
    onSuccess: async (res) => {
      const data = await res.json() as LoginResponse;
      setUsername(data.username);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/status'] });
      
      toast({
        title: "Success",
        description: "Registration successful",
      });
    },
    onError: (error: Error) => {
      const errorMsg = error.message || "Could not create account";
      console.error("Registration error:", errorMsg);
      toast({
        title: "Registration Failed",
        description: errorMsg,
        variant: "destructive",
      });
      throw error; // Re-throw to let the caller handle it
    }
  });

  // Logout mutation
  const logoutMutation = useMutation<Response, Error, void>({
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
  
  // Register function
  const register = async (userData: UserRegisterData) => {
    try {
      await registerMutation.mutateAsync(userData);
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
    isAdmin: !!authData?.isAdmin,
    isLoading,
    username,
    login,
    register,
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

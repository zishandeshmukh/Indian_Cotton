import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Form validation schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { login, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Create form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Handle form submission
  const onSubmit = async (data: LoginFormValues) => {
    setLoginError(null);
    
    try {
      const success = await login(data.username, data.password);
      
      if (success) {
        toast({
          title: "Login Successful",
          description: "Welcome to the admin panel",
        });
        navigate("/admin");
      } else {
        setLoginError("Invalid username or password");
      }
    } catch (error) {
      setLoginError("An error occurred during login. Please try again.");
    }
  };
  
  // Note for demo purposes
  const loginNote = () => {
    // This is for demonstration purposes only
    form.setValue("username", "admin");
    form.setValue("password", "admin123");
    
    toast({
      title: "Demo Credentials",
      description: "Username: admin, Password: admin123",
    });
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="font-serif text-4xl font-bold text-primary mb-2">Fabric Haven</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Login</h2>
          <p className="text-gray-600">
            Login to access the admin dashboard
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter your password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {loginError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
                    {loginError}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-gray-500">
              Don't have an account? Contact your administrator.
            </div>
            
            <Button 
              variant="link" 
              className="text-xs text-gray-500" 
              onClick={loginNote}
            >
              Demo Login Details
            </Button>
            
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/")}
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back to Store
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

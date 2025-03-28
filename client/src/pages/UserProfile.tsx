import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Bell, Package, Truck, User, ShoppingBag, Edit } from "lucide-react";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";

// Define form validation schema
const profileFormSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().default("India"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Define user profile type
interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  profilePicture: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

// Define notification type
interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedEntityId: number | null;
  createdAt: string;
}

// Define order type
interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  status: string;
  paymentMethod: string | null;
  paymentStatus: string;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingZipCode: string | null;
  shippingCountry: string | null;
  trackingNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, username } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to view your profile",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [isAuthenticated, navigate, toast]);

  // Setup form with default values
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India",
    },
  });

  // Fetch user profile data
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      const fetchUserProfile = async () => {
        try {
          const response = await apiRequest("GET", "/api/users/me");
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
            
            // Set form default values
            form.reset({
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              email: data.email || "",
              phone: data.phone || "",
              address: data.address || "",
              city: data.city || "",
              state: data.state || "",
              zipCode: data.zipCode || "",
              country: data.country || "India",
            });
          } else {
            // If we couldn't get the user data, we can fallback to a minimal profile
            // with just the username from auth context
            setUserData({
              id: 0, // We don't know the ID, but it's required by the type
              username: username || "User",
              email: "",
              firstName: null,
              lastName: null,
              phone: null,
              address: null,
              city: null,
              state: null,
              zipCode: null,
              country: "India",
              profilePicture: null,
              isEmailVerified: false,
              isPhoneVerified: false
            });
            
            form.reset({
              firstName: "",
              lastName: "",
              email: "",
              phone: "",
              address: "",
              city: "",
              state: "",
              zipCode: "",
              country: "India",
            });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          toast({
            title: "Error",
            description: "Failed to load user profile",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchUserProfile();
    }
  }, [isAuthenticated, username, form, toast]);

  // Fetch notifications
  useEffect(() => {
    if (activeTab === "notifications") {
      const fetchNotifications = async () => {
        try {
          const response = await apiRequest("GET", "/api/notifications");
          const data = await response.json();
          setNotifications(data);
        } catch (error) {
          console.error("Error fetching notifications:", error);
          toast({
            title: "Error",
            description: "Failed to load notifications",
            variant: "destructive",
          });
        }
      };

      fetchNotifications();
    }
  }, [activeTab, toast]);

  // Fetch orders
  useEffect(() => {
    if (activeTab === "orders") {
      const fetchOrders = async () => {
        try {
          const response = await apiRequest("GET", "/api/orders");
          const data = await response.json();
          setOrders(data);
        } catch (error) {
          console.error("Error fetching orders:", error);
          toast({
            title: "Error",
            description: "Failed to load orders",
            variant: "destructive",
          });
        }
      };

      fetchOrders();
    }
  }, [activeTab, toast]);

  // Handle profile update submission
  const onSubmit = async (values: ProfileFormValues) => {
    try {
      const response = await apiRequest("PUT", "/api/profile", values);
      const data = await response.json();
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      setUserData(data);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  // Handle profile picture upload
  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append("profilePicture", file);

    setIsUploading(true);
    try {
      const response = await fetch("/api/profile/picture", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload profile picture");
      }
      
      const data = await response.json();
      setUserData(data);
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (id: number) => {
    try {
      await apiRequest("PUT", `/api/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      await apiRequest("PUT", "/api/notifications/read-all");
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    }
  };

  // Delete notification
  const deleteNotification = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  // Get badge color based on order status
  const getOrderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "processing":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Processing</Badge>;
      case "shipped":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Shipped</Badge>;
      case "delivered":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Delivered</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format price (from cents to rupees)
  const formatPrice = (price: number) => {
    return `₹${(price / 100).toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-12 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Skeleton className="h-10 md:col-span-1" />
            <div className="md:col-span-3">
              <Skeleton className="h-64 w-full mb-4" />
              <Skeleton className="h-10 w-32 mt-2" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">My Account</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              orientation="vertical"
              className="w-full"
            >
              <TabsList className="flex flex-col h-auto bg-muted/50 p-0 w-full">
                <TabsTrigger
                  value="profile"
                  className="w-full justify-start px-6 py-3 data-[state=active]:bg-primary/10 gap-2"
                >
                  <User size={16} />
                  Profile
                </TabsTrigger>
                <TabsTrigger
                  value="orders"
                  className="w-full justify-start px-6 py-3 data-[state=active]:bg-primary/10 gap-2"
                >
                  <ShoppingBag size={16} />
                  Orders
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="w-full justify-start px-6 py-3 data-[state=active]:bg-primary/10 gap-2"
                >
                  <Bell size={16} />
                  Notifications
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <Badge variant="default" className="ml-2">
                      {notifications.filter(n => !n.isRead).length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="profile" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Profile Information</CardTitle>
                    <CardDescription>
                      Update your account details and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-8 mb-8">
                      <div className="flex flex-col items-center gap-4">
                        <Avatar className="h-32 w-32">
                          {userData?.profilePicture ? (
                            <AvatarImage
                              src={userData.profilePicture}
                              alt={userData.username}
                            />
                          ) : (
                            <AvatarFallback className="text-4xl bg-primary/20">
                              {userData?.firstName?.charAt(0) || userData?.username?.charAt(0) || "U"}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex flex-col items-center gap-2">
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              id="profile-picture"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={handleProfilePictureUpload}
                              disabled={isUploading}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-2"
                              disabled={isUploading}
                            >
                              <Edit size={14} />
                              {isUploading ? "Uploading..." : "Change Image"}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xl font-medium mb-1">{userData?.username}</h3>
                        <div className="flex gap-2 mb-4">
                          <Badge
                            variant="outline"
                            className={userData?.isEmailVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                          >
                            {userData?.isEmailVerified ? "Email Verified" : "Email Not Verified"}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={userData?.isPhoneVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                          >
                            {userData?.isPhoneVerified ? "Phone Verified" : "Phone Not Verified"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                          Update your information below. Your email and username cannot be changed.
                        </p>
                      </div>
                    </div>

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="First Name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Last Name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Email" 
                                    {...field} 
                                    disabled 
                                    className="bg-muted/50" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input placeholder="Phone Number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input placeholder="Address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input placeholder="City" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                  <Input placeholder="State" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="zipCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Zip Code</FormLabel>
                                <FormControl>
                                  <Input placeholder="Zip Code" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Country" 
                                  defaultValue="India"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" className="w-full md:w-auto">
                          Update Profile
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="orders" className="mt-0">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-2xl">My Orders</CardTitle>
                        <CardDescription>
                          View and track your orders
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {orders.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-lg font-medium">No orders yet</p>
                        <p className="text-muted-foreground mt-2">
                          You haven't placed any orders yet.
                        </p>
                        <Button className="mt-4" variant="outline" onClick={() => window.location.href = "/"}>
                          Start shopping
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <Card key={order.id} className="relative overflow-hidden">
                            <div className="absolute right-0 top-0 h-16 w-16">
                              <div
                                className={`absolute transform rotate-45 bg-primary text-white font-semibold py-1 right-[-35px] top-[32px] w-[170px] text-center text-xs`}
                              >
                                {order.status.toUpperCase()}
                              </div>
                            </div>
                            <CardContent className="p-6">
                              <div className="flex flex-col md:flex-row justify-between">
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-medium text-lg">Order #{order.id}</h3>
                                    {getOrderStatusBadge(order.status)}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {formatDate(order.createdAt)}
                                  </p>
                                  <div className="flex items-center gap-2 mb-2">
                                    <p className="font-medium">Total:</p>
                                    <p>{formatPrice(order.totalAmount)}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm">Payment method:</p>
                                    <p className="text-sm font-medium">
                                      {order.paymentMethod || "Online"}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="mt-4 md:mt-0">
                                  <div className="flex flex-col gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="flex items-center justify-center gap-2"
                                      onClick={() => window.location.href = `/orders/${order.id}`}
                                    >
                                      <Package size={14} />
                                      View Details
                                    </Button>
                                    
                                    {order.status === "shipped" && order.trackingNumber && (
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="flex items-center justify-center gap-2"
                                      >
                                        <Truck size={14} />
                                        Track Order
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications" className="mt-0">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-2xl">My Notifications</CardTitle>
                        <CardDescription>
                          Stay updated with your orders and account
                        </CardDescription>
                      </div>
                      {notifications.length > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={markAllNotificationsAsRead}
                          disabled={notifications.every(n => n.isRead)}
                        >
                          Mark all as read
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {notifications.length === 0 ? (
                      <div className="text-center py-8">
                        <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-lg font-medium">No notifications</p>
                        <p className="text-muted-foreground mt-2">
                          You don't have any notifications yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {notifications.map((notification) => (
                          <Card 
                            key={notification.id} 
                            className={`relative ${notification.isRead ? 'bg-muted/20' : 'border-primary/30 bg-primary/5'}`}
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="mb-1 flex items-center gap-2">
                                    <h4 className="font-medium">{notification.title}</h4>
                                    {!notification.isRead && (
                                      <Badge variant="default" className="px-1.5 py-0 text-[10px]">New</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {formatDate(notification.createdAt)}
                                  </p>
                                  <p className="text-sm">{notification.message}</p>
                                  
                                  {notification.relatedEntityId && notification.type.includes('order') && (
                                    <Button 
                                      variant="link" 
                                      size="sm"
                                      className="px-0 text-primary"
                                      onClick={() => window.location.href = `/orders/${notification.relatedEntityId}`}
                                    >
                                      View Order
                                    </Button>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  {!notification.isRead && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => markNotificationAsRead(notification.id)}
                                    >
                                      <span className="sr-only">Mark as read</span>
                                      <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        className="h-4 w-4" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor"
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </Button>
                                  )}
                                  
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-8 w-8 p-0 text-destructive/70 hover:text-destructive"
                                    onClick={() => deleteNotification(notification.id)}
                                  >
                                    <span className="sr-only">Delete</span>
                                    <svg 
                                      xmlns="http://www.w3.org/2000/svg" 
                                      className="h-4 w-4" 
                                      fill="none" 
                                      viewBox="0 0 24 24" 
                                      stroke="currentColor"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}
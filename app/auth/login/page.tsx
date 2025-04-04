import { z } from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

const router = useRouter();
const { toast } = useToast();

const handleLogin = async (values: z.infer<typeof formSchema>) => {
  try {
    // Get users from localStorage
    const savedUsers = localStorage.getItem("users");
    if (!savedUsers) {
      throw new Error("No users found");
    }

    const users = JSON.parse(savedUsers);
    const user = users.find(
      (u: any) => u.email === values.email && u.password === values.password
    );

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Save important user data in localStorage
    localStorage.setItem("userRegNumber", user.regNumber);
    localStorage.setItem("userRole", user.role);
    localStorage.setItem("userId", user.id.toString());
    localStorage.setItem("userName", user.name);

    // Redirect based on role
    if (user.role === "Student") {
      router.push("/student/dashboard");
    } else {
      router.push("/admin/dashboard");
    }
  } catch (error) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  }
};

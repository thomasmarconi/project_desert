import { getAllUsers, getCurrentUser } from "@/lib/services/adminService";
import UsersTable from "@/components/admin/users-table";
import { redirect } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";
import { UserRole } from "@/lib/types/admin";

export default async function AdminPage() {
  const currentUser = await getCurrentUser();

  // Check if user is logged in
  if (!currentUser) {
    redirect("/api/auth/signin");
  }

  // Check if user is banned
  if (currentUser.isBanned) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            Your account has been banned. Please contact support for assistance.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check if user is admin
  if (currentUser.role !== UserRole.ADMIN) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Unauthorized</AlertTitle>
          <AlertDescription>
            You do not have permission to access this page. Admin access is
            required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Fetch all users
  const users = await getAllUsers();

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage users, roles, and permissions
        </p>
      </div>

      <UsersTable users={users} currentUserId={currentUser.id} />
    </div>
  );
}

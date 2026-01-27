import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignOut } from "@/components/auth/sign-out";

export default function Banned() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="text-8xl">😢</div>
          </div>
          <CardTitle className="text-2xl font-bold">Account Banned</CardTitle>
          <CardDescription className="text-base">
            Your account has been suspended from Project Desert.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            If you believe this is a mistake or would like to appeal this
            decision, please contact our support team.
          </p>
          <div className="pt-2">
            <a
              href="mailto:thomas.marconi2@gmail.com"
              className="text-sm text-primary hover:underline"
            >
              Contact Support
            </a>
          </div>
          <div className="pt-4 flex justify-center">
            <SignOut />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

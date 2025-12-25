import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Mail, Loader2 } from "lucide-react";

interface ForgotPasswordDialogProps {
  defaultEmail?: string;
}

export const ForgotPasswordDialog = ({ defaultEmail = "" }: ForgotPasswordDialogProps) => {
  const [email, setEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Failed to send reset email",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSent(true);
      toast({
        title: "Check your email",
        description: "We've sent you a password reset link",
      });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSent(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Forgot password?
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset your password</DialogTitle>
          <DialogDescription>
            {sent 
              ? "Check your email for a password reset link"
              : "Enter your email address and we'll send you a link to reset your password"
            }
          </DialogDescription>
        </DialogHeader>
        
        {sent ? (
          <div className="space-y-4">
            <div className="p-4 bg-primary/10 rounded-lg text-center">
              <Mail className="h-10 w-10 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                A password reset link has been sent to <strong>{email}</strong>
              </p>
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleResetRequest} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Send Reset Link
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

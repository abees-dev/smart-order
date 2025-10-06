import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form } from "@/components/ui/form";
import { FormTextField } from "@/components/forms";
import { useAuth } from "../hooks/use-auth";
import { loginSchema, type LoginFormData } from "../validation";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const LoginPage = () => {
  const { t } = useTranslation();
  const { user, loading, error, signInWithCredentials, setError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Redirect if user is already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading && !form.formState.isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>{t("common.loading")}</span>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      await signInWithCredentials(data);
    } catch (error) {
      // Error is already handled in the hook
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {t("auth.welcomeBack")}
          </CardTitle>
          <CardDescription>{t("auth.loginDescription")}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormTextField
                control={form.control}
                name="username"
                label={t("auth.username")}
                placeholder={t("auth.usernamePlaceholder")}
                required
                autoComplete="username"
                disabled={form.formState.isSubmitting}
              />

              <FormTextField
                control={form.control}
                name="password"
                label={t("auth.password")}
                placeholder={t("auth.passwordPlaceholder")}
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                disabled={form.formState.isSubmitting}
                endAdornment={
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={form.formState.isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                }
              />

              <Button
                type="submit"
                className="w-full h-12 text-base"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {t("common.loading")}
                  </>
                ) : (
                  t("auth.signIn")
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center">
            <Button
              variant="link"
              className="text-sm text-muted-foreground hover:text-primary"
              disabled={form.formState.isSubmitting}
            >
              {t("auth.forgotPassword")}
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            {t("auth.termsAgreement")}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;

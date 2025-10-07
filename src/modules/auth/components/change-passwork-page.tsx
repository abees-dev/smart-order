import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from "../validation";
import { useChangePassword } from "../hooks/use-change-password";
import { Loader2, AlertCircle, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useAuthStore } from "@/stores";
import { ROUTES } from "@/constants";

const ChangePasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser, user } = useAuthStore();

  const changePasswordMutation = useChangePassword();

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      setError(null);
      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (user) {
        setUser({
          ...user,
          isChangePasswordRequired: false,
        });
      }

      toast.success(t("auth.passwordChangedSuccess"));

      setTimeout(() => {
        navigate(ROUTES.DASHBOARD.CUSTOMERS);
      }, 500);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "common.error";
      setError(t(errorMessage));
    }
  };

  const isLoading = changePasswordMutation.isPending;

  return (
    <div className="container mx-auto py-6 space-y-6 h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto min-w-md">
        <Card>
          <CardHeader>
            <CardTitle>{t("auth.changePassword")}</CardTitle>
            <CardDescription>
              {t("auth.changePasswordDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormTextField
                  control={form.control}
                  name="currentPassword"
                  label={t("auth.currentPassword")}
                  placeholder={t("auth.passwordPlaceholder")}
                  type={showCurrentPassword ? "text" : "password"}
                  required
                  disabled={isLoading}
                  endAdornment={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      disabled={isLoading}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  }
                />

                <FormTextField
                  control={form.control}
                  name="newPassword"
                  label={t("auth.newPassword")}
                  placeholder={t("auth.passwordPlaceholder")}
                  type={showNewPassword ? "text" : "password"}
                  required
                  disabled={isLoading}
                  helpText={t("auth.passwordComplexityRequired")}
                  endAdornment={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={isLoading}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  }
                />

                <FormTextField
                  control={form.control}
                  name="confirmPassword"
                  label={t("auth.confirmPassword")}
                  placeholder={t("auth.passwordPlaceholder")}
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  disabled={isLoading}
                  endAdornment={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  }
                />

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("common.saving")}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {t("auth.changePassword")}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChangePasswordPage;

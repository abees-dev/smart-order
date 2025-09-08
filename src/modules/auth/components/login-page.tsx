import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "../hooks/use-auth";
import { Loader2, AlertCircle } from "lucide-react";

const LoginPage = () => {
  const { t } = useTranslation();
  const { user, loading, error, signInWithGoogle, signInWithZalo } = useAuth();

  // Redirect if user is already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>{t("common.loading")}</span>
        </div>
      </div>
    );
  }

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

          {/* Google Login Button */}
          <Button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full h-12 text-base"
            variant="outline"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.49069 8.13741C4.88967 6.9578 5.65966 5.93144 6.69082 5.20477C7.72199 4.4781 8.96165 4.08824 10.233 4.09079C11.6741 4.09079 12.977 4.59078 14.0003 5.40911L16.978 2.49997C15.1634 0.954156 12.838 0 10.233 0C6.19956 0 2.72725 2.24831 1.05762 5.5416L4.49069 8.13741Z"
                fill="#EA4335"
              />
              <path
                d="M13.6776 15.0114C12.7481 15.5973 11.5679 15.9097 10.2326 15.9097C8.96634 15.9123 7.73136 15.5255 6.70249 14.8042C5.67362 14.0829 4.90299 13.0636 4.4997 11.8906L1.05469 14.4464C1.89995 16.1183 3.20805 17.5251 4.83041 18.5068C6.45276 19.4886 8.32435 20.0061 10.2326 20.0005C12.7336 20.0005 15.123 19.1314 16.9128 17.5006L13.6784 15.0114H13.6776Z"
                fill="#34A853"
              />
              <path
                d="M16.9127 17.4999C18.7844 15.7932 19.9995 13.2533 19.9995 9.99995C19.9995 9.40829 19.9066 8.77247 19.7676 8.18164H10.2324V12.0458H15.7206C15.4503 13.3449 14.7229 14.3507 13.6783 15.0107L16.9127 17.4999Z"
                fill="#4A90E2"
              />
              <path
                d="M4.49993 11.8893C4.29132 11.28 4.18534 10.6417 4.18613 9.9993C4.18613 9.34764 4.29272 8.72181 4.49055 8.13682L1.05748 5.54102C0.355156 6.92657 -0.00688998 8.45308 9.93038e-05 9.9993C9.93038e-05 11.5993 0.379562 13.1076 1.05492 14.4451L4.49993 11.8893Z"
                fill="#FBBC05"
              />
            </svg>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              t("auth.signInWithGoogle")
            )}
          </Button>

          {/* Zalo Login Button */}
          <Button
            onClick={signInWithZalo}
            disabled={loading}
            className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700"
          >
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="50"
                height="50"
                viewBox="0 0 50 50"
                fill="none"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M22.782 0.166016H27.199C33.2653 0.166016 36.8103 1.05701 39.9572 2.74421C43.1041 4.4314 45.5875 6.89585 47.2557 10.0428C48.9429 13.1897 49.8339 16.7347 49.8339 22.801V27.1991C49.8339 33.2654 48.9429 36.8104 47.2557 39.9573C45.5685 43.1042 43.1041 45.5877 39.9572 47.2559C36.8103 48.9431 33.2653 49.8341 27.199 49.8341H22.8009C16.7346 49.8341 13.1896 48.9431 10.0427 47.2559C6.89583 45.5687 4.41243 43.1042 2.7442 39.9573C1.057 36.8104 0.166016 33.2654 0.166016 27.1991V22.801C0.166016 16.7347 1.057 13.1897 2.7442 10.0428C4.43139 6.89585 6.89583 4.41245 10.0427 2.74421C13.1707 1.05701 16.7346 0.166016 22.782 0.166016Z"
                  fill="#0068FF"
                />
                <path
                  opacity="0.12"
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M49.8336 26.4736V27.1994C49.8336 33.2657 48.9427 36.8107 47.2555 39.9576C45.5683 43.1045 43.1038 45.5879 39.9569 47.2562C36.81 48.9434 33.265 49.8344 27.1987 49.8344H22.8007C17.8369 49.8344 14.5612 49.2378 11.8104 48.0966L7.27539 43.4267L49.8336 26.4736Z"
                  fill="#001A33"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M7.779 43.5892C10.1019 43.846 13.0061 43.1836 15.0682 42.1825C24.0225 47.1318 38.0197 46.8954 46.4923 41.4732C46.8209 40.9803 47.1279 40.4677 47.4128 39.9363C49.1062 36.7779 50.0004 33.22 50.0004 27.1316V22.7175C50.0004 16.629 49.1062 13.0711 47.4128 9.91273C45.7385 6.75436 43.2461 4.28093 40.0877 2.58758C36.9293 0.894239 33.3714 0 27.283 0H22.8499C17.6644 0 14.2982 0.652754 11.4699 1.89893C11.3153 2.03737 11.1636 2.17818 11.0151 2.32135C2.71734 10.3203 2.08658 27.6593 9.12279 37.0782C9.13064 37.0921 9.13933 37.1061 9.14889 37.1203C10.2334 38.7185 9.18694 41.5154 7.55068 43.1516C7.28431 43.399 7.37944 43.5512 7.779 43.5892Z"
                  fill="white"
                />
                <path
                  d="M20.5632 17H10.8382V19.0853H17.5869L10.9329 27.3317C10.7244 27.635 10.5728 27.9194 10.5728 28.5639V29.0947H19.748C20.203 29.0947 20.5822 28.7156 20.5822 28.2606V27.1421H13.4922L19.748 19.2938C19.8428 19.1801 20.0134 18.9716 20.0893 18.8768L20.1272 18.8199C20.4874 18.2891 20.5632 17.8341 20.5632 17.2844V17Z"
                  fill="#0068FF"
                />
                <path
                  d="M32.9416 29.0947H34.3255V17H32.2402V28.3933C32.2402 28.7725 32.5435 29.0947 32.9416 29.0947Z"
                  fill="#0068FF"
                />
                <path
                  d="M25.814 19.6924C23.1979 19.6924 21.0747 21.8156 21.0747 24.4317C21.0747 27.0478 23.1979 29.171 25.814 29.171C28.4301 29.171 30.5533 27.0478 30.5533 24.4317C30.5723 21.8156 28.4491 19.6924 25.814 19.6924ZM25.814 27.2184C24.2785 27.2184 23.0273 25.9672 23.0273 24.4317C23.0273 22.8962 24.2785 21.645 25.814 21.645C27.3495 21.645 28.6007 22.8962 28.6007 24.4317C28.6007 25.9672 27.3685 27.2184 25.814 27.2184Z"
                  fill="#0068FF"
                />
                <path
                  d="M40.4867 19.6162C37.8516 19.6162 35.7095 21.7584 35.7095 24.3934C35.7095 27.0285 37.8516 29.1707 40.4867 29.1707C43.1217 29.1707 45.2639 27.0285 45.2639 24.3934C45.2639 21.7584 43.1217 19.6162 40.4867 19.6162ZM40.4867 27.2181C38.9322 27.2181 37.681 25.9669 37.681 24.4124C37.681 22.8579 38.9322 21.6067 40.4867 21.6067C42.0412 21.6067 43.2924 22.8579 43.2924 24.4124C43.2924 25.9669 42.0412 27.2181 40.4867 27.2181Z"
                  fill="#0068FF"
                />
                <path
                  d="M29.4562 29.0944H30.5747V19.957H28.6221V28.2793C28.6221 28.7153 29.0012 29.0944 29.4562 29.0944Z"
                  fill="#0068FF"
                />
              </svg>
            </div>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              t("auth.signInWithZalo")
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            {t("auth.termsAgreement")}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;

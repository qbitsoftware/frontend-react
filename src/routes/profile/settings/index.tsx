import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePatchUserPassword } from "@/queries/users";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/profile/settings/")({
  component: RouteComponent,
});

// const personalInfoSchema = z.object({
//   firstName: z.string().min(1, "First name must be at least 1 characters"),
//   lastName: z.string().min(1, "Last name must be at least 1 characters"),
//   birthDate: z
//     .string()
//     .regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date"),
//   email: z.string().email("Please enter a valid email address"),
// });

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

function RouteComponent() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // const [isPersonalInfoSaving, setIsPersonalInfoSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  // const { data: userProfile, isLoading } = UseGetMe();
  const { t } = useTranslation();

  // const updateUserMutation = usePatchUser();
  const updatePassword = usePatchUserPassword();

  // const {
  //   register: registerPersonalInfo,
  //   handleSubmit: handlePersonalInfoSubmit,
  //   formState: { errors: personalInfoErrors },
  //   reset: resetPersonalInfo,
  // } = useForm<PersonalInfoFormData>({
  //   resolver: zodResolver(personalInfoSchema),
  // });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  // useEffect(() => {
  //   if (userProfile?.data) {
  // resetPersonalInfo({
  //   firstName: userProfile.data.first_name || "",
  //   lastName: userProfile.data.last_name || "",
  //   birthDate: userProfile.data.birth_date || "",
  //   email: user?.email || "",
  // });
  // }
  //userProfile, user, resetPersonalInfo
  // }, [userProfile, user]);

  // const isMissingInfo =
  //   !userProfile?.data?.first_name || !userProfile?.data?.last_name;

  // const onPersonalInfoSubmit = async (data: PersonalInfoFormData) => {
  //   setIsPersonalInfoSaving(true);

  //   try {
  //     await updateUserMutation.mutateAsync({
  //       first_name: data.firstName,
  //       last_name: data.lastName,
  //       birth_date: data.birthDate,
  //     });
  //     toast.success("Personal information updated successfully");
  //   } catch (error) {
  //     toast.error("Failed to update personal information");
  //   }
  //   setIsPersonalInfoSaving(false);
  // };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsPasswordSaving(true);

    try {
      await updatePassword.mutateAsync({
        current_password: data.currentPassword,
        new_password: data.newPassword,
      });
      toast.success("Password changed successfully");
      resetPassword();
    } catch (error) {
      toast.error("Failed to change password");
    }
    setIsPasswordSaving(false);
  };

  // if (isLoading) {
  //   return <SettingsSkeleton />;
  // }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* {isMissingInfo && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600 flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-800 mb-1">
                {t("profile.settings.notice.title")}
              </h3>
              <p className="text-yellow-700 text-sm sm:text-base">
                {t("profile.settings.notice.description")}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {t("profile.settings.personalInfo.title")}
            </h2>
            <p className="text-gray-600">
              {t("profile.settings.personalInfo.description")}
            </p>
          </div>
        </div>

        <form
          onSubmit={handlePersonalInfoSubmit(onPersonalInfoSubmit)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="group">
              <Label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("profile.settings.personalInfo.firstName.label")}
              </Label>
              <div className="relative">
                <Input
                  id="firstName"
                  type="text"
                  {...registerPersonalInfo("firstName")}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm group-hover:bg-white/80"
                  placeholder={t(
                    "profile.settings.personalInfo.firstName.placeholder",
                  )}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
              </div>
              {personalInfoErrors.firstName && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {personalInfoErrors.firstName.message}
                </p>
              )}
            </div>

            <div className="group">
              <Label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("profile.settings.personalInfo.lastName.label")}
              </Label>
              <div className="relative">
                <Input
                  id="lastName"
                  type="text"
                  {...registerPersonalInfo("lastName")}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm group-hover:bg-white/80"
                  placeholder={t(
                    "profile.settings.personalInfo.lastName.placeholder",
                  )}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
              </div>
              {personalInfoErrors.lastName && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {personalInfoErrors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="group">
              <Label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("profile.settings.personalInfo.email.label")}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  disabled
                  {...registerPersonalInfo("email")}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm group-hover:bg-white/80"
                  placeholder={t(
                    "profile.settings.personalInfo.email.placeholder",
                  )}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
              </div>
              {personalInfoErrors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {personalInfoErrors.email.message}
                </p>
              )}
            </div>

            <div className="group">
              <Label
                htmlFor="birthDate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("profile.settings.personalInfo.birthDate.label")}
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="birthDate"
                  type="date"
                  {...registerPersonalInfo("birthDate")}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm group-hover:bg-white/80"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
              </div>
              {personalInfoErrors.birthDate && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {personalInfoErrors.birthDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isPersonalInfoSaving || updateUserMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
            >
              {isPersonalInfoSaving || updateUserMutation.isPending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  {t("profile.settings.personalInfo.saving")}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t("profile.settings.personalInfo.saveButton")}
                </>
              )}
            </Button>
          </div>
        </form>
      </div> */}

      {/* Password Change Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center text-white">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {t("profile.settings.password.title")}
            </h2>
            <p className="text-gray-600">
              {t("profile.settings.password.description")}
            </p>
          </div>
        </div>

        <form
          onSubmit={handlePasswordSubmit(onPasswordSubmit)}
          className="space-y-6"
        >
          <div className="group">
            <Label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t("profile.settings.password.currentPassword.label")}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                {...registerPassword("currentPassword")}
                className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm group-hover:bg-white/80"
                placeholder={t(
                  "profile.settings.password.currentPassword.placeholder",
                )}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
            </div>
            {passwordErrors.currentPassword && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {passwordErrors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="group">
              <Label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("profile.settings.password.newPassword.label")}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  {...registerPassword("newPassword")}
                  className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm group-hover:bg-white/80"
                  placeholder={t(
                    "profile.settings.password.newPassword.placeholder",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
              </div>
              {passwordErrors.newPassword && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {passwordErrors.newPassword.message}
                </p>
              )}
            </div>

            <div className="group">
              <Label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("profile.settings.password.confirmPassword.label")}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...registerPassword("confirmPassword")}
                  className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm group-hover:bg-white/80"
                  placeholder={t(
                    "profile.settings.password.confirmPassword.placeholder",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
              </div>
              {passwordErrors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {passwordErrors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              {t("profile.settings.password.requirements.title")}
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• {t("profile.settings.password.requirements.length")}</li>
              <li>• {t("profile.settings.password.requirements.mixedCase")}</li>
              <li>• {t("profile.settings.password.requirements.special")}</li>
            </ul>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isPasswordSaving}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
            >
              {isPasswordSaving ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  {t("profile.settings.password.changing")}
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  {t("profile.settings.password.changeButton")}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

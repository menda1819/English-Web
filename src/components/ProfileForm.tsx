"use client";

import React, { useState, useActionState, useRef } from "react";
import { updateProfileDetailsAction, updatePasswordAction, ProfileActionResult } from "@/app/actions/profile";
import { UserAvatar, AVATAR_PRESETS } from "./UserAvatar";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Upload,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  BookOpen,
} from "lucide-react";

interface ProfileFormProps {
  initialUser: {
    id: string;
    name: string;
    email: string;
    role: "teacher" | "student";
    grade?: number;
    avatar?: string;
    accessAllGrades?: boolean;
    allowedGrades?: number[];
    createdAt?: string;
  };
}

export function ProfileForm({ initialUser }: ProfileFormProps) {
  // Profile Details State
  const [name, setName] = useState(initialUser.name);
  const [email, setEmail] = useState(initialUser.email);
  const [avatarChoice, setAvatarChoice] = useState<"preset" | "upload">(
    initialUser.avatar && initialUser.avatar.startsWith("/api/avatar/") ? "upload" : "preset"
  );
  const [selectedPreset, setSelectedPreset] = useState<string>(
    initialUser.avatar && !initialUser.avatar.startsWith("/api/avatar/")
      ? initialUser.avatar
      : initialUser.role === "teacher"
      ? "teacher"
      : "sprout"
  );
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(
    initialUser.avatar && initialUser.avatar.startsWith("/api/avatar/")
      ? initialUser.avatar
      : null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password Show/Hide states
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Profile Details Action
  const [profileState, profileAction, isPendingProfile] = useActionState<ProfileActionResult | null, FormData>(
    updateProfileDetailsAction,
    null
  );

  // Password Action
  const [passwordState, passwordAction, isPendingPassword] = useActionState<ProfileActionResult | null, FormData>(
    updatePasswordAction,
    null
  );

  const passwordFormRef = useRef<HTMLFormElement>(null);

  // Handle local file selection preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("Please choose an image under 3MB.");
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setUploadedPreview(previewUrl);
      setAvatarChoice("upload");
    }
  };

  // Compute active preview avatar
  const currentPreviewAvatar =
    avatarChoice === "upload" && uploadedPreview ? uploadedPreview : selectedPreset;

  const isTeacher = initialUser.role === "teacher";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Profile Card & Role Summary */}
      <div className="lg:col-span-1 space-y-6">
        {/* Profile Snapshot Card */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-emerald-500 to-green-400" />

          <div className="relative pt-6">
            <div className="inline-block p-1.5 rounded-full bg-white shadow-md mb-3">
              <UserAvatar
                avatar={currentPreviewAvatar}
                name={name}
                size="2xl"
                className="ring-4 ring-emerald-50"
              />
            </div>

            <h3
              className="text-xl font-bold text-stone-900 mt-1"
              style={{ fontFamily: "var(--font-fredoka)" }}
            >
              {name || "Your Name"}
            </h3>
            <p className="text-xs text-stone-500 font-medium break-all">{email}</p>

            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {isTeacher ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Teacher & Administrator</span>
                </>
              ) : (
                <>
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Grade {initialUser.grade} Student</span>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-stone-100 text-left space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-500">Account Type</span>
              <span className="font-bold text-stone-800 capitalize">{initialUser.role}</span>
            </div>

            {!isTeacher && (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">Enrolled Grade</span>
                  <span className="font-bold text-emerald-700">Grade {initialUser.grade}</span>
                </div>
                <div className="text-xs">
                  <span className="text-stone-500 block mb-1">Library Access</span>
                  {initialUser.accessAllGrades ? (
                    <span className="inline-block px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-[11px]">
                      All Grades (1–5) Unlocked
                    </span>
                  ) : initialUser.allowedGrades && initialUser.allowedGrades.length > 0 ? (
                    <span className="inline-block px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-bold text-[11px]">
                      Grade {initialUser.grade} + Grades {initialUser.allowedGrades.join(", ")}
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium text-[11px]">
                      Grade {initialUser.grade} materials only
                    </span>
                  )}
                </div>
              </>
            )}

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-stone-500">Member Status</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Active Garden Member
              </span>
            </div>
          </div>
        </div>

        {/* Helpful Classroom Tip Card */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-5 text-stone-700 text-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-800 font-bold">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Classroom Tip</span>
          </div>
          <p className="leading-relaxed">
            {isTeacher
              ? "Students can see your teacher profile name and avatar on notes, uploaded worksheets, and exam instructions."
              : "Your friendly classroom mascot will appear next to your name in your student library and classroom activities!"}
          </p>
        </div>
      </div>

      {/* Right Column: Edit Profile Details + Change Password Forms */}
      <div className="lg:col-span-2 space-y-8">
        {/* Form 1: Profile Details & Picture */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <h3
              className="text-xl font-bold text-stone-900"
              style={{ fontFamily: "var(--font-fredoka)" }}
            >
              Profile Information & Picture
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Update your name, username or email, and choose your favorite profile avatar or picture.
            </p>
          </div>

          {/* Feedback Alerts */}
          {profileState?.success && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2.5 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{profileState.message || "Profile updated successfully!"}</span>
            </div>
          )}

          {profileState?.error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{profileState.error}</span>
            </div>
          )}

          <form action={profileAction} className="space-y-6">
            <input type="hidden" name="avatarChoice" value={avatarChoice} />
            <input type="hidden" name="avatarPreset" value={selectedPreset} />

            {/* Display Name */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Display Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder={isTeacher ? "e.g. Teacher Florence" : "e.g. Leo Parker"}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Username / Email */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                {isTeacher ? "Email Address (Login ID)" : "Student Username / Login ID"}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={isTeacher ? "teacher@brightgarden.edu" : "leo.parker"}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5">
                {isTeacher
                  ? "This is the email address you use to sign into the Teacher Desk."
                  : "You use this username or email to sign into the Student Garden."}
              </p>
            </div>

            {/* Profile Picture / Avatar Selector */}
            <div className="space-y-4 pt-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Profile Picture & Mascot
              </label>

              {/* Toggle Avatar Mode */}
              <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-2xl max-w-md">
                <button
                  type="button"
                  onClick={() => setAvatarChoice("preset")}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    avatarChoice === "preset"
                      ? "bg-white text-emerald-800 shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  Classroom Mascots 🦊
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAvatarChoice("upload");
                    fileInputRef.current?.click();
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    avatarChoice === "upload"
                      ? "bg-white text-emerald-800 shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  Upload Custom Photo 📷
                </button>
              </div>

              {/* Mode A: Mascot Preset Grid */}
              {avatarChoice === "preset" ? (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                  {AVATAR_PRESETS.map((preset) => {
                    const isSelected = selectedPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedPreset(preset.id)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                          isSelected
                            ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-300"
                            : "bg-stone-50 border-stone-200 hover:bg-stone-100"
                        }`}
                      >
                        <UserAvatar avatar={preset.id} size="md" />
                        <span className="text-xs font-bold text-stone-800 block truncate w-full">
                          {preset.name}
                        </span>
                        <span className="text-[10px] text-stone-500 block truncate w-full">
                          {preset.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Mode B: Upload Custom Photo */
                <div className="p-6 border-2 border-dashed border-stone-200 rounded-3xl bg-stone-50 hover:bg-stone-100/60 transition-colors text-center space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="avatarFile"
                    accept="image/png, image/jpeg, image/webp, image/gif"
                    onChange={handleFileChange}
                    className="hidden"
                    id="avatar-upload-input"
                  />

                  <div className="w-16 h-16 mx-auto rounded-full bg-white shadow-xs border border-stone-200 flex items-center justify-center overflow-hidden">
                    {uploadedPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={uploadedPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Upload className="w-6 h-6 text-stone-400" />
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="avatar-upload-input"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadedPreview ? "Choose Different Photo" : "Select Image from Computer"}</span>
                    </label>
                    <p className="text-[11px] text-stone-500 mt-2">
                      Supports JPG, PNG, WebP or GIF (maximum 3MB).
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Save Profile Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isPendingProfile}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isPendingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Profile Information</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Form 2: Change Password Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-700" />
              <h3
                className="text-xl font-bold text-stone-900"
                style={{ fontFamily: "var(--font-fredoka)" }}
              >
                Security & Password
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Keep your account secure by using a strong password of at least 6 characters.
            </p>
          </div>

          {/* Password Action Feedback */}
          {passwordState?.success && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2.5 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{passwordState.message}</span>
            </div>
          )}

          {passwordState?.error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{passwordState.error}</span>
            </div>
          )}

          <form
            ref={passwordFormRef}
            action={async (formData) => {
              await passwordAction(formData);
              passwordFormRef.current?.reset();
            }}
            className="space-y-5"
          >
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Current Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showCurrentPw ? "text" : "password"}
                  name="currentPassword"
                  required
                  placeholder="Enter your current password"
                  className="w-full pl-10 pr-12 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="p-2 text-stone-400 hover:text-stone-700 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  tabIndex={-1}
                >
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPw ? "text" : "password"}
                    name="newPassword"
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-12 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="p-2 text-stone-400 hover:text-stone-700 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    name="confirmPassword"
                    required
                    minLength={6}
                    placeholder="Repeat new password"
                    className="w-full pl-10 pr-12 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="p-2 text-stone-400 hover:text-stone-700 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Update Password Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isPendingPassword}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isPendingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Change Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

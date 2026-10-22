import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LoginForm } from "./LoginForm";
import { SproutIcon } from "@/components/GardenIcons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sign In",
  description: "Sign in to the Bright English Garden learning library or teacher desk.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const roleParam = typeof resolvedParams.role === "string" ? resolvedParams.role : "student";
  const errorParam = typeof resolvedParams.error === "string" ? resolvedParams.error : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 mx-auto flex items-center justify-center text-emerald-800 shadow-sm mb-3">
              <SproutIcon className="w-10 h-10" />
            </div>
          </div>

          <LoginForm initialRole={roleParam} errorParam={errorParam} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

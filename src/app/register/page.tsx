import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RegisterForm } from "./RegisterForm";

export const metadata = {
  title: "Student Registration",
  description: "Register for your student pass to access English learning materials in Grades 1–5.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
        <RegisterForm />
      </main>

      <Footer />
    </div>
  );
}

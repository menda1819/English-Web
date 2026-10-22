import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { requireTeacher } from "@/lib/auth/session";
import { ResourceForm } from "./ResourceForm";

export const metadata = {
  title: "Plant New Resource",
  description: "Create and publish new English teaching materials.",
};

export default async function NewResourcePage() {
  await requireTeacher();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3]">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <ResourceForm />
      </main>

      <Footer />
    </div>
  );
}

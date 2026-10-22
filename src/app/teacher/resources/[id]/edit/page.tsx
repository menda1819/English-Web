import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { requireTeacher } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db";
import Resource from "@/models/Resource";
import { EditResourceForm } from "./EditResourceForm";
import { ResourceData } from "@/components/ResourceCard";

export const metadata = {
  title: "Edit Resource",
  description: "Update educational material details and manage file versions.",
};

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireTeacher();
  const { id } = await params;

  await connectToDatabase();
  const resource = await Resource.findById(id).lean();

  if (!resource) {
    notFound();
  }

  const resData: ResourceData = {
    _id: resource._id.toString(),
    title: resource.title,
    description: resource.description,
    grades: resource.grades,
    topic: resource.topic,
    type: resource.type,
    tags: resource.tags,
    instructions: resource.instructions,
    publicationStatus: resource.publicationStatus,
    safeFileName: resource.safeFileName,
    fileSize: resource.fileSize,
    mimeType: resource.mimeType,
    teacherName: resource.teacherName,
    createdAt: resource.createdAt.toISOString(),
    publishedAt: resource.publishedAt ? resource.publishedAt.toISOString() : undefined,
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3]">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <EditResourceForm resource={resData} />
      </main>

      <Footer />
    </div>
  );
}

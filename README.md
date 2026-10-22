# 🌻 Bright English Garden

> **A Cheerful Classroom English Learning Library & Management Hub for Primary School Grades 1–5**

---

## 📖 Overview

**Bright English Garden** is a production-minded web application engineered for a primary-school English teacher and her young learners in Grades 1 to 5. 

The application provides two strictly isolated domains:
1. **Teacher Administrative Desk (`/teacher`)**: A private control center for the teacher to upload, organize, edit, preview, publish, and delete English curriculum materials (worksheets, lesson plans, phonics flashcards, reading notes, and exam papers), as well as supervise enrolled student accounts.
2. **Student Learning Garden (`/student`)**: A colorful, age-appropriate library where children can register their garden pass, browse materials tailored to their grade, read cheerful instructions, and view or download published learning materials. Students are strictly barred from entering teacher administration or viewing drafts.

---

## 🛠 Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack, Server Actions, Route Handlers, Proxy/Middleware)
- **Language**: TypeScript with strict types and runtime validation
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with a custom classroom garden design system (soft cream, leafy greens, sky blues, sunshine yellows, coral accents, and Google Fonts *Fredoka* & *Nunito*)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) remote cloud cluster managed with [Mongoose](https://mongoosejs.com/) with connection pooling and serverless caching
- **Authentication**: Stateless, edge-compatible sessions powered by [`jose`](https://github.com/panva/jose) (JWT) stored in secure, `HTTP-only`, `SameSite=lax` cookies; password hashing with [`bcryptjs`](https://www.npmjs.com/package/bcryptjs)
- **Object Storage**: Pluggable storage architecture supporting **Cloudinary** and **MongoDB GridFS** remote cloud object storage (never using the ephemeral Vercel local filesystem)
- **Icons & Art**: Custom SVG garden artwork (sprouts, bees, owls, watering cans) + [Lucide React](https://lucide.dev/)

---

## 🔒 Security Architecture & Access Boundaries

| Role | Access Permissions | Authentication & Authorization |
| :--- | :--- | :--- |
| **Teacher (Admin)** | Full administrative access to `/teacher/*`, create/edit/delete/publish materials, view all student accounts, toggle student active status, and view the student library. | **Cannot be registered publicly.** Created via the secure seed script (`npm run seed:teacher`) or initial server bootstrap using server-side environment variables. |
| **Student** | Limited exclusively to `/student/*` and their own account. Can only view **published** resources intended for primary grades. | Self-registration at `/register` is strictly hardcoded to the `"student"` role. Drafts, teacher notes, admin routes, and other students' private data are unreachable. |

### Server-Enforced Boundaries:
- **Proxy/Middleware Guard (`src/proxy.ts`)**: Evaluates JWT session cookies on incoming requests before page render. Rejects unauthenticated users and redirects students attempting to access `/teacher/*` to `/unauthorized`.
- **Database-Level Filtration**: Student queries explicitly include `{ publicationStatus: "published" }`. Students cannot query drafts even if they craft custom requests.
- **Secure File Streaming (`/api/resources/[id]/file`)**: Validates session authentication and ensures students can only stream/download files for published resources.

---

## ☁️ Remote Object Storage Architecture

Vercel functions run in an ephemeral serverless environment where files saved to `/tmp` or the local filesystem are discarded immediately. **Bright English Garden** isolates all file operations behind a pluggable storage adapter (`src/lib/storage/index.ts`):

1. **MongoDB Atlas GridFS (Active Default)**: 
   - Files (PDF, Word DOCX, PowerPoint PPTX, Images) are streamed directly into the remote MongoDB Atlas cluster in the `educational_materials` GridFS bucket.
   - Works immediately with zero extra configuration beyond your MongoDB Atlas URI.
2. **Cloudinary (Plug & Play)**:
   - Provide `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in `.env.local` or Vercel environment variables.
   - Files will automatically upload to Cloudinary's secure global CDN.
   - *Free Tier Note*: Cloudinary's free tier provides 25 monthly credits (~25GB storage or net bandwidth). Provider terms and limits can change over time.

---

## 🗄 MongoDB Atlas & Compass Configuration

### 1. MongoDB Atlas (Hosted Database)
MongoDB Atlas is the remote database host for this application.
1. Create or log in to your account at [cloud.mongodb.com](https://cloud.mongodb.com/).
2. Under **Network Access**, ensure your IP address (or `0.0.0.0/0` for Vercel serverless deployment) is allowlisted.
3. Under **Database Access**, create a database user with `readWriteAnyDatabase` privileges.
4. Obtain the connection string in the format:
   ```
   mongodb+srv://<username>:<password>@<cluster-host>/bright_english_garden?retryWrites=true&w=majority
   ```
5. Rotate credentials if necessary and store the URI in `.env.local` (local) and Vercel Project Settings (production). **Never commit credentials to Git or public documentation.**

### 2. MongoDB Compass (Desktop Inspection GUI)
MongoDB Compass is a desktop graphical interface to inspect and query your database. It is not the database host itself.
1. Download and open **MongoDB Compass** on your computer.
2. Click **New Connection**.
3. Paste the exact same Atlas connection string:
   ```
   mongodb+srv://<username>:<password>@<cluster-host>/bright_english_garden?retryWrites=true&w=majority
   ```
4. Click **Connect**. You can now inspect the `users`, `resources`, `activities`, and `educational_materials.files` collections visually.

---

## 🚀 Local Development Setup

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd english-web
npm install
```

### 2. Environment Variables Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Populate the values inside `.env.local`:
```env
# Remote MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/bright_english_garden?retryWrites=true&w=majority

# Random 32+ character key for JWT signing
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long

# Initial Teacher Admin Setup
INITIAL_TEACHER_NAME=Teacher Florence
INITIAL_TEACHER_EMAIL=teacher@brightgarden.edu
INITIAL_TEACHER_PASSWORD=GardenTeacher2026!

# Optional Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Public App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Setup Initial Teacher Account
Run the seed script to create your teacher admin account in MongoDB Atlas:
```bash
npm run seed:teacher
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Authentication Portals

- **Teacher Desk (`/login` → Teacher Desk)**: Sign in using your configured `INITIAL_TEACHER_EMAIL` and `INITIAL_TEACHER_PASSWORD`.
- **Student Garden (`/register` & `/login`)**: Students self-register their learning pass by entering their name, choosing their enrolled grade (1–5), selecting a mascot, and setting a password.

---

## 🚢 Deployment to Vercel

1. Push your repository to GitHub, GitLab, or Bitbucket (confirm `.env.local` is ignored).
2. Go to [vercel.com](https://vercel.com) and click **Add New Project**.
3. Select your repository.
4. In the **Environment Variables** section, add the required production variables:
   - `MONGODB_URI`: Your production Atlas URI
   - `JWT_SECRET`: A secure random 32+ character string (e.g. generated with `openssl rand -base64 32`)
   - `INITIAL_TEACHER_NAME`: e.g. `Teacher Florence`
   - `INITIAL_TEACHER_EMAIL`: e.g. `teacher@brightgarden.edu`
   - `INITIAL_TEACHER_PASSWORD`: e.g. `StrongProductionPassword!`
   - `NEXT_PUBLIC_APP_URL`: Your Vercel production domain (e.g., `https://bright-english-garden.vercel.app`)
   - *(Optional)* `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
5. Click **Deploy**. Vercel will build the application using Turbopack and deploy it globally.
6. Once deployed, run the seed script locally pointing to the production database or allow the automatic bootstrap on first teacher login to create the initial teacher account.

---

## 📋 Acceptance Criteria Checklist

- [x] **Student Registration & Sign-in**: Students can register with grade selection (Grades 1–5) and sign in. Role is hardcoded to `student` on the server.
- [x] **Teacher Security**: Teachers cannot be created via public registration. Configured securely via seed script and environment variables.
- [x] **Strict Access Control**: Route proxy (`src/proxy.ts`), server actions, and route handlers reject student attempts to access `/teacher/*` and redirect to `/unauthorized`.
- [x] **Published Materials Only**: Database queries enforce that students only receive published resources. Drafts are never sent to student clients.
- [x] **Full Resource Lifecycle**: Teachers can upload files, edit metadata, replace files, publish/unpublish with one click, and delete with a confirmation modal.
- [x] **Decoupled Persistent Storage**: File attachments persist remotely in MongoDB Atlas GridFS / Cloudinary, never on the local ephemeral Vercel filesystem.
- [x] **Server-side Secrets**: All secrets (`MONGODB_URI`, `JWT_SECRET`) remain on the server and are excluded from version control.
- [x] **Theme & Accessibility**: Warm classroom garden aesthetics, accessible keyboard focus rings, semantic HTML, responsive layout across phone/tablet/laptop.
- [x] **Production Build**: Verified with Next.js 16 App Router, TypeScript type checking, and automated integration tests.

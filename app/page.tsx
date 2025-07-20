import { AppNavbar } from "@/components/app-navbar";

export default function Home() {
  return (
    <>
      <AppNavbar breadcrumbs={[{ title: "Home", isActive: true }]} />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <h1 className="text-2xl font-bold">Welcome to ECWU Tool</h1>
        <p>
          This is the home page, find or search for the tools you need in the
          sidebar.
        </p>
      </div>
    </>
  );
}

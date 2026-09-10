import type { Metadata } from "next";
import NotFoundPage from "@/components/NotFoundPage";

export const metadata: Metadata = {
  title: "OHRYA - Page Not Found",
  description: "The page you're looking for could not be found.",
};

export default function NotFound() {
  return <NotFoundPage />;
}

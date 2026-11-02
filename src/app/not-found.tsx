import { ErrorView } from "@/components/shared/error-view";

export default function NotFound() {
  return (
    <ErrorView
      code="404"
      title="Halaman tidak ditemukan"
      description="Alamat yang kamu buka tidak ada atau sudah dipindahkan."
    />
  );
}

import { getApiDocs } from "@/lib/openAPI/swagger";
import ReactSwagger from "../api-docs/react-swagger";

export default async function ApiDocPage() {
  const spec = await getApiDocs();
  return (
    <main className="min-h-screen bg-white p-4">
      <ReactSwagger spec={spec} />
    </main>
  );
}

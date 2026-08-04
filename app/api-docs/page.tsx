
import { getApiDocs } from "@/lib/openAPI/swagger";
import ReactSwagger from "./react-swagger";

export default async function ApiDocsPage() {
  const spec = await getApiDocs();
  return (
    <main className="min-h-screen bg-white p-4">
      <ReactSwagger spec={spec} />
    </main>
  );
}

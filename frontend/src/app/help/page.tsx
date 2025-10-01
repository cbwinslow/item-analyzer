export default function Help() {
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6">Help & FAQ</h1>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Getting Started</h2>
            <p>Upload images of your item, provide a description, and get AI-powered analysis including market research and selling tips.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Supported Formats</h2>
            <ul className="list-disc list-inside">
              <li>Images: JPG, PNG, WebP</li>
              <li>Reports: Text, JSON, CSV, Markdown, HTML, PDF</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Pricing</h2>
            <p>Free tier: 10 analyses/month. Premium: $9.99/month for unlimited.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Contact Support</h2>
            <p>Email: support@itemanalyzer.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-command-black py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-montserrat font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-lg">
          <p className="text-intel-gray mb-6">
            At Cleared Advisory Group, we take your privacy seriously. This policy outlines how we collect, 
            use, and protect your personal information.
          </p>
          <h2 className="text-2xl font-montserrat font-semibold mt-8 mb-4">Information We Collect</h2>
          <p className="text-intel-gray mb-6">
            We collect information you provide directly to us, such as when you create an account, 
            fill out a form, or contact us.
          </p>
          <h2 className="text-2xl font-montserrat font-semibold mt-8 mb-4">Security</h2>
          <p className="text-intel-gray mb-6">
            We implement appropriate technical and organizational measures to protect your personal information 
            against unauthorized access, alteration, disclosure, or destruction.
          </p>
          <p className="text-sm text-intel-gray mt-12">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-command-black py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-montserrat font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-lg">
          <p className="text-intel-gray mb-6">
            By using Cleared Advisory Group's services, you agree to these terms.
          </p>
          <h2 className="text-2xl font-montserrat font-semibold mt-8 mb-4">Use of Services</h2>
          <p className="text-intel-gray mb-6">
            Our services are designed to assist cleared professionals with career advancement. 
            You must provide accurate information and maintain the confidentiality of your account.
          </p>
          <h2 className="text-2xl font-montserrat font-semibold mt-8 mb-4">Confidentiality</h2>
          <p className="text-intel-gray mb-6">
            We respect the sensitive nature of security clearances and maintain strict confidentiality 
            of all client information.
          </p>
          <h2 className="text-2xl font-montserrat font-semibold mt-8 mb-4">Limitation of Liability</h2>
          <p className="text-intel-gray mb-6">
            Cleared Advisory Group provides career guidance and advice. Ultimate career decisions 
            and outcomes are the responsibility of the individual.
          </p>
          <p className="text-sm text-intel-gray mt-12">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}
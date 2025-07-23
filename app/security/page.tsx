export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-command-black py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-montserrat font-bold mb-8">Security</h1>
        <div className="prose prose-lg">
          <p className="text-intel-gray mb-6">
            At Cleared Advisory Group, security is paramount. We understand the unique requirements 
            of working with cleared professionals.
          </p>
          <h2 className="text-2xl font-montserrat font-semibold mt-8 mb-4">Data Protection</h2>
          <ul className="list-disc pl-6 text-intel-gray mb-6">
            <li>End-to-end encryption for all communications</li>
            <li>Secure servers with regular security audits</li>
            <li>Strict access controls and authentication</li>
            <li>Regular security training for all staff</li>
          </ul>
          <h2 className="text-2xl font-montserrat font-semibold mt-8 mb-4">Compliance</h2>
          <p className="text-intel-gray mb-6">
            We maintain compliance with all relevant security regulations and best practices 
            for handling sensitive information related to security clearances.
          </p>
          <h2 className="text-2xl font-montserrat font-semibold mt-8 mb-4">Incident Response</h2>
          <p className="text-intel-gray mb-6">
            In the unlikely event of a security incident, we have comprehensive response procedures 
            in place to protect your information and notify affected parties promptly.
          </p>
          <h2 className="text-2xl font-montserrat font-semibold mt-8 mb-4">Report Security Issues</h2>
          <p className="text-intel-gray mb-6">
            If you discover a security vulnerability, please report it to: 
            <a href="mailto:security@clearedadvisorygroup.com" className="text-dynamic-green hover:text-emerald-green">
              security@clearedadvisorygroup.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
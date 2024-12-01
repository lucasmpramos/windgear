import React from 'react';
import { Helmet } from 'react-helmet-async';

function Terms() {
  return (
    <>
      <Helmet>
        <title>Terms of Service | Windgear</title>
        <meta name="description" content="Terms of service and user agreement for Windgear marketplace" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="prose prose-blue max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-4">
              By accessing or using Windgear, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. User Eligibility</h2>
            <p className="text-gray-600 mb-4">
              To use Windgear, you must:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Be at least 18 years old</li>
              <li>Have the legal capacity to enter into binding contracts</li>
              <li>Not be prohibited from using the service under applicable laws</li>
              <li>Maintain only one active account</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-600 mb-4">Users are responsible for:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Maintaining account security</li>
              <li>Providing accurate information</li>
              <li>Updating account information as needed</li>
              <li>All activities occurring under their account</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Listing Rules</h2>
            <p className="text-gray-600 mb-4">All listings must:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Be for physical kitesurfing equipment only</li>
              <li>Include accurate descriptions and images</li>
              <li>Specify condition and any defects</li>
              <li>List a fair market price</li>
              <li>Not infringe on intellectual property rights</li>
              <li>Not be for counterfeit or stolen items</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Transaction Rules</h2>
            <p className="text-gray-600 mb-4">Users agree to:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Honor agreed-upon prices and terms</li>
              <li>Complete transactions as promised</li>
              <li>Not engage in price manipulation</li>
              <li>Not circumvent platform communication tools</li>
              <li>Report suspicious activity</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
            <p className="text-gray-600 mb-4">
              All platform content, features, and functionality are owned by Windgear and protected by international copyright, trademark, and other laws.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Content Guidelines</h2>
            <p className="text-gray-600 mb-4">User-generated content must not:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Be false, misleading, or deceptive</li>
              <li>Be offensive or inappropriate</li>
              <li>Contain harmful code or malware</li>
              <li>Violate others' rights</li>
              <li>Promote illegal activities</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Platform Modifications</h2>
            <p className="text-gray-600 mb-4">
              We reserve the right to modify or discontinue any aspect of Windgear at any time, with or without notice.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Dispute Resolution</h2>
            <p className="text-gray-600 mb-4">
              Any disputes between users must be resolved directly between the parties involved. Windgear is not responsible for mediating or resolving disputes.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>
            <p className="text-gray-600 mb-4">
              We may terminate or suspend your account immediately, without prior notice, for any violation of these Terms.
            </p>
          </section>

          <div className="text-sm text-gray-500 mt-8">
            Last Updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </>
  );
}

export default Terms;
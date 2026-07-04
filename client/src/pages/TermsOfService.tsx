import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <h1 className="font-bold text-lg">Terms of Service</h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Content */}
      <main className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-6 space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold mb-4">Terms of Service</h2>
            <p className="text-muted-foreground">Last updated: July 3, 2026</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h3>
            <p>
              By accessing and using PixelCraft ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">2. Use License</h3>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on PixelCraft for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained on PixelCraft</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
              <li>Uploading content that violates intellectual property rights or laws</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">3. Disclaimer</h3>
            <p>
              The materials on PixelCraft are provided on an 'as is' basis. PixelCraft makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">4. Limitations</h3>
            <p>
              In no event shall PixelCraft or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on PixelCraft, even if PixelCraft or an authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">5. Accuracy of Materials</h3>
            <p>
              The materials appearing on PixelCraft could include technical, typographical, or photographic errors. PixelCraft does not warrant that any of the materials on PixelCraft are accurate, complete, or current. PixelCraft may make changes to the materials contained on PixelCraft at any time without notice.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">6. Materials and Content</h3>
            <p>
              PixelCraft does not claim ownership of materials you upload. However, by uploading content to PixelCraft, you grant PixelCraft a non-exclusive, royalty-free license to store, process, and display your content for the purpose of providing the Service. You retain all rights to your content.
            </p>
            <p className="mt-2">
              You are responsible for ensuring that any content you upload does not infringe upon the intellectual property rights, privacy rights, or any other rights of third parties. PixelCraft reserves the right to remove content that violates these terms.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">7. Links</h3>
            <p>
              PixelCraft has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by PixelCraft of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">8. Modifications</h3>
            <p>
              PixelCraft may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">9. Governing Law</h3>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which PixelCraft operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">10. User Conduct</h3>
            <p>
              You agree not to use PixelCraft to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>Harass, threaten, embarrass, or cause distress or discomfort to any individual</li>
              <li>Engage in illegal activity or violate any applicable laws</li>
              <li>Transmit obscene or offensive content</li>
              <li>Disrupt the normal flow of dialogue within PixelCraft</li>
              <li>Attempt to gain unauthorized access to PixelCraft systems</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">11. Limitation of Liability</h3>
            <p>
              In no case shall PixelCraft, its suppliers, or other related parties be liable for any damages (including, without limitation, indirect, incidental, special, consequential, or punitive damages) arising out of or in connection with your use of PixelCraft, even if advised of the possibility of such damages.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3">12. Contact</h3>
            <p>
              If you have any questions about these Terms of Service, please contact us through the PixelCraft website.
            </p>
          </section>

          <section className="pt-8 border-t border-border">
            <p className="text-xs text-muted-foreground">
              © 2026 PixelCraft. All rights reserved. These terms constitute the entire agreement between you and PixelCraft regarding the use of the Service.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

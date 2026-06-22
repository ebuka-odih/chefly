import { LegalScreen } from '@/components/LegalScreen';

export default function Privacy() {
  return (
    <LegalScreen
      title="Privacy policy"
      updated="12 June 2026"
      intro="Chefly helps you cook with what you already have. We keep the data we collect to the minimum needed to do that well — and we never sell it."
      sections={[
        {
          heading: '1. Information we collect',
          body: [
            'Account details you give us: your name, email address and the taste preferences you set during onboarding.',
            'Cooking activity: the ingredients you enter or scan, recipes you generate, save or mark as cooked, and your streak.',
            'Device & usage data: app version, device type and anonymous interaction events that help us fix bugs and improve suggestions.',
          ],
        },
        {
          heading: '2. Photos and the camera',
          body: [
            'When you scan ingredients, the photo is processed to recognise what’s in it. Scans are used to generate your results and are not shared with other users.',
          ],
        },
        {
          heading: '3. How we use your information',
          body: [
            'To generate and personalise recipe suggestions, remember your saved meals and preferences, maintain your account, and improve the app over time.',
          ],
        },
        {
          heading: '4. How we share information',
          body: [
            'We do not sell your personal data. We share it only with trusted service providers who process it on our behalf — for example AI recipe generation, crash reporting and analytics — under strict confidentiality terms.',
          ],
        },
        {
          heading: '5. Data retention',
          body: [
            'We keep your information for as long as your account is active. When you delete your account, your personal data is removed from our systems, except where we’re legally required to retain it.',
          ],
        },
        {
          heading: '6. Your rights',
          body: [
            'You can access, correct or export your data, and delete your account at any time from Profile → Account → Delete account. For any other request, just email us.',
          ],
        },
        {
          heading: '7. Children',
          body: ['Chefly isn’t directed at children under 13, and we don’t knowingly collect their data.'],
        },
        {
          heading: '8. Changes to this policy',
          body: ['If we make material changes we’ll update the date above and, where appropriate, notify you in the app.'],
        },
        {
          heading: '9. Contact us',
          body: ['Questions about your privacy? Email privacy@chefly.app and we’ll get back to you.'],
        },
      ]}
    />
  );
}

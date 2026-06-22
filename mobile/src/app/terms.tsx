import { LegalScreen } from '@/components/LegalScreen';

export default function Terms() {
  return (
    <LegalScreen
      title="Terms of service"
      updated="12 June 2026"
      intro="By using Chefly you agree to these terms. Please read them — especially the part about food safety and allergies."
      sections={[
        {
          heading: '1. Using Chefly',
          body: [
            'We grant you a personal, non-transferable licence to use the Chefly app for your own cooking. You must be at least 13 years old to use it.',
          ],
        },
        {
          heading: '2. Your account',
          body: [
            'You’re responsible for keeping your account secure and for the activity that happens under it. Tell us straight away if you notice any unauthorised use.',
          ],
        },
        {
          heading: '3. Recipes and AI content',
          body: [
            'Recipes, nutrition figures and suggestions are generated automatically and are provided for general guidance only. They are estimates, not professional nutritional or medical advice.',
          ],
        },
        {
          heading: '4. Food safety & allergies',
          body: [
            'You are responsible for checking that ingredients are fresh, safe and suitable for you. Always verify allergens and cooking temperatures yourself. Chefly cannot guarantee that a recipe is free from any particular allergen.',
          ],
        },
        {
          heading: '5. Subscriptions & billing',
          body: [
            'Chefly may offer paid plans. Subscriptions renew automatically unless cancelled at least 24 hours before the period ends, and are managed through your app store account.',
          ],
        },
        {
          heading: '6. Acceptable use',
          body: [
            'Don’t misuse the service: no reverse engineering, scraping, or using Chefly to break the law or infringe other people’s rights.',
          ],
        },
        {
          heading: '7. Intellectual property',
          body: [
            'The Chefly name, app and design are owned by us. Content you create stays yours, but you grant us the licence needed to operate the service for you.',
          ],
        },
        {
          heading: '8. Disclaimers & liability',
          body: [
            'Chefly is provided “as is”. To the fullest extent permitted by law, we’re not liable for any loss arising from your use of the app or reliance on generated recipes.',
          ],
        },
        {
          heading: '9. Ending your access',
          body: [
            'You can stop using Chefly and delete your account at any time. We may suspend access if these terms are breached.',
          ],
        },
        {
          heading: '10. Changes to these terms',
          body: [
            'We may update these terms; we’ll revise the date above and, for significant changes, let you know in the app.',
          ],
        },
        {
          heading: '11. Contact',
          body: ['Need to reach us? Email hello@chefly.app.'],
        },
      ]}
    />
  );
}

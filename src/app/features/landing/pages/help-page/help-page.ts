import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpCategoriesButtonComponent } from '../../ui/help-categories-button/help-categories-button.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MailService } from '../../../../core/services/mail/mail.service';

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-help-page',
  imports: [CommonModule, HelpCategoriesButtonComponent, ReactiveFormsModule],
  templateUrl: './help-page.html',
})
export class HelpPage {
  mailService = inject(MailService);
  isSubmitting = signal(false);

  contactForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    message: new FormControl('', [Validators.required, Validators.minLength(10)]),
  });

  submitContactForm(): void {
    if (this.contactForm.invalid) return;

    this.isSubmitting.set(true);

    setTimeout(() => {
      try {
        this.mailService.sendMail({
          email: this.contactForm.value.email!,
          message: this.contactForm.value.message!,
        });
      } catch (error) {
        console.log('Error submitting contact form:', error);
      } finally {
        this.isSubmitting.set(false);
        this.contactForm.reset();
      }
    }, 3000);
  }

  get email() {
    return this.contactForm.get('email');
  }

  get message() {
    return this.contactForm.get('message');
  }

  selectedCategory = 'getting-started';

  faqs: FaqItem[] = [
    {
      id: 'signup',
      category: 'getting-started',
      question: 'How do I sign up for an account?',
      answer:
        'Signing up is easy! Just download the app, click on "Sign Up," and follow the prompts. You can use your email address, Google, or Facebook to create an account.',
      open: false,
    },
    {
      id: 'devices',
      category: 'getting-started',
      question: 'Can I access the app from multiple devices?',
      answer:
        'Yes! You can access your account from multiple devices by logging in with the same credentials. Your library and preferences will sync across all devices.',
      open: false,
    },
    {
      id: 'borrow',
      category: 'getting-started',
      question: 'How do I borrow a book?',
      answer:
        'Browse the available books, select the one you want, and click "Borrow." You can borrow up to 5 books at a time. Each book is available to borrow for 21 days.',
      open: false,
    },
    {
      id: 'offline',
      category: 'getting-started',
      question: 'Can I download books to read offline?',
      answer:
        'Yes, you can download books to read offline. Simply click the download icon on any borrowed book, and it will be saved to your device for offline reading.',
      open: false,
    },
    {
      id: 'pricing',
      category: 'members-pricing',
      question: 'What are the membership options?',
      answer:
        'We offer both free and premium membership tiers. The free tier includes access to a limited selection of books, while premium members get unlimited access to our entire library.',
      open: false,
    },
    {
      id: 'cancel',
      category: 'members-pricing',
      question: 'How do I cancel my membership?',
      answer:
        'You can cancel your membership anytime in your account settings under "Subscription." Your access will continue until the end of your current billing cycle.',
      open: false,
    },
    {
      id: 'requests',
      category: 'book-requests',
      question: 'How do I request a specific book?',
      answer:
        'Use the "Request a Book" feature in the app to suggest titles you\'d like to see added to our library. Our team reviews all requests and works to add popular titles.',
      open: false,
    },
    {
      id: 'recommendations',
      category: 'book-requests',
      question: 'How can I get personalized recommendations?',
      answer:
        'Browse books, rate the ones you\'ve read, and use the "Discover" section. The more you interact with books, the better our recommendation engine becomes.',
      open: false,
    },
    {
      id: 'password',
      category: 'technical',
      question: 'I forgot my password. How do I reset it?',
      answer:
        'Click "Forgot Password" on the login screen and enter your email. We\'ll send you a link to reset your password. Follow the instructions in the email.',
      open: false,
    },
    {
      id: 'bugs',
      category: 'technical',
      question: 'The app is crashing. What should I do?',
      answer:
        "Try restarting the app or your device. Make sure you're using the latest version from your app store. If the issue persists, try clearing the app cache in your device settings.",
      open: false,
    },
  ];

  get filteredFaqs(): FaqItem[] {
    return this.faqs.filter((faq) => faq.category === this.selectedCategory);
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    // Close all FAQs when switching categories
    this.faqs.forEach((faq) => (faq.open = false));
  }

  toggleFaq(id: string): void {
    const faq = this.faqs.find((f) => f.id === id);
    if (faq) {
      faq.open = !faq.open;
    }
  }
}

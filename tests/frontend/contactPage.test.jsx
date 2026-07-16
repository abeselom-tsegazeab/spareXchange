/**
 * ContactPage EmailJS Integration Test
 * Tests the contact form email sending functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactPage from '../src/pages/ContactPage';
import emailjs from '@emailjs/browser';
import toast from 'react-hot-toast';

// Mock dependencies
vi.mock('@emailjs/browser', () => ({
  default: {
    send: vi.fn()
  }
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock environment variables
const originalEnv = import.meta.env;

beforeEach(() => {
  vi.clearAllMocks();
  
  // Reset environment variables
  import.meta.env = {
    ...originalEnv,
    VITE_EMAILJS_SERVICE_ID: 'service_lix03wa',
    VITE_EMAILJS_TEMPLATE_ID: 'template_et2wvus',
    VITE_EMAILJS_PUBLIC_KEY: '35mp7E8Wbq60-dktV'
  };
});

describe('ContactPage - Email Sending Functionality', () => {
  
  describe('Form Rendering', () => {
    it('should render contact form with all fields', () => {
      render(<ContactPage />);
      
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
    });

    it('should render contact information', () => {
      render(<ContactPage />);
      
      expect(screen.getByText(/support@sparexchange.com/i)).toBeInTheDocument();
      expect(screen.getByText(/\+\(251\) 935-033-357/i)).toBeInTheDocument();
      expect(screen.getByText(/adama nazreth, bole/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should require all fields before submission', async () => {
      render(<ContactPage />);
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      fireEvent.click(submitButton);
      
      // HTML5 validation should prevent submission
      await waitFor(() => {
        expect(emailjs.send).not.toHaveBeenCalled();
      });
    });

    it('should validate email format', async () => {
      render(<ContactPage />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(emailjs.send).not.toHaveBeenCalled();
      });
    });
  });

  describe('Email Sending Success Flow', () => {
    it('should send email successfully with valid data', async () => {
      emailjs.send.mockResolvedValueOnce({ status: 200, text: 'OK' });
      
      render(<ContactPage />);
      
      // Fill form
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'Test User' }
      });
      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/subject/i), {
        target: { value: 'Test Subject' }
      });
      fireEvent.change(screen.getByLabelText(/message/i), {
        target: { value: 'Test message content' }
      });
      
      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));
      
      await waitFor(() => {
        expect(emailjs.send).toHaveBeenCalledWith(
          'service_lix03wa',
          'template_et2wvus',
          {
            from_name: 'Test User',
            from_email: 'test@example.com',
            subject: 'Test Subject',
            message: 'Test message content',
            to_name: 'SpareXchange Team',
            reply_to: 'test@example.com',
            user_name: 'Test User',
            user_email: 'test@example.com',
            contact_info: 'Name: Test User\nEmail: test@example.com\nSubject: Test Subject'
          },
          '35mp7E8Wbq60-dktV'
        );
      });
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          "Message sent successfully! We'll get back to you soon."
        );
      });
    });

    it('should show success message after successful submission', async () => {
      emailjs.send.mockResolvedValueOnce({ status: 200, text: 'OK' });
      
      render(<ContactPage />);
      
      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'Test User' }
      });
      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/subject/i), {
        target: { value: 'Test Subject' }
      });
      fireEvent.change(screen.getByLabelText(/message/i), {
        target: { value: 'Test message' }
      });
      
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument();
      });
    });

    it('should clear form after successful submission', async () => {
      emailjs.send.mockResolvedValueOnce({ status: 200, text: 'OK' });
      
      render(<ContactPage />);
      
      // Fill form
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'Test User' }
      });
      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/subject/i), {
        target: { value: 'Test Subject' }
      });
      fireEvent.change(screen.getByLabelText(/message/i), {
        target: { value: 'Test message' }
      });
      
      // Submit
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));
      
      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toHaveValue('');
        expect(screen.getByLabelText(/email address/i)).toHaveValue('');
        expect(screen.getByLabelText(/subject/i)).toHaveValue('');
        expect(screen.getByLabelText(/message/i)).toHaveValue('');
      });
    });
  });

  describe('Email Sending Error Flow', () => {
    it('should handle EmailJS service error', async () => {
      emailjs.send.mockRejectedValueOnce({
        status: 400,
        text: 'Service not found'
      });
      
      render(<ContactPage />);
      
      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'Test User' }
      });
      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/subject/i), {
        target: { value: 'Test Subject' }
      });
      fireEvent.change(screen.getByLabelText(/message/i), {
        target: { value: 'Test message' }
      });
      
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        expect(screen.getByText(/failed to send message/i)).toBeInTheDocument();
      });
    });

    it('should handle network error', async () => {
      emailjs.send.mockRejectedValueOnce(new Error('Network Error'));
      
      render(<ContactPage />);
      
      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'Test User' }
      });
      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/subject/i), {
        target: { value: 'Test Subject' }
      });
      fireEvent.change(screen.getByLabelText(/message/i), {
        target: { value: 'Test message' }
      });
      
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading state during submission', async () => {
      emailjs.send.mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve({ status: 200 }), 100))
      );
      
      render(<ContactPage />);
      
      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'Test User' }
      });
      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/subject/i), {
        target: { value: 'Test Subject' }
      });
      fireEvent.change(screen.getByLabelText(/message/i), {
        target: { value: 'Test message' }
      });
      
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sending/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
      });
    });

    it('should disable form inputs during submission', async () => {
      emailjs.send.mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve({ status: 200 }), 100))
      );
      
      render(<ContactPage />);
      
      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'Test User' }
      });
      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/subject/i), {
        target: { value: 'Test Subject' }
      });
      fireEvent.change(screen.getByLabelText(/message/i), {
        target: { value: 'Test message' }
      });
      
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));
      
      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeDisabled();
        expect(screen.getByLabelText(/email address/i)).toBeDisabled();
        expect(screen.getByLabelText(/subject/i)).toBeDisabled();
        expect(screen.getByLabelText(/message/i)).toBeDisabled();
      });
    });
  });

  describe('Configuration Validation', () => {
    it('should show error when EmailJS credentials are missing', async () => {
      import.meta.env.VITE_EMAILJS_SERVICE_ID = '';
      
      render(<ContactPage />);
      
      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/full name/i), {
        target: { value: 'Test User' }
      });
      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/subject/i), {
        target: { value: 'Test Subject' }
      });
      fireEvent.change(screen.getByLabelText(/message/i), {
        target: { value: 'Test message' }
      });
      
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Email service not configured. Please contact support.'
        );
      });
      
      expect(emailjs.send).not.toHaveBeenCalled();
    });
  });
});

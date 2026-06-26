import { useState, useCallback } from 'react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const API_BASE = 'http://localhost:5000/api';

const initialState = {
  name: '',
  email: '',
  subject: '',
  message: '',
  file: null,
};

const initialErrors = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

export function useContactForm() {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState(initialErrors);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = useCallback((vals) => {
    const errs = { ...initialErrors };
    let valid = true;

    if (!vals.name.trim()) {
      errs.name = 'Your name is required.';
      valid = false;
    } else if (vals.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters.';
      valid = false;
    }

    if (!vals.email.trim()) {
      errs.email = 'Email address is required.';
      valid = false;
    } else if (!EMAIL_REGEX.test(vals.email.trim())) {
      errs.email = 'Please enter a valid email address.';
      valid = false;
    }

    if (!vals.subject) {
      errs.subject = 'Please select a subject.';
      valid = false;
    }

    if (!vals.message.trim()) {
      errs.message = 'Message is required.';
      valid = false;
    } else if (vals.message.trim().length < 20) {
      errs.message = 'Message must be at least 20 characters.';
      valid = false;
    }

    return { errs, valid };
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setValues((prev) => ({ ...prev, [name]: files ? files[0] : null }));
    } else {
      setValues((prev) => ({ ...prev, [name]: value }));
    }
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (submitError) {
      setSubmitError('');
    }
  }, [errors, submitError]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const { errs, valid } = validate(values);
      if (!valid) {
        setErrors(errs);
        return;
      }

      setIsSubmitting(true);
      setSubmitError('');

      try {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('email', values.email);
        formData.append('subject', values.subject);
        formData.append('message', values.message);
        if (values.file) {
          formData.append('file', values.file);
        }

        const response = await fetch(`${API_BASE}/quotes`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to submit quote request. Please try again.');
        }

        setIsSuccess(true);
        setValues(initialState);
      } catch (err) {
        console.error('Error submitting quote:', err);
        setSubmitError(err.message || 'Cannot reach the server. Make sure the backend is running.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate]
  );

  const dismissSuccess = useCallback(() => {
    setIsSuccess(false);
  }, []);

  return {
    values,
    errors,
    submitError,
    isSubmitting,
    isSuccess,
    handleChange,
    handleSubmit,
    dismissSuccess,
  };
}

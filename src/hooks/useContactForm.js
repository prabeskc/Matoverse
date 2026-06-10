import { useState, useCallback } from 'react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialState = {
  name: '',
  email: '',
  subject: '',
  message: '',
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
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const { errs, valid } = validate(values);
      if (!valid) {
        setErrors(errs);
        return;
      }

      setIsSubmitting(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setIsSubmitting(false);
      setIsSuccess(true);
      setValues(initialState);
    },
    [values, validate]
  );

  const dismissSuccess = useCallback(() => {
    setIsSuccess(false);
  }, []);

  return {
    values,
    errors,
    isSubmitting,
    isSuccess,
    handleChange,
    handleSubmit,
    dismissSuccess,
  };
}

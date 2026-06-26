const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');

// ─── Helper: Mock Email Notification ─────────────────────────────────────────
const mockEmailNotification = (quote) => {
  const border = '─'.repeat(55);
  console.log('\n');
  console.log(`📧  [EMAIL MOCK] New Quote Request Received`);
  console.log(border);
  console.log(`  To:       hello@matoverse.io`);
  console.log(`  From:     ${quote.name} <${quote.email}>`);
  console.log(`  Subject:  [New Quote] ${quote.subject}`);
  console.log(`  Status:   ${quote.status}`);
  console.log(`  Time:     ${new Date(quote.created_at).toLocaleString('en-NP', { timeZone: 'Asia/Kathmandu' })} NPT`);
  console.log(border);
  console.log(`  Message Preview:`);
  console.log(`  "${quote.message.substring(0, 200)}${quote.message.length > 200 ? '...' : ''}"`);
  console.log(border);
  if (quote.file_url) {
    console.log(`  Attachment: ${quote.file_url}`);
  }
  console.log(`  📌 Quote ID: ${quote.id}`);
  console.log(`  Action:   Log in to the admin panel and review this request.`);
  console.log(border);
  console.log('\n');
};

// ─── Controller: POST /api/quotes ────────────────────────────────────────────
const submitQuote = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!email) missingFields.push('email');
    if (!subject) missingFields.push('subject');
    if (!message) missingFields.push('message');

    if (missingFields.length > 0) {
      return next(
        new AppError(`Missing required fields: ${missingFields.join(', ')}.`, 400)
      );
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return next(new AppError('Please provide a valid email address.', 400));
    }

    let file_url = null;
    if (req.file) {
      file_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    // Insert into Supabase quote_requests table
    const { data: quote, error } = await supabase
      .from('quote_requests')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        file_url: file_url,
        status: 'Pending',
      })
      .select()
      .single();

    if (error) {
      return next(new AppError(error.message, 400));
    }

    // Fire the mock email notification log
    mockEmailNotification(quote);

    res.status(201).json({
      status: 'success',
      message:
        "Thank you for your inquiry! We've received your quote request and will get back to you within 24 hours at hello@matoverse.io.",
      data: {
        quoteId: quote.id,
        name: quote.name,
        email: quote.email,
        subject: quote.subject,
        fileUrl: quote.file_url,
        status: quote.status,
        submittedAt: quote.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Controller: GET /api/quotes ─────────────────────────────────────────────
const getAllQuotes = async (req, res, next) => {
  try {
    let query = supabase
      .from('quote_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (req.query.status) {
      query = query.eq('status', req.query.status);
    }

    const { data: quotes, error } = await query;

    if (error) {
      return next(new AppError(error.message, 400));
    }

    res.status(200).json({
      status: 'success',
      results: quotes.length,
      data: { quotes },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitQuote, getAllQuotes };

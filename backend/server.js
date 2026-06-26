require('dotenv').config();
const app = require('./app');
const supabase = require('./config/supabase');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Main entry point for the Matoverse backend server.
 *
 * Startup sequence:
 * 1. Load environment variables (via dotenv at top)
 * 2. Connect/verify Supabase connectivity
 * 3. Start the HTTP server
 */
const startServer = async () => {
  // Verify Supabase config/connection first
  try {
    const { error } = await supabase.from('products').select('id').limit(1);
    if (error) {
      console.warn('⚠️  Supabase DB check returned error:', error.message);
      console.log('   (This is normal if database is not seeded yet)');
    } else {
      console.log('✅  Supabase DB connection verified.');
    }
  } catch (err) {
    console.error('❌  Supabase connection failed:', err.message);
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log('\n');
    console.log('══════════════════════════════════════════════════');
    console.log('  🖨️   MATOVERSE API SERVER');
    console.log('══════════════════════════════════════════════════');
    console.log(`  🚀  Server running on   http://localhost:${PORT}`);
    console.log(`  🌱  Environment:        ${NODE_ENV}`);
    console.log(`  ❤️   Health check:       http://localhost:${PORT}/api/health`);
    console.log('──────────────────────────────────────────────────');
    console.log('  📦  Routes mounted:');
    console.log(`       POST  /api/auth/signup`);
    console.log(`       POST  /api/auth/login`);
    console.log(`       GET   /api/auth/me`);
    console.log(`       GET   /api/products`);
    console.log(`       GET   /api/products/:id`);
    console.log(`       GET   /api/cart          [Protected]`);
    console.log(`       POST  /api/cart/add       [Protected]`);
    console.log(`       PUT   /api/cart/update    [Protected]`);
    console.log(`       DELETE /api/cart/remove/:id [Protected]`);
    console.log(`       DELETE /api/cart/clear    [Protected]`);
    console.log(`       POST  /api/quotes`);
    console.log(`       GET   /api/quotes         [Protected]`);
    console.log(`       POST  /api/orders`);
    console.log(`       GET   /api/orders/mine    [Protected]`);
    console.log('══════════════════════════════════════════════════');
    console.log('\n');
  });

  // ─── Graceful Shutdown ────────────────────────────────────────────────────
  // Handle SIGTERM (e.g., from process managers like PM2 or Docker)
  process.on('SIGTERM', () => {
    console.log('⚠️  SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('✅  HTTP server closed.');
      process.exit(0);
    });
  });

  // Handle SIGINT (Ctrl+C in terminal)
  process.on('SIGINT', () => {
    console.log('\n⚠️  SIGINT received. Shutting down gracefully...');
    server.close(() => {
      console.log('✅  HTTP server closed.');
      process.exit(0);
    });
  });

  // Handle unhandled promise rejections (should not happen but good safety net)
  process.on('unhandledRejection', (err) => {
    console.error('💥  UNHANDLED REJECTION:', err.name, err.message);
    console.error('   Shutting down server...');
    server.close(() => process.exit(1));
  });
};

startServer();

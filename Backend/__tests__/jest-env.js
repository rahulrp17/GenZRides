process.env.JWT_SECRET = "test-jwt-secret-min-32-characters-long";
process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-min-32-characters";
process.env.JWT_EXPIRE = "1h";
process.env.JWT_REFRESH_EXPIRES = "7d";
process.env.MONGO_URI = "";
process.env.RAZORPAY_KEY_ID = "rzp_test_dummy_key_id_12345";
process.env.RAZORPAY_KEY_SECRET = "rzp_test_dummy_key_secret_12345";
process.env.CLOUDINARY_CLOUD_NAME = "test";
process.env.CLOUDINARY_API_KEY = "test";
process.env.CLOUDINARY_API_SECRET = "test";
process.env.NODE_ENV = "test";
process.env.RAZORPAY_WEBHOOK_SECRET = "test-webhook-secret";
process.env.MONGOMS_DISABLE_MD5 = "true";
process.env.MONGOMS_VERSION = "7.0.20";
// Clear Redis config so tests use in-memory rate limiting
delete process.env.REDIS_HOST;
delete process.env.REDIS_PORT;

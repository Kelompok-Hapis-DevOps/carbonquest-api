// Deterministic environment for testing
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "super-secret-jwt-key-with-minimum-thirty-two-chars!";
process.env.PORT = "4000";

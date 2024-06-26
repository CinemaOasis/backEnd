// import aws from "aws-sdk";
import ip from "ip";
import path from "path";
import { Dialect } from "sequelize/types";

export const config = {
  root: path.normalize(`${__dirname}/..`),

  env: process.env.NODE_ENV || "development",

  aws: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    sessionToken: process.env.AWS_SESSION_TOKEN,
    region: process.env.AWS_REGION,
    s3: {
      fileBucketName: process.env.APP_AWS_FILE_BUCKET,
    },
  },

  stripe: {
    secretKey:
      process.env.STRIPE_SECRET_KEY ||
      "sk_test_51PSWWOKTvKKZFxxjWCfe9Cz4kL8354ulj6iK8JWkYV12O0YT4EBwIX7p6icNpigutcCURB0APLWFlYpSI3RUcCFV00TLyAKFQd",
    publishableKey:
      process.env.STRIPE_PUBLISHABLE_KEY ||
      "pk_test_51PSWWOKTvKKZFxxj4GPaec7bKRE5hw7I9S1lVrcSstAKZnI8irlGecs2t29ixBD5JJrFzHEJRt6G6lQfZ29aFINV00SzJ5zJPV",
  },

  jwt: {
    secret:
      process.env.JWT_SECRET || "tYw9UcCxYKHjOTzcIJPPgoQJxWc6kH177UuDY0l4Qsw",
    access: {
      expiry: {
        unit: "hours",
        length: process.env.JWT_EXPIRY_HOURS
          ? parseInt(process.env.JWT_EXPIRY_HOURS)
          : 30 * 24,
      },
      subject: "access",
      audience: "user",
    },
    refresh: {
      expiry: {
        unit: "months",
        length: 6,
      },
      subject: "refresh",
      audience: "user",
    },
    reset: {
      expiry: {
        unit: "hours",
        length: 12,
      },
      subject: "reset",
      audience: "user",
    },
    confirmEmail: {
      expiry: {
        unit: "hours",
        length: 12,
      },
      subject: "confirmEmail",
      audience: "user",
    },
    exchange: {
      expiry: {
        unit: "minutes",
        length: 10,
      },
      subject: "exchange",
      audience: "user",
    },
  },

  emailAuth: {
    requireEmailConfirmation:
      process.env.EMAIL_AUTH_REQUIRE_EMAIL_CONFIRMATION === "true",
    //emailConfirmUrl: process.env.CONFIRM_PAGE || "http://example.com/confirm",
    passwordResetUrl: process.env.RESET_PAGE || "http://example.com/reset",
    emailConfirmUrl: process.env.EMAIL_AUTH_URL,
    confirmRedirectUrl: process.env.EMAIL_AUTH_CONFIRM_REDIRECT_URL,
  },

  email: {
    from_address:
      process.env.EMAIL_FROM_ADDRESS || "Cinema Oasis <wanderdj77@gmail.com>",
    host: process.env.EMAIL_SMTP_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_SMPT_PORT
      ? parseInt(process.env.EMAIL_SMPT_PORT)
      : 587,
    secure: process.env.EMAIL_SMTP_SECURE
      ? process.env.EMAIL_SMTP_SECURE === "true"
      : true,
    auth: {
      user: process.env.EMAIL_SMTP_USER || "(your SMTP user)",
      pass: process.env.EMAIL_SMTP_PASS || "(your SMTP password)",
    },
    routes: {
      passwordRecovery: process.env.PASSWORD_RECOVERY_ROUTE,
    },
    defaultPassword: process.env.DEFAULT_PASSWORD || "adminadmin",
  },

  server: {
    port: process.env.SERVER_PORT || 8888,
  },

  api: {
    // Default limit and offset levels for responses
    limit: 99,
    offset: 0,
    // Show detailed error responses or not
    debug: true,
    order: [["id", "ASC"]],
  },

  log: {
    // Console Log levels: error, warn, info, verbose, debug, silly
    level: process.env.LOG_LEVEL || "debug",
    logToFiles: process.env.LOG_TO_FILES
      ? process.env.LOG_TO_FILES === "true"
      : false,
  },

  urls: {
    // Url config as seen from the user NOT NECESSARILY THE SAME AS SERVER
    // http or https
    protocol: process.env.URLS_PROTOCOL || "http",
    url: process.env.URLS_URL || ip.address(),
    port: process.env.URLS_PORT ? String(process.env.URLS_PORT) : "",
    apiRoot: process.env.URLS_API_ROOT || "/api/v1",
    base: "",
    baseApi: "",
  },

  db: {
    database: process.env.DB_NAME || "backgroundengagement-back",
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "test123",
    //host: process.env.DB_HOST || "localhost",
    host: process.env.DB_HOST || "database",
    dialect: (process.env.DB_TYPE || "postgres") as Dialect,
    logging: false,
    storage: process.env.DB_STORAGE || "db.sqlite",
    timezone: "utc", // IMPORTANT For correct timezone management with DB.
    encryptSecret: process.env.DB_ENCRYPT_SECRET,
  },
  swagger: {
    route: process.env.SWAGGER_ROUTE || "/swagger",
    username: process.env.SWAGGER_USERNAME || "admin",
    password: process.env.SWAGGER_PASSWORD || "password",
    hasAuth: process.env.SWAGGER_HAS_AUTH || false,
  },
  movie: {
    THE_MOVIE_DB_TOKEN: process.env.THE_MOVIE_DB_TOKEN,
    THE_MOVIE_DB_POSTER_URL:
      process.env.THE_MOVIE_DB_POSTER_URL || "http://image.tmdb.org/t/p/w500/",
    THE_MOVIE_DB_URL:
      process.env.THE_MOVIE_DB_URL ||
      "https://api.themoviedb.org/3/search/movie?",
    API_KEY: process.env.API_KEY,
  },
};

let portString = "";
if (Number.isInteger(parseInt(config.urls.port)))
  portString = `:${config.urls.port}`;

config.urls.base = `${config.urls.protocol}://${config.urls.url}${portString}`;
config.urls.baseApi = `${config.urls.base}${config.urls.apiRoot}`;

if (config.db.dialect === "sqlite") {
  // sqlite dialect doesn't support timezone and crashes if we pass one (it is utc by default anyway)
  delete config.db.timezone;
}

//AWS environment variables needed for s3

// aws.config.update({
//   secretAccessKey: config.aws.secretAccessKey,
//   accessKeyId: config.aws.accessKeyId,
//   sessionToken: config.aws.sessionToken,
//   region: config.aws.region,
// });

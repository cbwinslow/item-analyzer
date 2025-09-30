// Master settings and global variables
export const config = {
  // Deployment
  deployment: {
    local: process.env.NODE_ENV === 'development',
    remote: process.env.NODE_ENV === 'production',
    cloudflare: true,
    supabase: true,
  },

  // Supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },

  // Cloudflare
  cloudflare: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
    apiToken: process.env.CLOUDFLARE_API_TOKEN || '',
    zoneId: process.env.CLOUDFLARE_ZONE_ID || '',
  },

  // APIs
  apis: {
    stripe: {
      secret: process.env.STRIPE_SECRET_KEY || '',
      publishable: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    },
    ebay: process.env.EBAY_APP_ID || '',
    twilio: {
      sid: process.env.TWILIO_ACCOUNT_SID || '',
      token: process.env.TWILIO_AUTH_TOKEN || '',
      from: process.env.TWILIO_PHONE_NUMBER || '',
    },
    sendgrid: process.env.SENDGRID_API_KEY || '',
    n8n: process.env.N8N_WEBHOOK_URL || '',
    opensearch: process.env.OPENSEARCH_NODE || '',
    rabbitmq: {
      url: process.env.RABBITMQ_URL || '',
      user: process.env.RABBITMQ_USER || '',
      pass: process.env.RABBITMQ_PASS || '',
    },
  },

  // Security
  security: {
    enableFirewall: true,
    logIPs: true,
    encryptData: true,
    compliance: {
      gdpr: true,
      ccpa: true,
    },
  },

  // Features
  features: {
    auth: true,
    payments: true,
    ai: true,
    search: true,
    workflows: true,
  },

  // MCP Servers
  mcpServers: {
    filesystem: {
      enabled: true,
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
    },
    git: {
      enabled: true,
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-git', '--repository', '.'],
    },
    sqlite: {
      enabled: true,
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-sqlite', '--db-path', 'data.db'],
    },
  },
};
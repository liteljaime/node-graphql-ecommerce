import { User } from './schemas/User'
import { Product } from './schemas/Product'
import { ProductImage } from './schemas/ProductImage'
import { createAuth } from '@keystone-next/auth'
import { config , createSchema } from '@keystone-next/keystone/schema'
import { withItemData, statelessSessions } from '@keystone-next/keystone/session'
import { insertSeedData } from './seed-data'
import 'dotenv/config'

const dataBaseUrl = process.env.DATABASE_URL || 'mongodb://localhost/keystone-sickfits'

const sessionConfig = {
  maxAge: 60 * 60 * 24 * 365,
  secret: process.env.COOKIE_SECRET,
}

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
  },
  passwordResetLink: {
    async sendToken(args) {
      console.log(args);
    }
  }
})

export default withAuth(config({
  server: {
    cors: {
      origin: [process.env.FRONTEND_URL],
      credentials: true,
    }
  },
  db: {
    adapter: 'mongoose',
    url: dataBaseUrl,
    async onConnect(keystone) {
      console.log('connected to DB');
      if (process.argv.includes('--seed-data')) {
        await insertSeedData(keystone)
      }
    }
  },
  lists: createSchema({
    //schema goes in here
    User,
    Product,
    ProductImage
  }),
  ui: {
    isAccessAllowed: ({ session }) => {
      return !!session?.data
    },
  },
  session: withItemData(statelessSessions(sessionConfig), {
    User: 'id name'
  })
}))
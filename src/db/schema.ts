import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name').default('Saumay').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const lobbies = pgTable('lobbies', {
  code: text('code').primaryKey(),
  title: text('title').notNull(),
  hostName: text('host_name').notNull(),
  hostId: text('host_id').notNull(),
  mode: text('mode').notNull(),
  centralHub: text('central_hub').notNull(),
  departureTime: text('departure_time').notNull(),
  activePings: integer('active_pings').default(5).notNull(),
  lastPingBy: text('last_ping_by').notNull(),
  sosActive: boolean('sos_active').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const squadMembers = pgTable('squad_members', {
  id: text('id').primaryKey(),
  lobbyCode: text('lobby_code').notNull(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  initials: text('initials').notNull(),
  gender: text('gender').notNull(),
  location: text('location').notNull(),
  curfew: text('curfew').notNull(),
  accompanyingDetails: text('accompanying_details').notNull(),
  budget: integer('budget').notNull(),
  phone: text('phone').notNull(),
  leaveByTime: text('leave_by_time').notNull(),
  transitMins: integer('transit_mins').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const pollOptions = pgTable('poll_options', {
  id: text('id').primaryKey(),
  lobbyCode: text('lobby_code').notNull(),
  title: text('title').notNull(),
  subtitle: text('subtitle').notNull(),
  votes: integer('votes').default(1).notNull(),
  createdBy: text('created_by').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const areaReviews = pgTable('area_reviews', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  authorName: text('author_name').notNull(),
  areaName: text('area_name').notNull(),
  safetyRating: integer('safety_rating').notNull(),
  lightingStatus: text('lighting_status').notNull(),
  issueFlag: text('issue_flag').notNull(),
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  reviews: many(areaReviews),
}));

export const areaReviewsRelations = relations(areaReviews, ({ one }) => ({
  author: one(users, {
    fields: [areaReviews.userId],
    references: [users.uid],
  }),
}));

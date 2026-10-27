import { desc, eq } from 'drizzle-orm';
import { db } from './index.ts';
import {
  areaReviews,
  lobbies,
  pollOptions,
  squadMembers,
  users,
} from './schema.ts';

export async function getOrCreateUser(uid: string, email: string, displayName: string) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed in getOrCreateUser:', error);
    throw new Error('Failed to synchronize user profile.', { cause: error });
  }
}

export async function getLobbySnapshotFromSql(lobbyCode: string) {
  try {
    const [lobbyRows, memberRows, pollRows, reviewRows] = await Promise.all([
      db.select().from(lobbies).where(eq(lobbies.code, lobbyCode)),
      db.select().from(squadMembers).where(eq(squadMembers.lobbyCode, lobbyCode)),
      db.select().from(pollOptions).where(eq(pollOptions.lobbyCode, lobbyCode)),
      db.select().from(areaReviews).orderBy(desc(areaReviews.createdAt)),
    ]);

    return {
      lobby: lobbyRows[0] || null,
      members: memberRows,
      polls: pollRows,
      reviews: reviewRows,
    };
  } catch (error) {
    console.error('Database query failed in getLobbySnapshotFromSql:', error);
    throw new Error('Failed to load lobby state.', { cause: error });
  }
}

export async function upsertLobbyInSql(payload: {
  code: string;
  title: string;
  hostName: string;
  hostId: string;
  mode: string;
  centralHub: string;
  departureTime: string;
  activePings: number;
  lastPingBy: string;
  sosActive: boolean;
}) {
  try {
    const result = await db
      .insert(lobbies)
      .values({
        code: payload.code,
        title: payload.title,
        hostName: payload.hostName,
        hostId: payload.hostId,
        mode: payload.mode,
        centralHub: payload.centralHub,
        departureTime: payload.departureTime,
        activePings: payload.activePings,
        lastPingBy: payload.lastPingBy,
        sosActive: payload.sosActive,
      })
      .onConflictDoUpdate({
        target: lobbies.code,
        set: {
          title: payload.title,
          hostName: payload.hostName,
          mode: payload.mode,
          centralHub: payload.centralHub,
          departureTime: payload.departureTime,
          activePings: payload.activePings,
          lastPingBy: payload.lastPingBy,
          sosActive: payload.sosActive,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed in upsertLobbyInSql:', error);
    throw new Error('Failed to save lobby.', { cause: error });
  }
}

export async function upsertSquadMemberInSql(payload: {
  id: string;
  lobbyCode: string;
  userId: string;
  name: string;
  initials: string;
  gender: string;
  location: string;
  curfew: string;
  accompanyingDetails: string;
  budget: number;
  phone: string;
  leaveByTime: string;
  transitMins: number;
}) {
  try {
    const result = await db
      .insert(squadMembers)
      .values({
        id: payload.id,
        lobbyCode: payload.lobbyCode,
        userId: payload.userId,
        name: payload.name,
        initials: payload.initials,
        gender: payload.gender,
        location: payload.location,
        curfew: payload.curfew,
        accompanyingDetails: payload.accompanyingDetails,
        budget: payload.budget,
        phone: payload.phone,
        leaveByTime: payload.leaveByTime,
        transitMins: payload.transitMins,
      })
      .onConflictDoUpdate({
        target: squadMembers.id,
        set: {
          name: payload.name,
          initials: payload.initials,
          gender: payload.gender,
          location: payload.location,
          curfew: payload.curfew,
          accompanyingDetails: payload.accompanyingDetails,
          budget: payload.budget,
          phone: payload.phone,
          leaveByTime: payload.leaveByTime,
          transitMins: payload.transitMins,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed in upsertSquadMemberInSql:', error);
    throw new Error('Failed to save member preferences.', { cause: error });
  }
}

export async function upsertPollOptionInSql(payload: {
  id: string;
  lobbyCode: string;
  title: string;
  subtitle: string;
  votes: number;
  createdBy: string;
}) {
  try {
    const result = await db
      .insert(pollOptions)
      .values({
        id: payload.id,
        lobbyCode: payload.lobbyCode,
        title: payload.title,
        subtitle: payload.subtitle,
        votes: payload.votes,
        createdBy: payload.createdBy,
      })
      .onConflictDoUpdate({
        target: pollOptions.id,
        set: {
          votes: payload.votes,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed in upsertPollOptionInSql:', error);
    throw new Error('Failed to save poll option.', { cause: error });
  }
}

export async function insertAreaReviewInSql(payload: {
  id: string;
  userId: string;
  authorName: string;
  areaName: string;
  safetyRating: number;
  lightingStatus: string;
  issueFlag: string;
  comment: string;
}) {
  try {
    const result = await db
      .insert(areaReviews)
      .values({
        id: payload.id,
        userId: payload.userId,
        authorName: payload.authorName,
        areaName: payload.areaName,
        safetyRating: payload.safetyRating,
        lightingStatus: payload.lightingStatus,
        issueFlag: payload.issueFlag,
        comment: payload.comment,
      })
      .onConflictDoUpdate({
        target: areaReviews.id,
        set: {
          safetyRating: payload.safetyRating,
          lightingStatus: payload.lightingStatus,
          issueFlag: payload.issueFlag,
          comment: payload.comment,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed in insertAreaReviewInSql:', error);
    throw new Error('Failed to save area safety review.', { cause: error });
  }
}

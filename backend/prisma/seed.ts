/**
 * Seeds the sport catalogue from packages/core (all environments) and, outside production,
 * the fictional demo athletes from the original prototype.
 * Run with `pnpm db:seed` (also runs after `prisma migrate reset`).
 */
import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { ageTier, SPORTS } from '@touchline/core';

import { PrismaClient } from '../src/generated/prisma/client.js';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

async function seedCatalogue() {
  for (const sport of SPORTS) {
    await prisma.sport.upsert({
      where: { key: sport.key },
      create: {
        key: sport.key,
        labelKey: sport.labelKey,
        enabled: sport.enabled,
        seasonFormat: sport.seasonFormat,
        terminology: { ...sport.terminology },
      },
      update: { labelKey: sport.labelKey, enabled: sport.enabled, terminology: { ...sport.terminology } },
    });
    for (const [sortOrder, position] of sport.positions.entries()) {
      await prisma.position.upsert({
        where: { sportKey_key: { sportKey: sport.key, key: position.key } },
        create: { sportKey: sport.key, key: position.key, labelKey: position.labelKey, sortOrder },
        update: { labelKey: position.labelKey, sortOrder },
      });
    }
    for (const [sortOrder, skill] of sport.skillCategories.entries()) {
      await prisma.skillCategory.upsert({
        where: { sportKey_key: { sportKey: sport.key, key: skill.key } },
        create: { sportKey: sport.key, key: skill.key, labelKey: skill.labelKey, sortOrder },
        update: { labelKey: skill.labelKey, sortOrder },
      });
    }
    for (const { key, labelKey, type, required, ...rules } of sport.attributes) {
      await prisma.attributeDefinition.upsert({
        where: { sportKey_key: { sportKey: sport.key, key } },
        create: { sportKey: sport.key, key, labelKey, type, required, rules: { ...rules } },
        update: { labelKey, type, required, rules: { ...rules } },
      });
    }
  }
}

const DEMO_ATHLETES = [
  { handle: 'ayo-martins', name: 'Ayo Martins', position: 'forward', country: 'NG', foot: 'right', dob: '2003-04-12',
    chapters: [['2025/26', 'Lagos City FC'], ['2024/25', 'Mainland United'], ['2023/24', 'Mainland United']] },
  { handle: 'ella-brooks', name: 'Ella Brooks', position: 'midfielder', country: 'GB', foot: 'left', dob: '2001-09-30',
    chapters: [['2025/26', 'East London Athletic'], ['2024/25', 'Northside Women']] },
  { handle: 'samuel-okoro', name: 'Samuel Okoro', position: 'defender', country: 'NG', foot: 'right', dob: '2002-01-18',
    chapters: [['2025/26', 'Coastal Rovers'], ['2024/25', 'Lagos City FC']] },
  { handle: 'leo-ferreira', name: 'Leo Ferreira', position: 'goalkeeper', country: 'PT', foot: 'right', dob: '2000-06-05',
    chapters: [['2025/26', 'Vila Nova Athletic'], ['2024/25', 'Vila Nova Athletic']] },
] as const;

const DEMO_VIDEOS = [
  { athlete: 'ayo-martins', title: 'A season of finding the net', headline: 'Made for the moment', skill: 'goals', season: '2025/26' },
  { athlete: 'ella-brooks', title: 'Seeing the pass before everyone else', headline: 'A different vision', skill: 'assists', season: '2025/26' },
  { athlete: 'samuel-okoro', title: 'The art of winning it back', headline: 'Nothing gets through', skill: 'defending', season: '2025/26' },
  { athlete: 'leo-ferreira', title: 'Big saves. Bigger moments.', headline: 'The last line', skill: 'goalkeeping', season: '2025/26' },
  { athlete: 'ayo-martins', title: 'Where the journey started', headline: 'Before the spotlight', skill: 'skills', season: '2023/24' },
  { athlete: 'ella-brooks', title: 'One season. A new level.', headline: 'Every touch matters', skill: 'full_match', season: '2024/25' },
] as const;

async function seedDemo() {
  const preferredFoot = await prisma.attributeDefinition.findUniqueOrThrow({
    where: { sportKey_key: { sportKey: 'football', key: 'preferred_foot' } },
  });
  for (const athlete of DEMO_ATHLETES) {
    const dateOfBirth = new Date(`${athlete.dob}T00:00:00Z`);
    const user = await prisma.user.upsert({
      where: { email: `${athlete.handle}@demo.touchline.invalid` },
      create: { email: `${athlete.handle}@demo.touchline.invalid`, dateOfBirth, ageTier: ageTier(dateOfBirth), country: athlete.country },
      update: {},
    });
    const position = await prisma.position.findUniqueOrThrow({
      where: { sportKey_key: { sportKey: 'football', key: athlete.position } },
    });
    const profile = await prisma.athleteProfile.upsert({
      where: { handle: athlete.handle },
      create: {
        userId: user.id,
        sportKey: 'football',
        handle: athlete.handle,
        displayName: athlete.name,
        positionId: position.id,
        country: athlete.country,
        attributes: { create: { definitionId: preferredFoot.id, value: athlete.foot } },
      },
      update: {},
    });
    for (const [season, orgName] of athlete.chapters) {
      const organization =
        (await prisma.organization.findFirst({ where: { sportKey: 'football', name: orgName } })) ??
        (await prisma.organization.create({ data: { sportKey: 'football', name: orgName, country: athlete.country } }));
      await prisma.chapter.upsert({
        where: { profileId_organizationId_season: { profileId: profile.id, organizationId: organization.id, season } },
        create: { profileId: profile.id, organizationId: organization.id, season },
        update: {},
      });
    }
  }

  if ((await prisma.video.count()) > 0) return;
  for (const [index, video] of DEMO_VIDEOS.entries()) {
    const profile = await prisma.athleteProfile.findUniqueOrThrow({ where: { handle: video.athlete } });
    const chapter = await prisma.chapter.findFirstOrThrow({ where: { profileId: profile.id, season: video.season } });
    const skill = await prisma.skillCategory.findUniqueOrThrow({
      where: { sportKey_key: { sportKey: 'football', key: video.skill } },
    });
    await prisma.video.create({
      data: {
        profileId: profile.id,
        uploaderId: profile.userId,
        chapterId: chapter.id,
        title: video.title,
        headline: video.headline,
        status: 'published',
        publishedAt: new Date(Date.now() - index * 86_400_000),
        skills: { create: { skillCategoryId: skill.id } },
      },
    });
  }
}

await seedCatalogue();
if (process.env.NODE_ENV !== 'production') await seedDemo();
await prisma.$disconnect();
console.log('Seed complete');

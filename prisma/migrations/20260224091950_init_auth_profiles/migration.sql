-- CreateEnum
CREATE TYPE "ProfileType" AS ENUM ('ARTIST', 'GROUP', 'INSTITUTION', 'LABEL');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('OWNER', 'ADMIN', 'EDITOR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "activeProfileId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "type" "ProfileType" NOT NULL,
    "handle" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "location" TEXT,
    "links" JSONB,
    "instruments" TEXT[],
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'EDITOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "id" TEXT NOT NULL,
    "followerProfileId" TEXT NOT NULL,
    "followingProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Block" (
    "id" TEXT NOT NULL,
    "blockerProfileId" TEXT NOT NULL,
    "blockedProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mute" (
    "id" TEXT NOT NULL,
    "muterProfileId" TEXT NOT NULL,
    "mutedProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_handle_key" ON "Profile"("handle");

-- CreateIndex
CREATE INDEX "ProfileMember_profileId_idx" ON "ProfileMember"("profileId");

-- CreateIndex
CREATE INDEX "ProfileMember_userId_idx" ON "ProfileMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileMember_userId_profileId_key" ON "ProfileMember"("userId", "profileId");

-- CreateIndex
CREATE INDEX "Follow_followingProfileId_idx" ON "Follow"("followingProfileId");

-- CreateIndex
CREATE INDEX "Follow_followerProfileId_idx" ON "Follow"("followerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerProfileId_followingProfileId_key" ON "Follow"("followerProfileId", "followingProfileId");

-- CreateIndex
CREATE INDEX "Block_blockedProfileId_idx" ON "Block"("blockedProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Block_blockerProfileId_blockedProfileId_key" ON "Block"("blockerProfileId", "blockedProfileId");

-- CreateIndex
CREATE INDEX "Mute_mutedProfileId_idx" ON "Mute"("mutedProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Mute_muterProfileId_mutedProfileId_key" ON "Mute"("muterProfileId", "mutedProfileId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_activeProfileId_fkey" FOREIGN KEY ("activeProfileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileMember" ADD CONSTRAINT "ProfileMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileMember" ADD CONSTRAINT "ProfileMember_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerProfileId_fkey" FOREIGN KEY ("followerProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingProfileId_fkey" FOREIGN KEY ("followingProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockerProfileId_fkey" FOREIGN KEY ("blockerProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockedProfileId_fkey" FOREIGN KEY ("blockedProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mute" ADD CONSTRAINT "Mute_muterProfileId_fkey" FOREIGN KEY ("muterProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mute" ADD CONSTRAINT "Mute_mutedProfileId_fkey" FOREIGN KEY ("mutedProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

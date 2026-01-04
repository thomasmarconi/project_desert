-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashed_password" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_superuser" BOOLEAN NOT NULL DEFAULT false,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "focusedViceId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vice" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,

    CONSTRAINT "Vice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AsceticismCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "AsceticismCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AsceticismLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "categoryId" TEXT,
    "viceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AsceticismLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Vice_name_key" ON "Vice"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AsceticismCategory_name_key" ON "AsceticismCategory"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_focusedViceId_fkey" FOREIGN KEY ("focusedViceId") REFERENCES "Vice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsceticismLog" ADD CONSTRAINT "AsceticismLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsceticismLog" ADD CONSTRAINT "AsceticismLog_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AsceticismCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsceticismLog" ADD CONSTRAINT "AsceticismLog_viceId_fkey" FOREIGN KEY ("viceId") REFERENCES "Vice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

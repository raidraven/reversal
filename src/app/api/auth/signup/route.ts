import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { AVATARS, computeInitialSkills } from "@/lib/onboarding";

const signupSchema = z.object({
  name: z.string().min(1, "名前を入力してください").max(30, "名前は30文字以内で入力してください"),
  email: z.string().email("メールアドレスの形式が正しくありません"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください").max(72),
  avatarId: z.enum(AVATARS.map((a) => a.id) as [string, ...string[]]),
  answers: z.object({
    writing: z.number().int().min(1).max(3),
    toolUsage: z.number().int().min(1).max(3),
    publishing: z.number().int().min(1).max(3),
  }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" },
        { status: 400 }
      );
    }

    const { name, email, password, avatarId, answers } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const skills = computeInitialSkills(answers);

    await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        avatarId,
        skillScore: { create: skills },
        streak: { create: {} },
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("signup error:", e);
    return NextResponse.json(
      { error: "登録に失敗しました。時間をおいて再度お試しください" },
      { status: 500 }
    );
  }
}

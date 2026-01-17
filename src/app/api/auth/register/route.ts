import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Registration attempt:', { email: body.email });

    // Validate input
    const validatedData = registerSchema.parse(body);
    const { firstName, middleName, lastName, email, password } = validatedData;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    console.log('User exists check:', !!existingUser);

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        middleName,
        lastName,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      }
    });

    return NextResponse.json({
      success: true,
      user,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

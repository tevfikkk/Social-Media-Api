import bcrypt from 'bcrypt'
import cookie from 'cookie'
import { Request, Response, Router } from 'express'
import jwt from 'jsonwebtoken'

import prisma from '../lib/prisma'

export const router: Router = Router()

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/signup', async (req: Request, res: Response) => {
  const {
    email,
    name,
    password
  }: {
    email: string
    name: string
    password: string
  } = req.body

  // Check if user already exists
  const user = await prisma.user.findUnique({
    where: {
      email
    }
  })

  user ? res.status(400).send({ error: 'User already exists' }) : null

  // Salt and hash the password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  // Create the user
  const newUser = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword // The password is hashed
    }
  })

  // Generate token for the user
  const token = jwt.sign(
    {
      email,
      id: newUser.id
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: '8h'
    }
  )

  // Set the cookie with the token
  res.setHeader(
    'Set-Cookie',
    cookie.serialize('token', token, {
      httpOnly: true,
      maxAge: 86400000,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
  )

  // Send the user back
  res.json({ message: 'User created', user: newUser })
})

/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from 'bcrypt'
import cookie from 'cookie'
import { Request, Response, Router } from 'express'
import jwt from 'jsonwebtoken'

import prisma from '../lib/prisma'

export const authRouter: Router = Router()

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
authRouter.post('/signup', async (req: Request, res: Response) => {
  // Get email and password from request body
  const {
    name,
    email,
    password
  }: {
    name: string
    email: string
    password: string
  } = req.body

  // Find if user already exists
  const userExist = await prisma.user.findUnique({
    where: {
      email
    }
  })

  if (userExist) {
    return res.status(400).json({
      error: 'User already exists'
    })
  }

  // Generate salt
  const salt = bcrypt.genSaltSync()

  // Hash password
  const hashedPassword = bcrypt.hashSync(password, salt)

  // Create new user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword // Hash password
    }
  })

  // Generate token for user
  const token = jwt.sign(
    {
      email: user.email,
      id: user.id,
      time: Date.now()
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: '8h'
    }
  )

  // Set cookie with token
  res.setHeader(
    'Set-Cookie',
    cookie.serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400000,
      path: '/'
    })
  )

  // Return user
  res.status(200).json(user)
})

// @route   POST api/auth/login
// @desc    Login a user
// @access  Public
authRouter.post('/signin', async (req: Request, res: Response) => {
  const {
    email,
    password
  }: {
    email: string
    password: string
  } = req.body

  // email and password are required
  if (!email || !password) {
    return res.status(400).json({
      error: 'Please provide email and password'
    })
  }

  // if the user already logged in
  if (req.cookies.token) {
    return res.status(400).json({
      error: 'You are already logged in'
    })
  }

  // Find the user
  const user = await prisma.user.findUnique({
    where: {
      email
    }
  })
  if (user && bcrypt.compareSync(password, user.password)) {
    // Generate token for the user
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        time: Date.now()
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: '8h'
      }
    )

    // Set token and cookie at the header
    res.setHeader(
      'Set-Cookie',
      cookie.serialize('token', token, {
        httpOnly: true,
        maxAge: 8 * 60 * 60,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      })
    )

    res.status(200).json(user)
  } else {
    res.status(401).json({
      error: 'Email or password is incorrect'
    })
  }
})

// @route   POST api/auth/logout
// @desc    Logout a user
// @access  Public
authRouter.post('/logout', (req: Request, res: Response) => {
  if (req.cookies.token) {
    res.setHeader(
      'Set-Cookie',
      cookie.serialize('token', '', {
        httpOnly: true,
        maxAge: 8 * 60 * 60,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      })
    )
    res.json({ message: 'Logged out' })
  } else {
    res.status(400).json({
      error: 'No user logged in'
    })
  }
})

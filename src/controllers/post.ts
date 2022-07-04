import { Request, Response, Router } from 'express'
import jwt from 'jsonwebtoken'

import prisma from '../lib/prisma'

export const postRouter: Router = Router()

// @route   POST api/post
// @desc    Create a post
// @access  Private
postRouter.post('/post', async (req: Request, res: Response) => {
  // Get the user from the request body
  const {
    title,
    content
  }: {
    title: string
    content: string
  } = req.body

  // Check if the cookie is at the header
  if (!req.cookies.token) {
    return res.status(401).json({
      error: 'You must be logged in to create a post'
    })
  }

  // token is required
  const token = jwt.verify(
    req.cookies.token,
    process.env.JWT_SECRET as string
  ) as { id: string }

  // Create the post
  const post = await prisma.post
    .create({
      data: {
        title,
        content,
        user: {
          connect: {
            id: token?.id
          }
        }
      }
    })
    .catch((err: Error) => res.status(500).json({ error: err.message }))

  // Return the post
  res.status(201).json(post)
})

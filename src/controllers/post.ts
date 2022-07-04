import { Request, Response, Router } from 'express'
import jwt from 'jsonwebtoken'

import prisma from '../lib/prisma'

export const postRouter: Router = Router()

// @route   GET api/post
// @desc    Get all posts
// @access  Public
postRouter.get('/', async (req: Request, res: Response) => {
  // Get all posts
  const posts = await prisma.post.findMany({
    include: {
      user: true
    }
  })
  res.status(200).json(posts)
})

// @route   GET api/post/:id
// @desc    Get a post by id
// @access  Private
postRouter.get('/:id', async (req: Request, res: Response) => {
  // Check if cookie is set
  if (!req.cookies.token) {
    return res.status(401).json({
      error: 'You must be logged in to access this resource'
    })
  }

  // Check if post exists
  const ifPostExists = await prisma.post.findUnique({
    where: {
      id: req.params.id
    }
  })

  if (!ifPostExists) {
    return res.status(404).json({
      error: 'Post not found'
    })
  }

  // Get the post by id
  const post = await prisma.post.findUnique({
    where: {
      id: req.params.id
    },
    include: {
      user: true
    }
  })
  res.status(200).json(post)
})

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

// @route   PUT api/post/:id
// @desc    Update a post
// @access  Private
postRouter.put('/:id', async (req: Request, res: Response) => {
  // Check if cookie is set
  if (!req.cookies.token) {
    return res.status(401).json({
      error: 'You must be logged in to update a post'
    })
  }

  // Check if post exists
  const ifPostExists = await prisma.post.findUnique({
    where: {
      id: req.params.id
    }
  })

  if (!ifPostExists) {
    return res.status(404).json({
      error: 'Post not found to update'
    })
  }

  // Get the user from the request body
  const {
    title,
    content
  }: {
    title: string
    content: string
  } = req.body

  // token is required
  const token = jwt.verify(
    req.cookies.token,
    process.env.JWT_SECRET as string
  ) as { id: string }

  // Update the post
  const post = await prisma.post
    .update({
      where: {
        id: req.params.id
      },
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
  res.status(200).json(post)
})

// @route   DELETE api/post/:id
// @desc    Delete a post
// @access  Private
postRouter.delete('/:id', async (req: Request, res: Response) => {
  // Check if cookie is set
  if (!req.cookies.token) {
    return res.status(401).json({
      error: 'You must be logged in to delete a post'
    })
  }

  // Check if post exists
  const ifPostExists = await prisma.post.findUnique({
    where: {
      id: req.params.id
    }
  })

  if (!ifPostExists) {
    return res.status(404).json({
      error: 'Post not found to delete'
    })
  }

  // Delete the post
  await prisma.post
    .delete({
      where: {
        id: req.params.id
      },
      include: { user: true }
    })
    .then(() => res.status(200).json({ message: 'Post deleted' }))
    .catch((err: Error) => res.status(500).json({ error: err.message }))
})

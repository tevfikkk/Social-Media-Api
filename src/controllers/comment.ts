import { Request, Response, Router } from 'express'

import prisma from '../lib/prisma'

export const commentRouter: Router = Router()

// @route   GET api/comment
// @desc    Get all comments
// @access  Public
commentRouter.get('/', async (req: Request, res: Response) => {
  // Get all comments
  const comments = await prisma.comment.findMany({
    include: {
      post: true
    }
  })

  res.status(200).json(comments)
})

// @route   GET api/comment/:id
// @desc    Get a comment by id
// @access  Private
commentRouter.get('/:id', async (req: Request, res: Response) => {
  // Check if cookie is set
  if (!req.cookies.token) {
    return res.status(401).json({
      error: 'You must be logged in to access this resource'
    })
  }

  // Check if comment exists
  const ifCommentExists = await prisma.comment.findUnique({
    where: {
      id: req.params.id
    }
  })

  if (!ifCommentExists) {
    return res.status(404).json({
      error: 'Comment not found'
    })
  }

  // Get the comment by id
  const comment = await prisma.comment.findUnique({
    where: {
      id: req.params.id
    },
    include: {
      post: true
    }
  })

  res.status(200).json(comment)
})

// @route   POST api/comment
// @desc    Create a comment
// @access  Private
commentRouter.post('/:id', async (req: Request, res: Response) => {
  // Get the user from the request body
  const { comment }: { comment: string } = req.body

  // content is required
  if (!comment) {
    return res.status(400).json({
      error: 'Please provide comment'
    })
  }

  // Check if cookie is set
  if (!req.cookies.token) {
    return res.status(401).json({
      error: 'You must be logged in to create a comment'
    })
  }

  // Create the comment
  const newComment = await prisma.comment
    .create({
      data: {
        comment,
        post: {
          connect: {
            id: req.params.id // Post id
          }
        }
      }
    })
    .catch((err: Error) => {
      console.log(err)
    })

  res.status(201).json(newComment)
})

// @route   PUT api/comment/:id
// @desc    Update a comment
// @access  Private
commentRouter.put('/:id', async (req: Request, res: Response) => {
  // Get the user from the request body
  const { comment }: { comment: string } = req.body

  // content is required
  if (!comment) {
    return res.status(400).json({
      error: 'Please provide comment'
    })
  }

  // Check if cookie is set
  if (!req.cookies.token) {
    return res.status(401).json({
      error: 'You must be logged in to update a comment'
    })
  }

  // Check if comment exists
  const ifCommentExists = await prisma.comment.findUnique({
    where: {
      id: req.params.id
    }
  })

  if (!ifCommentExists) {
    return res.status(404).json({
      error: 'Comment not found'
    })
  }

  // Update the comment
  const updatedComment = await prisma.comment
    .update({
      where: {
        id: req.params.id // Comment id
      },
      data: {
        comment
      }
    })
    .catch((err: Error) => res.status(500).json({ error: err }))

  res.status(200).json(updatedComment)
})

// @route   DELETE api/comment/:id
// @desc    Delete a comment
// @access  Private
commentRouter.delete('/:id', async (req: Request, res: Response) => {
  // Check if cookie is set
  if (!req.cookies.token) {
    return res.status(401).json({
      error: 'You must be logged in to delete a comment'
    })
  }

  // Check if comment exists
  const ifCommentExists = await prisma.comment.findUnique({
    where: {
      id: req.params.id
    }
  })

  if (!ifCommentExists) {
    return res.status(404).json({
      error: 'Comment not found'
    })
  }

  // Delete the comment
  const deletedComment = await prisma.comment
    .delete({
      where: {
        id: req.params.id // Comment id
      }
    })
    .catch((err: Error) => res.status(500).json({ error: err }))

  res.status(200).json(deletedComment)
})

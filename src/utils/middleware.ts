import { NextFunction, Request, Response } from 'express'

import { errorMessage, info } from './logger'

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  info('Method:', req.method)
  info('Path: ', req.path)
  info('Body: ', req.body)
  info('---')
  next()
}

export const unknownEndpoint = (req: Request, res: Response) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  errorMessage(error.message)
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'invalid token' })
  } else if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'token expired' })
  }
  next(error)
}

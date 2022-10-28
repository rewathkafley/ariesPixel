// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma';
import fs from 'fs'
import path from 'path'

const filePath = path.resolve('.', 'tracker/tracker.gif')
const imageBuffer = fs.readFileSync(filePath)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const forwarded = req.headers["x-forwarded-for"]
  const ip = forwarded ? forwarded.split(/, /)[0] : req.connection.remoteAddress

  const {
    query: { campaign, content_type }
  } = req;

  // Create new food
  const pixel = await prisma.pixel.create({
    data: {
      ip_address: ip,
      campaign: `${req.query.campaign}`,
      content_type: `${content_type}`,
      city: '',
      state: '',
      user_agent: '',
    },
  });


  console.log(pixel, ip);
  
  res.setHeader('Content-Type', 'image/jpg')
  res.send(imageBuffer)
}

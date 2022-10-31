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
  const user_agent = req.headers['user-agent']

  const {
    query: { campaign, content_type }
  } = req;

  let headers = new Headers({
    "Accept"       : "application/json",
    "Content-Type" : "application/json",
    "User-Agent"   : "keycdn-tools:https://localhost"
  });

  let locationData  = await fetch(`https://tools.keycdn.com/geo.json?host=69.118.172.165`, {
    method  : 'GET', 
    headers : headers 
  })
  .then((response) => {
    return response.json();
  })
  .then((json) => {
    return json.data.geo
  });


  // Create new Pixel
  await prisma.pixel.create({
    data: {
      ip_address: `${locationData.host}`,
      campaign: `${req.query.campaign}`,
      content_type: `${content_type}`,
      city: `${locationData.city}`,
      state: `${locationData.region_code}`,
      user_agent: `${user_agent}`,
    },
  });
  
  res.setHeader('Content-Type', 'image/jpg')
  res.send(imageBuffer)
}

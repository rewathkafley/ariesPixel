// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

import { Redis } from "@upstash/redis";

const filePath = path.resolve('.', 'tracker/tracker.gif')
const imageBuffer = fs.readFileSync(filePath)


const redis = Redis.fromEnv();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const forwarded = req.headers["x-forwarded-for"]
  console.log(req.headers);
  console.log(req.socket.remoteAddress);
  const ip = forwarded ? (forwarded as string).split(/, /)[0] : req.socket.remoteAddress
  const user_agent = req.headers['user-agent']
  console.log(req.query);

  const {
    query: { campaign }
  } = req;

  let headers = new Headers({
    "Accept"       : "application/json",
    "Content-Type" : "application/json",
    "User-Agent"   : "keycdn-tools:https://example.com"
  });

  let locationData  = await fetch(`https://tools.keycdn.com/geo.json?host=${ip}`, {
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
  await redis.hset(`email-read-receipt:${locationData.host}`, {
    ip_address: `${locationData.host}`,
    campaign: `${campaign}`,
    city: `${locationData.city}`,
    country: `${locationData.country_name}`,
    state: `${locationData.region_code}`,
    user_agent: `${user_agent}`,
  });

  res.setHeader('Content-Type', 'image/gif')
  res.send(imageBuffer)//
}

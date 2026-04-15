import jwt from "jsonwebtoken";

export const generateOtp = ()=> Math.floor(100000 + Math.random()*900000).toString();

export const otpExpiryIn =  (mins = 10)=> new Date(Date.now()+mins*60*1000);


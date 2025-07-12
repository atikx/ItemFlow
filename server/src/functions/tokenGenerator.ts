import * as jwt from 'jsonwebtoken';

export const generateToken = (id : string) => {

  return jwt.sign({ org_id: id }, process.env.ACCESS_TOKEN_SECRET as string);
}; 
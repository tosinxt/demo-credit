import db from '../database/db';

export interface User {
  id?: number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  created_at?: Date;
  updated_at?: Date;
}

export const createUser = async (
  user: Omit<User, 'id' | 'created_at' | 'updated_at'>
): Promise<number[]> => {
  return await db('users').insert({
    ...user,
    created_at: new Date(),
    updated_at: new Date(),
  });
};

export const findUserByEmail = async (email: string): Promise<User | undefined> => {
  return await db('users').where({ email }).first();
};

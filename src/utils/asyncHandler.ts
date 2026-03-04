import { NextFunction, Request, Response } from "express";

type Fn = (
    req : Request, 
    res : Response, 
    next : NextFunction
) => Promise<any>

export const asyncHanlder = ( fn : Fn) => {
    return (req : Request, res : Response,  next : NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next)
    };
}
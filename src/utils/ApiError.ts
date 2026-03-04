export class ApiError extends Error{
    public readonly statusCode : number;
    public readonly success : boolean;
    public readonly errors : unknown[];
    public readonly isOperational : boolean;
    
    constructor(
        statusCode : number,
        message : string = 'Something went wrong',
        errors : unknown[] = []
    ){
        super(message);

        this.statusCode = statusCode;
        this.success = false;
        this.errors = errors;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor)
    }
}
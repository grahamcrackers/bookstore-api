export interface UserAttributes {
    email: {
        token?: number;
        timestamp?: string;
        isValid: boolean;
    };
}

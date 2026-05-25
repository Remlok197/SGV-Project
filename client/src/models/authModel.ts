export interface AuthUser{
    id: number;
    name: string;
    role: string;
}


export interface AuthMetadata{
    serverDateTime: string;
    systemVersion: string;
}

export interface AuthApiResponse {
    token: string;
    user: AuthUser;
    metadata: AuthMetadata;
}

export interface UserSession{
    token: string;
    userId: number;
    userName: string;
    userRole: string;
    headerDate: string;
    headerTime: string;
}


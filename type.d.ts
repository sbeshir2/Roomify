interface AuthState {
    isSignedIn: boolean;
    username: string | null;
    usedId: string | null;
}

type AuthContext = {
    isSignedIn: boolean;
    username: string | null,
    userId: string | null,
    refreshAuth: () => Promise<boolean>;
    signIn: () => Promise<boolean>;
    signout: () => Promise<boolean>;
}